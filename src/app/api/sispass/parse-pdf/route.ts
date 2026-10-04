import { NextRequest, NextResponse } from 'next/server';
import zlib from 'zlib';

export interface ExtractedSispassBird {
  id: string;
  ringNumber: string;
  name: string;
  commonName: string;
  species: string;
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
  birthDate: string;
  dimension?: string;
  color?: string;
  origin: string;
  status: 'ACTIVE' | 'BREEDING';
  ownerName?: string;
  ownerCpf?: string;
  notes: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfRaw = buffer.toString('binary');

    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match;
    const extractedBirds: ExtractedSispassBird[] = [];
    let pageCount = 0;

    while ((match = streamRegex.exec(pdfRaw)) !== null) {
      try {
        const streamData = Buffer.from(match[1], 'binary');
        let decompressed = '';
        try {
          decompressed = zlib.inflateSync(streamData).toString('latin1');
        } catch {
          try {
            decompressed = zlib.inflateRawSync(streamData).toString('latin1');
          } catch {
            continue;
          }
        }

        // Verifica se a stream é de conteúdo de página com anilhas/tabelas
        if (!decompressed.includes('Rela') && !decompressed.includes('SISPASS') && !decompressed.includes('IBAMA') && !decompressed.includes('Anilha')) {
          continue;
        }

        pageCount++;

        // Extrai blocos com posicionamento: BT x y Td (texto) Tj ET
        const blockRegex = /BT\s+([\d.]+)\s+([\d.]+)\s+Td\s*\(([\s\S]*?)\)\s*Tj\s*ET/g;
        let bMatch;
        const pageItems: { x: number; y: number; text: string }[] = [];

        while ((bMatch = blockRegex.exec(decompressed)) !== null) {
          const x = parseFloat(bMatch[1]);
          const y = parseFloat(bMatch[2]);
          const text = bMatch[3]
            .replace(/\\([\\()])/g, '$1')
            .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
            .trim();
          if (text) {
            pageItems.push({ x, y, text });
          }
        }

        // Filtra cabeçalhos da página (título, filtros, nomes de colunas que ficam no topo y > 510)
        const dataItems = pageItems.filter(p => p.y <= 505);

        // Agrupa por coordenada Y (mesma linha da tabela, tolerância de ±3)
        const rowsByY: { y: number; items: { x: number; text: string }[] }[] = [];
        for (const item of dataItems) {
          let row = rowsByY.find(r => Math.abs(r.y - item.y) < 3.2);
          if (!row) {
            row = { y: item.y, items: [] };
            rowsByY.push(row);
          }
          row.items.push(item);
        }

        // Ordena linhas de cima para baixo
        rowsByY.sort((a, b) => b.y - a.y);

        for (const r of rowsByY) {
          let ringNumber = '';
          let color = '';
          let dimension = '';
          let type = '';
          let dateStr = '';
          let birdName = '';
          let ownerCpf = '';
          let ownerName = '';

          for (const item of r.items) {
            if (item.x < 150) {
              ringNumber = (ringNumber + ' ' + item.text).trim();
            } else if (item.x >= 150 && item.x < 240) {
              color = (color + ' ' + item.text).trim();
            } else if (item.x >= 240 && item.x < 290) {
              dimension = item.text.trim();
            } else if (item.x >= 290 && item.x < 360) {
              type = item.text.trim();
            } else if (item.x >= 360 && item.x < 420) {
              dateStr = item.text.trim();
            } else if (item.x >= 420 && item.x < 530) {
              birdName = (birdName + ' ' + item.text).trim();
            } else if (item.x >= 530 && item.x < 610) {
              ownerCpf = item.text.trim();
            } else if (item.x >= 610) {
              ownerName = (ownerName + ' ' + item.text).trim();
            }
          }

          // Se identificou um número de anilha válido
          if (ringNumber && ringNumber.length >= 4 && !ringNumber.toLowerCase().includes('número')) {
            // Limpa caracteres especiais do nome se tiver
            birdName = birdName.replace(/\s+/g, ' ').trim();

            // Detecta dimensão a partir do texto da anilha se a coluna estava vazia
            if (!dimension) {
              if (ringNumber.includes('2.2') || ringNumber.includes('2,2')) dimension = '2.2';
              else if (ringNumber.includes('2.8') || ringNumber.includes('2,8')) dimension = '2.8';
              else if (ringNumber.includes('3.5') || ringNumber.includes('3,5')) dimension = '3.5';
              else if (ringNumber.includes('2.0') || ringNumber.includes('2,0')) dimension = '2.0';
            }

            // Inferência inteligente da Espécie
            let species = 'Canário-da-terra (Sicalis flaveola)';
            let commonName = 'Canário-da-terra';

            const nameLow = birdName.toLowerCase();
            const ringLow = ringNumber.toLowerCase();

            if (nameLow.includes('canario') || nameLow.includes('canário') || dimension === '2.8' || ringLow.includes('2.8')) {
              species = 'Sicalis flaveola';
              commonName = 'Canário-da-terra';
            } else if (nameLow.includes('coleiro') || nameLow.includes('papa-capim') || dimension === '2.2' || ringLow.includes('2.2')) {
              species = 'Sporophila caerulescens';
              commonName = 'Coleiro / Papa-Capim';
            } else if (nameLow.includes('trinca') || dimension === '3.5' || ringLow.includes('3.5')) {
              species = 'Saltator similis';
              commonName = 'Trinca-Ferro';
            } else if (nameLow.includes('azulão') || nameLow.includes('azulao')) {
              species = 'Cyanoloxia brissonii';
              commonName = 'Azulão';
            } else if (nameLow.includes('curió') || nameLow.includes('curio')) {
              species = 'Oryzoborus angolensis';
              commonName = 'Curió';
            } else if (dimension === '2.0') {
              species = 'Sporophila lineola';
              commonName = 'Bigodinho';
            }

            // Inferência do Sexo (Fêmea se contiver nomes femininos explícitos)
            let sex: 'MALE' | 'FEMALE' | 'UNKNOWN' = 'MALE';
            const femaleKeywords = ['rainha', 'princesa', 'madonna', 'maikeli', 'flor de liz', 'menina', 'dourada', 'linda', 'matriz'];
            if (femaleKeywords.some(kw => nameLow.includes(kw))) {
              sex = 'FEMALE';
            }

            // Formatação de data (DD/MM/YYYY para YYYY-MM-DD)
            let formattedDate = new Date().toISOString().split('T')[0];
            if (dateStr && dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3 && parts[2].length === 4) {
                formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }

            // Nome final da ave
            const displayName = birdName || `${commonName} (${ringNumber.replace(/[^0-9]/g, '').slice(-4) || 'SISPASS'})`;

            extractedBirds.push({
              id: `sispass-imp-${extractedBirds.length + 1}-${Date.now().toString(36)}`,
              ringNumber,
              name: displayName,
              commonName,
              species,
              sex,
              birthDate: formattedDate,
              dimension: dimension || undefined,
              color: color || undefined,
              origin: 'Relação Oficial SISPASS / IBAMA',
              status: sex === 'FEMALE' ? 'BREEDING' : 'ACTIVE',
              ownerName: ownerName || undefined,
              ownerCpf: ownerCpf || undefined,
              notes: `Importado de Relação Oficial SISPASS. ${dimension ? `Dimensão: ${dimension}mm.` : ''} ${color ? `Cor: ${color}.` : ''} ${ownerName ? `Criador: ${ownerName}.` : ''}`
            });
          }
        }
      } catch (err) {
        console.warn('Erro ao decodificar stream do PDF:', err);
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      pageCount,
      count: extractedBirds.length,
      birds: extractedBirds
    });
  } catch (error: any) {
    console.error('[API SISPASS Parse PDF] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Falha ao processar arquivo PDF.'
    }, { status: 500 });
  }
}
