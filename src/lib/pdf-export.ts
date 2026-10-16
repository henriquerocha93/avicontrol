import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportPdfOptions {
  filename?: string
  widthCm?: number
  heightCm?: number
  format?: 'badge' | 'a4'
  orientation?: 'landscape' | 'portrait'
}

export interface ExportPdfResult {
  success: boolean
  blobUrl?: string
  filename?: string
  error?: string
}

export async function exportElementToPdf(
  targetElementOrId: HTMLElement | string,
  options: ExportPdfOptions = {}
): Promise<ExportPdfResult> {
  if (typeof window === 'undefined') return { success: false, error: 'Window não disponível' }

  try {
    const el = typeof targetElementOrId === 'string'
      ? document.getElementById(targetElementOrId)
      : targetElementOrId

    if (!el) {
      console.warn('Elemento para geração de PDF não encontrado:', targetElementOrId)
      return { success: false, error: 'Elemento não encontrado no DOM' }
    }

    // 1. Aguarda fontes carregarem para evitar textos quebrados
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready
      } catch {}
    }

    const isBadge = options.format === 'badge' || (!options.format && (options.widthCm || 9) <= 15)
    const targetW = options.widthCm || (isBadge ? 9 : 29.7)
    const targetH = options.heightCm || (isBadge ? 6 : 21)
    const orientation = options.orientation || (targetW >= targetH ? 'landscape' : 'portrait')

    // 2. html2canvas com viewport virtual expandido para mobile (evita que a tela estreita do celular corte o crachá/árvore)
    const canvas = await html2canvas(el, {
      scale: 2, // 2x para nitidez e rapidez sem esgotar memória no mobile
      useCORS: true,
      allowTaint: false, // false obrigatório para evitar SecurityError no toDataURL
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: Math.max(1400, el.scrollWidth || 1200),
      windowHeight: Math.max(900, el.scrollHeight || 800),
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const targetId = typeof targetElementOrId === 'string' ? targetElementOrId : el.id
        const clonedEl = targetId ? clonedDoc.getElementById(targetId) : null
        const root = clonedEl || clonedDoc.body

        // Remove SVGs decorativos com <pattern> que quebram o parser do html2canvas
        const svgs = root.querySelectorAll('svg')
        svgs.forEach(svg => {
          if (svg.querySelector('pattern')) {
            svg.remove()
          }
        })

        // Reseta transformações de escala responsivas para capturar no tamanho 100% nativo
        const scaledElements = root.querySelectorAll('[style*="scale"]')
        scaledElements.forEach(item => {
          const htmlItem = item as HTMLElement
          if (htmlItem.style.transform && htmlItem.style.transform.includes('scale')) {
            htmlItem.style.transform = 'none'
            htmlItem.style.marginBottom = '0px'
          }
        })

        // Reseta wrappers de crachás responsivos para não recortar a altura ou largura no mobile
        const wrappers = root.querySelectorAll('.badge-print-card-wrapper')
        wrappers.forEach(w => {
          const hw = w as HTMLElement
          hw.style.height = 'auto'
          hw.style.maxWidth = 'none'
          hw.style.width = 'auto'
          hw.style.overflow = 'visible'
        })
        const inners = root.querySelectorAll('.badge-print-card-inner')
        inners.forEach(i => {
          const hi = i as HTMLElement
          hi.style.transform = 'none'
        })

        if (clonedEl) {
          clonedEl.style.overflow = 'visible'
          clonedEl.style.transform = 'none'
          clonedEl.style.maxWidth = 'none'
        }
      }
    })

    let imgData = ''
    try {
      imgData = canvas.toDataURL('image/jpeg', 0.95)
    } catch {
      imgData = canvas.toDataURL()
    }

    // 3. Monta o PDF nas medidas exatas em cm
    const pdf = new jsPDF({
      orientation,
      unit: 'cm',
      format: [targetW, targetH]
    })

    pdf.addImage(imgData, 'JPEG', 0, 0, targetW, targetH, undefined, 'FAST')

    const cleanFilename = (options.filename || 'documento')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .toLowerCase()
    const fullFilename = `${cleanFilename}.pdf`

    // 4. Cria o Blob em memória
    const pdfBlob = pdf.output('blob')
    const blobUrl = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }))

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    // 5. Download e abertura otimizados para Android, iPhone e Desktop
    if (isIOS) {
      // No iOS (iPhone Safari), abrir a URL do blob abre o leitor PDF nativo em tela cheia com zoom, print e compartilhar
      window.open(blobUrl, '_blank')
    } else {
      // No Android e Desktop, dispara o download com tag <a>
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fullFilename
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()

      // Fallback no Android: se o navegador bloquear o download silencioso, abre o leitor em aba limpa
      if (isMobile) {
        setTimeout(() => {
          window.open(blobUrl, '_blank')
        }, 300)
      }

      setTimeout(() => {
        try {
          document.body.removeChild(link)
        } catch {}
      }, 1000)
    }

    return { success: true, blobUrl, filename: fullFilename }
  } catch (error: any) {
    console.error('Falha ao exportar PDF via html2canvas/jsPDF:', error)
    return { success: false, error: error?.message || 'Falha ao processar PDF' }
  }
}
