import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportPdfOptions {
  filename?: string
  widthCm?: number
  heightCm?: number
  format?: 'badge' | 'a4'
  orientation?: 'landscape' | 'portrait'
}

export async function exportElementToPdf(
  targetElementOrId: HTMLElement | string,
  options: ExportPdfOptions = {}
): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    const el = typeof targetElementOrId === 'string'
      ? document.getElementById(targetElementOrId)
      : targetElementOrId

    if (!el) {
      console.warn('Elemento para geração de PDF não encontrado:', targetElementOrId)
      return false
    }

    // Garante que fontes estejam carregadas
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready
      } catch {}
    }

    const isBadge = options.format === 'badge' || (!options.format && (options.widthCm || 9) <= 15)
    const targetW = options.widthCm || (isBadge ? 9 : 29.7)
    const targetH = options.heightCm || (isBadge ? 6 : 21)
    const orientation = options.orientation || (targetW >= targetH ? 'landscape' : 'portrait')

    // Captura com html2canvas em alta resolução
    const canvas = await html2canvas(el, {
      scale: 2, // 2x para nitidez perfeita no mobile sem sobrecarregar memória
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // Cria o documento PDF no tamanho exato
    const pdf = new jsPDF({
      orientation,
      unit: 'cm',
      format: [targetW, targetH]
    })

    pdf.addImage(imgData, 'JPEG', 0, 0, targetW, targetH, undefined, 'FAST')

    const cleanFilename = (options.filename || 'documento')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .toLowerCase()

    // 1. No mobile, tenta primeiro a Web Share API nativa (compartilhar / salvar em arquivos)
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.share) {
      try {
        const blob = pdf.output('blob')
        const file = new File([blob], `${cleanFilename}.pdf`, { type: 'application/pdf' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: options.filename || 'Crachá Oficial BIRDPRO',
            text: 'PDF gerado pela plataforma BIRDPRO'
          })
          return true
        }
      } catch (shareErr) {
        // Se usuário cancelou o compartilhamento ou não suportou, continua para download direto
        console.warn('Compartilhamento nativo cancelado ou indisponível:', shareErr)
      }
    }

    // 2. Download direto do arquivo PDF no dispositivo
    pdf.save(`${cleanFilename}.pdf`)
    return true
  } catch (error) {
    console.error('Falha ao exportar PDF via html2canvas/jsPDF:', error)
    // Fallback: tenta abrir janela de impressão do navegador se disponível
    if (typeof window !== 'undefined' && window.print) {
      try {
        window.print()
      } catch {}
    }
    return false
  }
}
