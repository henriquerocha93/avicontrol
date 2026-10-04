'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Check, 
  ArrowRight, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportToExcel } from '@/lib/utils';

interface ImportedRow {
  number: string;
  year: number;
  type: string;
  origin: string;
  birdName?: string;
  species?: string;
  sex?: string;
  isDuplicate: boolean;
  isValid: boolean;
  error?: string;
}

export default function ImportacaoPage() {
  const { tenant } = useAuth();

  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const existingRings = db.getRings(tenant?.id);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setSuccessCount(null);

    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/sispass/parse-pdf', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (data.success && Array.isArray(data.birds) && data.birds.length > 0) {
          const processed: ImportedRow[] = data.birds.map((item: any) => {
            const num = item.ringNumber;
            const yr = parseInt(item.birthDate?.slice(0, 4)) || 2026;
            const tp = item.ringNumber.includes('2.2') ? 'SISPASS 2.2mm' : item.ringNumber.includes('2.8') ? 'SISPASS 2.8mm' : 'SISPASS Oficial';
            const orig = item.origin || 'IBAMA SISPASS';
            const birdNm = item.name;
            const spec = item.species || item.commonName;
            const sx = item.sex;

            const isDuplicate = existingRings.some(r => r.number.toLowerCase().trim() === num.toLowerCase().trim());
            const isValid = !!num && num.length >= 3;

            return {
              number: num,
              year: yr,
              type: tp,
              origin: orig,
              birdName: birdNm,
              species: spec,
              sex: sx,
              isDuplicate,
              isValid,
              error: !isValid ? 'Número da anilha inválido ou vazio' : isDuplicate ? 'Anilha já cadastrada no sistema' : undefined
            };
          });

          setRows(processed);
          setIsProcessing(false);
          return;
        } else {
          alert('Não foi possível identificar dados de anilhas no PDF enviado. Certifique-se de que é um documento oficial do SISPASS/IBAMA.');
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        console.error('Erro ao processar PDF:', err);
        alert('Erro ao processar arquivo PDF.');
        setIsProcessing(false);
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        // Process rows & detect duplicates
        const processed: ImportedRow[] = data.map((item) => {
          const num = String(item['Numero'] || item['numero'] || item['Anilha'] || item['anilha'] || item['Number'] || item['number'] || '').trim();
          const yr = Number(item['Ano'] || item['ano'] || item['Year'] || 2026);
          const tp = String(item['Tipo'] || item['tipo'] || item['Type'] || 'FOB Oficial').trim();
          const orig = String(item['Origem'] || item['origem'] || item['Origin'] || 'Federação Ornitológica').trim();
          const birdNm = item['Nome_Ave'] || item['Nome'] || item['Ave'] || item['ave'] || '';
          const spec = item['Especie'] || item['especie'] || '';
          const sx = item['Sexo'] || item['sexo'] || 'UNKNOWN';

          const isDuplicate = existingRings.some(r => r.number.toLowerCase() === num.toLowerCase());
          const isValid = !!num && num.length >= 3;

          return {
            number: num,
            year: yr || 2026,
            type: tp,
            origin: orig,
            birdName: birdNm,
            species: spec,
            sex: sx,
            isDuplicate,
            isValid,
            error: !isValid ? 'Número da anilha inválido ou vazio' : isDuplicate ? 'Anilha já cadastrada no sistema' : undefined
          };
        });

        setRows(processed);
        setIsProcessing(false);
      } catch (err) {
        alert('Erro ao processar arquivo. Certifique-se que o formato é XLSX ou CSV válido.');
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Numero: 'FOB-2026-BR-0101',
        Ano: 2026,
        Tipo: 'FOB 2.8mm',
        Origem: 'FOB Federação',
        Nome_Ave: 'Canário Ouro Modelo',
        Especie: 'Canário da Terra',
        Sexo: 'MALE'
      },
      {
        Numero: 'FOB-2026-BR-0102',
        Ano: 2026,
        Tipo: 'FOB 2.8mm',
        Origem: 'FOB Federação',
        Nome_Ave: 'Canário Matriz Modelo',
        Especie: 'Canário da Terra',
        Sexo: 'FEMALE'
      },
      {
        Numero: 'SISPASS-2026-SP-5501',
        Ano: 2026,
        Tipo: 'SISPASS Aço Inox 3.0mm',
        Origem: 'IBAMA SISPASS',
        Nome_Ave: '',
        Especie: '',
        Sexo: ''
      }
    ];
    exportToExcel(templateData, 'Modelo_Importacao_Anilhas_BIRDPRO', 'Anilhas');
  };

  const handleConfirmImport = () => {
    const validRows = rows.filter(r => r.isValid && !r.isDuplicate);
    if (validRows.length === 0) {
      alert('Não há novos registros válidos para importar.');
      return;
    }

    validRows.forEach(r => {
      // 1. Add Ring
      const newRing = db.addRing({
        tenantId: tenant?.id || 'tenant-demo-01',
        number: r.number,
        year: r.year,
        type: r.type,
        origin: r.origin,
        acquisitionDate: new Date().toISOString().split('T')[0],
        status: r.birdName ? 'USED' : 'IN_STOCK',
        notes: 'Importado em lote via arquivo de planilha.'
      });

      // 2. If bird name exists, create bird
      if (r.birdName) {
        db.addBird({
          tenantId: tenant?.id || 'tenant-demo-01',
          name: r.birdName,
          ringNumber: r.number,
          species: r.species || 'Canário da Terra (Sicalis flaveola)',
          sex: (r.sex === 'MALE' || r.sex === 'FEMALE') ? r.sex : 'UNKNOWN',
          status: 'ACTIVE',
          origin: 'BRED_HERE',
          entryDate: new Date().toISOString().split('T')[0],
          isPublic: true
        });
      }
    });

    setSuccessCount(validRows.length);
    setRows([]);
    setFileName('');
  };

  const validCount = rows.filter(r => r.isValid && !r.isDuplicate).length;
  const duplicateCount = rows.filter(r => r.isDuplicate).length;
  const errorCount = rows.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Importação de Anilhas & Plantel</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Importe centenas de anilhas e aves instantaneamente a partir de documentos PDF (SISPASS / IBAMA com múltiplas folhas) ou planilhas Excel (.xlsx) e CSV.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
          <Download className="w-4 h-4 mr-1.5" />
          Baixar Modelo de Planilha (.xlsx)
        </Button>
      </div>

      {/* Success Banner */}
      {successCount !== null && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-950">
                Importação concluída com sucesso!
              </p>
              <p className="text-xs text-emerald-800">
                {successCount} registro{successCount !== 1 ? 's foram' : ' foi'} importado{successCount !== 1 ? 's' : ''} e cadastrado{successCount !== 1 ? 's' : ''} no banco de dados.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setSuccessCount(null)}>OK</Button>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-300 text-center space-y-4 hover:border-emerald-500 transition-colors">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            {fileName ? `Arquivo selecionado: ${fileName}` : 'Arraste ou selecione seu arquivo de anilhas'}
          </h3>
          <p className="text-xs text-slate-500">
            Formatos suportados: <strong className="text-emerald-700">.PDF</strong> (Relação de Anilhas SISPASS / IBAMA de até dezenas de páginas), <strong className="text-slate-700">.XLSX, .XLS, .CSV</strong>. O sistema detectará automaticamente todas as páginas, duplicidades e colunas.
          </p>
        </div>

        {isProcessing && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl max-w-sm mx-auto flex items-center justify-center gap-3 text-xs text-emerald-900 font-bold animate-pulse">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Processando páginas do documento PDF / Planilha...</span>
          </div>
        )}

        <div className="pt-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf, .xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center font-bold text-xs h-10 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer transition-all hover:scale-102">
              <UploadCloud className="w-4 h-4 mr-2" />
              Selecionar Arquivo do Computador (PDF ou Planilha)
            </span>
          </label>
        </div>
      </div>

      {/* Preview Table & Validation Report */}
      {rows.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-200">
          {/* Summary KPIs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Pré-visualização da Importação</h3>
              <p className="text-xs text-slate-500">Revise os dados antes de confirmar a gravação no criatório.</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                ✓ {validCount} Válidos
              </span>
              {duplicateCount > 0 && (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  ⚠ {duplicateCount} Duplicados (Ignorados)
                </span>
              )}
              {errorCount > 0 && (
                <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                  ✕ {errorCount} Inválidos
                </span>
              )}
            </div>
          </div>

          {/* Rows List */}
          <div className="overflow-x-auto max-h-96 custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Anilha</th>
                  <th className="py-3 px-4">Ano</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Origem</th>
                  <th className="py-3 px-4">Ave Vinculada</th>
                  <th className="py-3 px-4">Espécie</th>
                  <th className="py-3 px-4">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={idx} className={row.isDuplicate ? 'bg-amber-50/40' : !row.isValid ? 'bg-rose-50/40' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4">
                      {row.isValid && !row.isDuplicate ? (
                        <Badge variant="success">Pronto</Badge>
                      ) : row.isDuplicate ? (
                        <Badge variant="warning">Duplicado</Badge>
                      ) : (
                        <Badge variant="danger">Erro</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.number || '---'}</td>
                    <td className="py-3 px-4 text-slate-600">{row.year}</td>
                    <td className="py-3 px-4 text-slate-600">{row.type}</td>
                    <td className="py-3 px-4 text-slate-600">{row.origin}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.birdName || '(Sem ave)'}</td>
                    <td className="py-3 px-4 text-slate-600">{row.species || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{row.error || 'Apto para gravação'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirmation Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRows([])}>
              Cancelar e Limpar
            </Button>
            <Button onClick={handleConfirmImport} disabled={validCount === 0}>
              <Check className="w-4 h-4 mr-1.5" />
              Confirmar Importação de {validCount} Anilhas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
