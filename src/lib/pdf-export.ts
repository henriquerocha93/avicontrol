import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportPdfOptions {
  filename?: string
  widthCm?: number
  heightCm?: number
  format?: 'badge' | 'a4'
  orientation?: 'landscape' | 'portrait'
  autoDownload?: boolean
}

export interface ExportPdfResult {
  success: boolean
  blobUrl?: string
  blob?: Blob
  file?: File
  filename?: string
  error?: string
}

// Singleton 1x1 canvas para converter qualquer cor CSS moderna (oklch, oklab, color-mix, color(), lab, lch) em rgb/rgba
let colorCanvasCtx: CanvasRenderingContext2D | null = null

function getColorCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  if (!colorCanvasCtx) {
    const c = document.createElement('canvas')
    c.width = 1
    c.height = 1
    colorCanvasCtx = c.getContext('2d', { willReadFrequently: true })
  }
  return colorCanvasCtx
}

export function cssColorToRgba(colorStr: string | null | undefined, fallback = 'rgba(0, 0, 0, 0)'): string {
  if (!colorStr) return fallback
  const trimmed = colorStr.trim()
  if (!trimmed || trimmed === 'transparent' || trimmed === 'none' || trimmed === 'rgba(0, 0, 0, 0)') {
    return 'rgba(0, 0, 0, 0)'
  }
  // Se já for hex ou rgb/rgba simples sem funções modernas, retorna direto
  if (
    (trimmed.startsWith('#') || trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) &&
    !/(oklch|oklab|color-mix|color\(|lab\(|lch\()/i.test(trimmed)
  ) {
    return trimmed
  }

  const ctx = getColorCtx()
  if (!ctx) return fallback

  try {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.fillStyle = trimmed
    ctx.fillRect(0, 0, 1, 1)
    const data = ctx.getImageData(0, 0, 1, 1).data
    const [r, g, b, a] = [data[0], data[1], data[2], data[3]]
    if (a === 0) return 'rgba(0, 0, 0, 0)'
    if (a === 255) return `rgb(${r}, ${g}, ${b})`
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
  } catch {
    return fallback
  }
}

export function sanitizeCssValueForHtml2Canvas(val: string | null | undefined): string {
  if (!val || val === 'none') return val || 'none'
  let res = val
  // Corrige linear-gradient(in oklab, ...) -> linear-gradient(to bottom, ...)
  res = res.replace(/linear-gradient\(\s*in\s+[a-z0-9-]+\s*,/gi, 'linear-gradient(to bottom, ')
  res = res.replace(/radial-gradient\(\s*in\s+[a-z0-9-]+\s*,/gi, 'radial-gradient(')
  res = res.replace(/\s+in\s+(oklab|oklch|srgb|srgb-linear|display-p3|hsl|hwb|lab|lch)\b/gi, '')
  // Substitui funções oklch(...), oklab(...), color(...), lab(...), lch(...)
  res = res.replace(/(?:oklch|oklab|color-mix|color|lab|lch)\([^()]*(?:\([^()]*\)[^()]*)*\)/gi, (match) => {
    return cssColorToRgba(match, 'rgb(15, 23, 42)')
  })
  if (/(oklch|oklab|color-mix|color\(|lab\(|lch\()/i.test(res)) {
    return 'none'
  }
  return res
}

function isTransparentColor(c: string): boolean {
  if (!c || c === 'transparent' || c === 'none' || c === 'rgba(0, 0, 0, 0)') return true
  const m = c.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/)
  if (m && parseFloat(m[1]) <= 0.001) return true
  return false
}

// Carrega uma imagem garantindo que não vá travar nem causar SecurityError (tainted canvas) no mobile
async function loadSafeImage(src: string, timeoutMs = 4000): Promise<HTMLImageElement | null> {
  if (!src || typeof window === 'undefined') return null
  return new Promise((resolve) => {
    let settled = false
    const done = (img: HTMLImageElement | null) => {
      if (settled) return
      settled = true
      resolve(img)
    }

    const timer = setTimeout(() => done(null), timeoutMs)
    const img = new Image()
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous'
    }

    img.onload = () => {
      clearTimeout(timer)
      try {
        const testCanvas = document.createElement('canvas')
        testCanvas.width = 1
        testCanvas.height = 1
        const tCtx = testCanvas.getContext('2d')
        if (tCtx) {
          tCtx.drawImage(img, 0, 0, 1, 1)
          tCtx.getImageData(0, 0, 1, 1)
        }
        done(img)
      } catch {
        // Imagem sem cabeçalho CORS: ignora com segurança para não bloquear o PDF no iOS/Android
        done(null)
      }
    }

    img.onerror = () => {
      clearTimeout(timer)
      done(null)
    }

    img.src = src
  })
}

// Converte qualquer elemento <svg> (QR Code, linhas conectoras, faixas, brasões) em HTMLImageElement nítido
async function svgElementToImage(svgEl: SVGSVGElement, targetW: number, targetH: number, scale = 3): Promise<HTMLImageElement | null> {
  try {
    const clone = svgEl.cloneNode(true) as SVGSVGElement
    const w = Math.max(1, Math.round(targetW * scale))
    const h = Math.max(1, Math.round(targetH * scale))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', String(w))
    clone.setAttribute('height', String(h))

    const computed = window.getComputedStyle(svgEl)
    const resolvedColor = cssColorToRgba(computed.color, 'rgb(0, 0, 0)')
    clone.style.color = resolvedColor

    // Converte cores modernas em elementos internos do SVG se houver
    const origChildren = Array.from(svgEl.querySelectorAll('*'))
    const cloneChildren = Array.from(clone.querySelectorAll('*'))
    for (let i = 0; i < cloneChildren.length; i++) {
      const origChild = origChildren[i]
      const cChild = cloneChildren[i] as SVGElement
      if (origChild && cChild) {
        const cs = window.getComputedStyle(origChild)
        const stroke = cChild.getAttribute('stroke')
        if (stroke === 'currentColor' || (cs.stroke && /(oklch|oklab|color)/i.test(cs.stroke))) {
          cChild.setAttribute('stroke', cssColorToRgba(cs.stroke === 'none' ? cs.color : cs.stroke, resolvedColor))
        }
        const fill = cChild.getAttribute('fill')
        if (fill === 'currentColor' || (cs.fill && /(oklch|oklab|color)/i.test(cs.fill))) {
          cChild.setAttribute('fill', cssColorToRgba(cs.fill === 'none' ? cs.color : cs.fill, resolvedColor))
        }
      }
    }

    const xml = new XMLSerializer().serializeToString(clone)
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`
    return await loadSafeImage(svgDataUrl, 2500)
  } catch {
    return null
  }
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rTL: number,
  rTR: number,
  rBR: number,
  rBL: number
) {
  const maxR = Math.min(w / 2, h / 2)
  const tl = Math.min(Math.max(0, rTL), maxR)
  const tr = Math.min(Math.max(0, rTR), maxR)
  const br = Math.min(Math.max(0, rBR), maxR)
  const bl = Math.min(Math.max(0, rBL), maxR)

  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  if (tr > 0) ctx.arcTo(x + w, y, x + w, y + tr, tr)
  ctx.lineTo(x + w, y + h - br)
  if (br > 0) ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
  ctx.lineTo(x + bl, y + h)
  if (bl > 0) ctx.arcTo(x, y + h, x, y + h - bl, bl)
  ctx.lineTo(x, y + tl)
  if (tl > 0) ctx.arcTo(x, y, x + tl, y, tl)
  ctx.closePath()
}

function drawImageWithObjectFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  fit: string
) {
  const iw = img.naturalWidth || img.width || w
  const ih = img.naturalHeight || img.height || h
  if (iw <= 0 || ih <= 0 || w <= 0 || h <= 0) return

  if (fit === 'contain') {
    const scale = Math.min(w / iw, h / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = x + (w - dw) / 2
    const dy = y + (h - dh) / 2
    ctx.drawImage(img, dx, dy, dw, dh)
  } else if (fit === 'cover') {
    const scale = Math.max(w / iw, h / ih)
    const sw = w / scale
    const sh = h / scale
    const sx = (iw - sw) / 2
    const sy = (ih - sh) / 2
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  } else {
    ctx.drawImage(img, x, y, w, h)
  }
}

function applyTextTransform(text: string, transform: string): string {
  if (!transform || transform === 'none') return text
  if (transform === 'uppercase') return text.toUpperCase()
  if (transform === 'lowercase') return text.toLowerCase()
  if (transform === 'capitalize') {
    return text.replace(/\b\w/g, (l) => l.toUpperCase())
  }
  return text
}

/**
 * MOTOR 1 (Nativo, Rápido e Determinístico):
 * Renderiza o elemento DOM diretamente para um Canvas 2D de alta resolução (4K),
 * sem depender do parser CSS do html2canvas (totalmente imune ao erro oklch do Tailwind v4
 * e imune ao corte de tela estreita ou scroll do iOS/Android).
 */
async function renderElementDirectCanvas(
  rootEl: HTMLElement,
  nativeW: number,
  nativeH: number,
  renderScale = 3
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(nativeW * renderScale)
  canvas.height = Math.round(nativeH * renderScale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Contexto 2D indisponível')

  ctx.scale(renderScale, renderScale)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, nativeW, nativeH)

  const rootRect = rootEl.getBoundingClientRect()
  const domScaleX = rootRect.width > 10 ? rootRect.width / nativeW : 1
  const domScaleY = rootRect.height > 10 ? rootRect.height / nativeH : 1

  const toLocalRect = (r: DOMRect) => ({
    x: (r.left - rootRect.left) / domScaleX,
    y: (r.top - rootRect.top) / domScaleY,
    w: r.width / domScaleX,
    h: r.height / domScaleY
  })

  const getEffectiveOpacity = (el: Element): number => {
    let op = 1
    let curr: Element | null = el
    while (curr) {
      const cs = window.getComputedStyle(curr)
      const val = parseFloat(cs.opacity || '1')
      if (!Number.isNaN(val)) op *= val
      if (curr === rootEl) break
      curr = curr.parentElement
    }
    return Math.max(0, Math.min(1, op))
  }

  const getAncestorClipRects = (el: Element) => {
    const clips: { x: number; y: number; w: number; h: number }[] = [
      { x: 0, y: 0, w: nativeW, h: nativeH }
    ]
    let curr: Element | null = el.parentElement
    while (curr && curr !== rootEl.parentElement) {
      const cs = window.getComputedStyle(curr)
      if (
        cs.overflow === 'hidden' ||
        cs.overflowX === 'hidden' ||
        cs.overflowY === 'hidden' ||
        cs.overflow === 'clip'
      ) {
        clips.push(toLocalRect(curr.getBoundingClientRect()))
      }
      if (curr === rootEl) break
      curr = curr.parentElement
    }
    return clips
  }

  const allNodes: Element[] = [rootEl, ...Array.from(rootEl.querySelectorAll('*'))]

  for (const node of allNodes) {
    // Se for filho interno de um <svg>, pula pois o próprio <svg> será desenhado por inteiro
    if (node !== rootEl && node.closest('svg') && node.tagName.toLowerCase() !== 'svg') {
      continue
    }

    const cs = window.getComputedStyle(node)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const effOpacity = getEffectiveOpacity(node)
    if (effOpacity <= 0.005) continue

    const rawRect = node.getBoundingClientRect()
    const { x, y, w, h } = toLocalRect(rawRect)
    if (w <= 0.2 || h <= 0.2) continue

    const rTL = parseFloat(cs.borderTopLeftRadius) || 0
    const rTR = parseFloat(cs.borderTopRightRadius) || 0
    const rBR = parseFloat(cs.borderBottomRightRadius) || 0
    const rBL = parseFloat(cs.borderBottomLeftRadius) || 0

    ctx.save()

    // Aplica clip dos ancestrais com overflow: hidden
    const clips = getAncestorClipRects(node)
    for (const c of clips) {
      ctx.beginPath()
      ctx.rect(c.x, c.y, c.w, c.h)
      ctx.clip()
    }

    ctx.globalAlpha = effOpacity

    // 1. Se for <svg> (QR Code, linhas conectoras, faixas, ícones)
    if (node.tagName.toLowerCase() === 'svg') {
      const svgImg = await svgElementToImage(node as SVGSVGElement, w, h, renderScale)
      if (svgImg) {
        ctx.drawImage(svgImg, x, y, w, h)
      }
      ctx.restore()
      continue
    }

    // 2. Fundo sólido (backgroundColor)
    const bgColor = cssColorToRgba(cs.backgroundColor)
    if (!isTransparentColor(bgColor)) {
      drawRoundedRectPath(ctx, x, y, w, h, rTL, rTR, rBR, rBL)
      ctx.fillStyle = bgColor
      ctx.fill()
    }

    // 3. Gradientes e background-image (url)
    const bgImg = cs.backgroundImage
    if (bgImg && bgImg !== 'none') {
      if (bgImg.includes('gradient(')) {
        const sanitizedGrad = sanitizeCssValueForHtml2Canvas(bgImg)
        const colorMatches = sanitizedGrad.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[0-9.]+)?\s*\)|#[0-9a-fA-F]{3,8}/g)
        if (colorMatches && colorMatches.length >= 2) {
          const isVertical = bgImg.includes('to bottom') || (!bgImg.includes('to right') && !bgImg.includes('to left'))
          const grad = isVertical
            ? ctx.createLinearGradient(x, y, x, y + h)
            : ctx.createLinearGradient(x, y, x + w, y)
          colorMatches.forEach((c, idx) => {
            grad.addColorStop(idx / (colorMatches.length - 1), cssColorToRgba(c, '#0f172a'))
          })
          drawRoundedRectPath(ctx, x, y, w, h, rTL, rTR, rBR, rBL)
          ctx.fillStyle = grad
          ctx.fill()
        }
      } else if (bgImg.includes('url(')) {
        const urlMatch = bgImg.match(/url\(["']?([^"')]+)["']?\)/)
        if (urlMatch && urlMatch[1]) {
          const loadedBg = await loadSafeImage(urlMatch[1])
          if (loadedBg) {
            ctx.save()
            drawRoundedRectPath(ctx, x, y, w, h, rTL, rTR, rBR, rBL)
            ctx.clip()
            const fit = cs.backgroundSize === 'contain' ? 'contain' : 'cover'
            drawImageWithObjectFit(ctx, loadedBg, x, y, w, h, fit)
            ctx.restore()
          }
        }
      }
    }

    // 4. Se for elemento <img> (brasão, logo ou foto da ave)
    if (node.tagName.toLowerCase() === 'img') {
      const imgNode = node as HTMLImageElement
      const src = imgNode.currentSrc || imgNode.src
      if (src) {
        const safeImg = await loadSafeImage(src)
        if (safeImg) {
          ctx.save()
          drawRoundedRectPath(ctx, x, y, w, h, rTL, rTR, rBR, rBL)
          ctx.clip()
          drawImageWithObjectFit(ctx, safeImg, x, y, w, h, cs.objectFit || 'contain')
          ctx.restore()
        }
      }
    }

    // 5. Bordas (Uniformes ou por lado individual)
    const bT = parseFloat(cs.borderTopWidth) || 0
    const bR = parseFloat(cs.borderRightWidth) || 0
    const bB = parseFloat(cs.borderBottomWidth) || 0
    const bL = parseFloat(cs.borderLeftWidth) || 0

    const sT = cs.borderTopStyle
    const sR = cs.borderRightStyle
    const sB = cs.borderBottomStyle
    const sL = cs.borderLeftStyle

    const hasUniformBorder =
      bT > 0 &&
      sT !== 'none' &&
      Math.abs(bT - bR) < 0.2 &&
      Math.abs(bT - bB) < 0.2 &&
      Math.abs(bT - bL) < 0.2 &&
      sT === sR &&
      sT === sB &&
      sT === sL

    if (hasUniformBorder) {
      const bColor = cssColorToRgba(cs.borderTopColor)
      if (!isTransparentColor(bColor)) {
        const half = bT / 2
        drawRoundedRectPath(
          ctx,
          x + half,
          y + half,
          Math.max(0, w - bT),
          Math.max(0, h - bT),
          Math.max(0, rTL - half),
          Math.max(0, rTR - half),
          Math.max(0, rBR - half),
          Math.max(0, rBL - half)
        )
        ctx.strokeStyle = bColor
        ctx.lineWidth = bT
        if (sT === 'dashed') ctx.setLineDash([4, 3])
        ctx.stroke()
        ctx.setLineDash([])
      }
    } else {
      if (bT > 0 && sT !== 'none') {
        const c = cssColorToRgba(cs.borderTopColor)
        if (!isTransparentColor(c)) {
          ctx.beginPath()
          ctx.moveTo(x, y + bT / 2)
          ctx.lineTo(x + w, y + bT / 2)
          ctx.strokeStyle = c
          ctx.lineWidth = bT
          ctx.stroke()
        }
      }
      if (bB > 0 && sB !== 'none') {
        const c = cssColorToRgba(cs.borderBottomColor)
        if (!isTransparentColor(c)) {
          ctx.beginPath()
          ctx.moveTo(x, y + h - bB / 2)
          ctx.lineTo(x + w, y + h - bB / 2)
          ctx.strokeStyle = c
          ctx.lineWidth = bB
          ctx.stroke()
        }
      }
      if (bL > 0 && sL !== 'none') {
        const c = cssColorToRgba(cs.borderLeftColor)
        if (!isTransparentColor(c)) {
          ctx.beginPath()
          ctx.moveTo(x + bL / 2, y)
          ctx.lineTo(x + bL / 2, y + h)
          ctx.strokeStyle = c
          ctx.lineWidth = bL
          ctx.stroke()
        }
      }
      if (bR > 0 && sR !== 'none') {
        const c = cssColorToRgba(cs.borderRightColor)
        if (!isTransparentColor(c)) {
          ctx.beginPath()
          ctx.moveTo(x + w - bR / 2, y)
          ctx.lineTo(x + w - bR / 2, y + h)
          ctx.strokeStyle = c
          ctx.lineWidth = bR
          ctx.stroke()
        }
      }
    }

    // 6. Nós de texto diretos deste elemento
    const childNodes = Array.from(node.childNodes)
    for (const child of childNodes) {
      if (child.nodeType !== Node.TEXT_NODE) continue
      const rawText = child.textContent || ''
      if (!rawText.trim()) continue

      const normalized = rawText.replace(/\s+/g, ' ')
      const transformedText = applyTextTransform(normalized, cs.textTransform)

      const range = document.createRange()
      range.selectNodeContents(child)
      const tRectRaw = range.getBoundingClientRect()
      const tRect = toLocalRect(tRectRaw)
      if (tRect.w <= 0.1 || tRect.h <= 0.1) continue

      const fontSize = parseFloat(cs.fontSize) || 10
      const fontWeight = cs.fontWeight || '400'
      const fontStyle = cs.fontStyle || 'normal'
      const fontFamily = cs.fontFamily || 'Arial, Helvetica, sans-serif'
      const textColor = cssColorToRgba(cs.color, '#000000')

      ctx.save()

      // Se o próprio elemento tiver overflow hidden (ex: .truncate), aplica clip na caixa interna do elemento
      if (cs.overflow === 'hidden' || cs.overflowX === 'hidden') {
        ctx.beginPath()
        ctx.rect(x, y, w, h)
        ctx.clip()
      }

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.fillStyle = textColor
      ctx.textBaseline = 'middle'

      // Sombra de destaque se o elemento tiver drop-shadow (ex: faixa dourada do certificado)
      if (cs.filter && cs.filter.includes('drop-shadow')) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)'
        ctx.shadowBlur = 2
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 1
      }

      // Texto vertical (ex: "Validação:" no certificado A4)
      if (cs.writingMode && cs.writingMode.includes('vertical')) {
        ctx.translate(tRect.x + tRect.w / 2, tRect.y + tRect.h / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.textAlign = 'center'
        ctx.fillText(transformedText.trim(), 0, 0)
        ctx.restore()
        continue
      }

      const padL = parseFloat(cs.paddingLeft) || 0
      const padR = parseFloat(cs.paddingRight) || 0
      const maxInnerW = Math.max(4, w - padL - padR - bL - bR)

      const isSingleLineBox =
        cs.whiteSpace === 'nowrap' ||
        cs.textOverflow === 'ellipsis' ||
        range.getClientRects().length <= 1

      if (isSingleLineBox) {
        let drawStr = childNodes.length === 1 ? transformedText.trim() : transformedText
        const measuredW = ctx.measureText(drawStr).width

        if ((cs.overflowX === 'hidden' || cs.textOverflow === 'ellipsis') && measuredW > maxInnerW + 1) {
          while (drawStr.length > 1 && ctx.measureText(drawStr + '…').width > maxInnerW) {
            drawStr = drawStr.slice(0, -1)
          }
          drawStr = drawStr.trimEnd() + '…'
          ctx.textAlign = 'left'
          ctx.fillText(drawStr, x + bL + padL, tRect.y + tRect.h / 2)
        } else {
          ctx.textAlign = 'left'
          ctx.fillText(drawStr, tRect.x, tRect.y + tRect.h / 2)
        }
      } else {
        // Texto multi-linha (ex: brasão fallback ou parágrafo)
        const lineRects = Array.from(range.getClientRects()).map(toLocalRect)
        const words = transformedText.trim().split(' ')
        if (lineRects.length > 0 && words.length > 0) {
          let currentLine = ''
          let lineIdx = 0
          for (let i = 0; i < words.length; i++) {
            const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i]
            const lr = lineRects[Math.min(lineIdx, lineRects.length - 1)]
            if (ctx.measureText(testLine).width > maxInnerW + 4 && currentLine) {
              ctx.textAlign = 'left'
              ctx.fillText(currentLine, lr.x, lr.y + lr.h / 2)
              currentLine = words[i]
              lineIdx++
            } else {
              currentLine = testLine
            }
          }
          if (currentLine) {
            const lr = lineRects[Math.min(lineIdx, lineRects.length - 1)]
            ctx.textAlign = 'left'
            ctx.fillText(currentLine, lr.x, lr.y + lr.h / 2)
          }
        }
      }

      ctx.restore()
    }

    ctx.restore()
  }

  return canvas
}

/**
 * MOTOR 2 (Fallback html2canvas Sanitizado):
 * Pré-converte todas as cores oklch/oklab para RGB e isola o elemento no body clonado.
 */
async function renderElementSanitizedHtml2Canvas(
  targetEl: HTMLElement,
  nativeW: number,
  nativeH: number,
  scale = 2
): Promise<HTMLCanvasElement> {
  const origNodes: Element[] = [targetEl, ...Array.from(targetEl.querySelectorAll('*'))]
  const prebakedStyles = origNodes.map((node) => {
    const cs = window.getComputedStyle(node)
    return {
      color: cssColorToRgba(cs.color, '#000000'),
      backgroundColor: cssColorToRgba(cs.backgroundColor, 'rgba(0, 0, 0, 0)'),
      borderTopColor: cssColorToRgba(cs.borderTopColor, 'rgba(0, 0, 0, 0)'),
      borderRightColor: cssColorToRgba(cs.borderRightColor, 'rgba(0, 0, 0, 0)'),
      borderBottomColor: cssColorToRgba(cs.borderBottomColor, 'rgba(0, 0, 0, 0)'),
      borderLeftColor: cssColorToRgba(cs.borderLeftColor, 'rgba(0, 0, 0, 0)'),
      textDecorationColor: cssColorToRgba(cs.textDecorationColor, '#000000'),
      webkitTextStrokeColor: cssColorToRgba(cs.webkitTextStrokeColor, 'rgba(0, 0, 0, 0)'),
      outlineColor: cssColorToRgba(cs.outlineColor, 'rgba(0, 0, 0, 0)'),
      backgroundImage: sanitizeCssValueForHtml2Canvas(cs.backgroundImage)
    }
  })

  return await html2canvas(targetEl, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width: nativeW,
    height: nativeH,
    windowWidth: Math.max(1400, nativeW + 100),
    windowHeight: Math.max(900, nativeH + 100),
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    ignoreElements: (el) => {
      const tag = el.tagName?.toUpperCase()
      if (tag === 'HEAD' || tag === 'STYLE' || tag === 'LINK' || tag === 'HTML' || tag === 'BODY') {
        return false
      }
      if (el.contains(targetEl) || targetEl.contains(el)) {
        return false
      }
      return true
    },
    onclone: (clonedDoc, clonedTarget) => {
      // 1. Sanitiza todas as tags <style> do documento clonado contra oklch/oklab
      const styles = clonedDoc.querySelectorAll('style')
      styles.forEach((st) => {
        if (st.textContent) {
          st.textContent = sanitizeCssValueForHtml2Canvas(st.textContent)
        }
      })

      // 2. Aplica os estilos RGB pré-calculados em cada nó do elemento clonado
      const clonedNodes: Element[] = [clonedTarget, ...Array.from(clonedTarget.querySelectorAll('*'))]
      clonedNodes.forEach((cNode, idx) => {
        const htmlNode = cNode as HTMLElement
        const baked = prebakedStyles[idx]
        if (htmlNode && htmlNode.style && baked) {
          htmlNode.style.setProperty('color', baked.color, 'important')
          htmlNode.style.setProperty('background-color', baked.backgroundColor, 'important')
          htmlNode.style.setProperty('border-top-color', baked.borderTopColor, 'important')
          htmlNode.style.setProperty('border-right-color', baked.borderRightColor, 'important')
          htmlNode.style.setProperty('border-bottom-color', baked.borderBottomColor, 'important')
          htmlNode.style.setProperty('border-left-color', baked.borderLeftColor, 'important')
          htmlNode.style.setProperty('text-decoration-color', baked.textDecorationColor, 'important')
          htmlNode.style.setProperty('-webkit-text-stroke-color', baked.webkitTextStrokeColor, 'important')
          htmlNode.style.setProperty('outline-color', baked.outlineColor, 'important')
          htmlNode.style.setProperty('background-image', baked.backgroundImage, 'important')
          htmlNode.style.setProperty('box-shadow', 'none', 'important')
          htmlNode.style.setProperty('text-shadow', 'none', 'important')
        }
      })

      // 3. Remove SVGs com <pattern> que travam o html2canvas
      const svgs = clonedTarget.querySelectorAll('svg')
      svgs.forEach((svg) => {
        if (svg.querySelector('pattern')) {
          svg.remove()
        }
      })

      // 4. Isola o elemento clonado diretamente no (0, 0) do body para evitar cortes no mobile
      clonedDoc.documentElement.style.cssText = 'margin:0!important;padding:0!important;background:#ffffff!important;color:#000000!important;'
      clonedDoc.body.innerHTML = ''
      clonedDoc.body.style.cssText = `margin:0!important;padding:0!important;background:#ffffff!important;color:#000000!important;width:${nativeW}px!important;height:${nativeH}px!important;overflow:visible!important;`
      clonedDoc.body.appendChild(clonedTarget)

      clonedTarget.style.setProperty('position', 'relative', 'important')
      clonedTarget.style.setProperty('left', '0px', 'important')
      clonedTarget.style.setProperty('top', '0px', 'important')
      clonedTarget.style.setProperty('margin', '0px', 'important')
      clonedTarget.style.setProperty('transform', 'none', 'important')
      clonedTarget.style.setProperty('width', `${nativeW}px`, 'important')
      clonedTarget.style.setProperty('min-width', `${nativeW}px`, 'important')
      clonedTarget.style.setProperty('max-width', `${nativeW}px`, 'important')
      clonedTarget.style.setProperty('height', `${nativeH}px`, 'important')
      clonedTarget.style.setProperty('min-height', `${nativeH}px`, 'important')
      clonedTarget.style.setProperty('max-height', `${nativeH}px`, 'important')
    }
  })
}

async function captureCardToCanvas(
  cardEl: HTMLElement,
  nativeW: number,
  nativeH: number,
  scale = 3
): Promise<HTMLCanvasElement> {
  try {
    return await renderElementDirectCanvas(cardEl, nativeW, nativeH, scale)
  } catch (err) {
    console.warn('Motor nativo de Canvas encontrou aviso, acionando fallback html2canvas:', err)
    return await renderElementSanitizedHtml2Canvas(cardEl, nativeW, nativeH, Math.min(2, scale))
  }
}

/**
 * Dispara o download direto do arquivo PDF em iOS, Android e Desktop
 * sem usar target="_blank" (que aciona o bloqueador de pop-ups em celulares).
 */
export function triggerPdfDownload(blobUrl: string, filename: string, blob?: Blob): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

  try {
    const nav = window.navigator as any
    if (blob && nav && typeof nav.msSaveOrOpenBlob === 'function') {
      nav.msSaveOrOpenBlob(blob, cleanFilename)
      return
    }

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = cleanFilename
    link.rel = 'noopener'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      try {
        if (link.parentNode) {
          document.body.removeChild(link)
        }
      } catch {}
    }, 2500)
  } catch (e) {
    console.warn('Erro ao acionar link de download, abrindo URL direta:', e)
    window.location.assign(blobUrl)
  }
}

/**
 * Abre o menu nativo de compartilhamento do iOS (Salvar em Arquivos / AirPrint / WhatsApp)
 * ou Android (WhatsApp / Salvar no Dispositivo / Imprimir). Caso não suportado, baixa direto.
 */
export async function shareOrDownloadPdf(result: ExportPdfResult): Promise<boolean> {
  if (!result.success || !result.blobUrl) return false
  const filename = result.filename || 'cracha.pdf'

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && result.file) {
    try {
      const canShareFiles =
        typeof navigator.canShare === 'function' ? navigator.canShare({ files: [result.file] }) : true
      if (canShareFiles) {
        await navigator.share({
          files: [result.file],
          title: filename,
          text: 'Documento Oficial BirdPro'
        })
        return true
      }
    } catch (err: any) {
      // Se o usuário apenas fechou o menu de compartilhamento (AbortError), não faz nada
      if (err?.name === 'AbortError') return false
    }
  }

  triggerPdfDownload(result.blobUrl, filename, result.blob)
  return true
}

export async function exportElementToPdf(
  targetElementOrId: HTMLElement | string,
  options: ExportPdfOptions = {}
): Promise<ExportPdfResult> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { success: false, error: 'Ambiente de navegador não disponível' }
  }

  try {
    const el =
      typeof targetElementOrId === 'string'
        ? document.getElementById(targetElementOrId)
        : targetElementOrId

    if (!el) {
      console.warn('Elemento para geração de PDF não encontrado:', targetElementOrId)
      return { success: false, error: 'Elemento não encontrado na tela' }
    }

    // Aguarda fontes carregarem com timeout curto (300ms) para não perder o gesto de toque no iOS/Android
    if (document.fonts && document.fonts.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 300))
        ])
      } catch {}
    }

    const isBadge =
      options.format === 'badge' ||
      el.id === 'printable-badge' ||
      (!options.format && (options.widthCm || 9) <= 15)

    const targetW = options.widthCm || (isBadge ? 9 : 29.7)
    const targetH = options.heightCm || (isBadge ? 6 : 21)
    const orientation = options.orientation || (targetW >= targetH ? 'landscape' : 'portrait')

    const pdf = new jsPDF({
      orientation,
      unit: 'cm',
      format: [targetW, targetH],
      compress: true
    })

    if (isBadge) {
      // Localiza os cartões de 540x360 individuais (Frente e/ou Verso) dentro do #printable-badge
      const innerCards = Array.from(el.querySelectorAll('.badge-print-card-inner')) as HTMLElement[]
      const cardsToRender: HTMLElement[] =
        innerCards.length > 0
          ? innerCards.map((inner) => (inner.firstElementChild as HTMLElement) || inner)
          : [el]

      for (let i = 0; i < cardsToRender.length; i++) {
        if (i > 0) {
          pdf.addPage([targetW, targetH], orientation)
        }
        const cardNode = cardsToRender[i]
        const cardCanvas = await captureCardToCanvas(cardNode, 540, 360, 3)
        let imgData = ''
        try {
          imgData = cardCanvas.toDataURL('image/jpeg', 0.96)
        } catch {
          imgData = cardCanvas.toDataURL()
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, targetW, targetH, undefined, 'FAST')
      }
    } else {
      // Certificado A4 Paisagem (1180x780 ou tamanho nativo do certificado)
      const certW = el.offsetWidth >= 800 ? el.offsetWidth : 1180
      const certH = el.offsetHeight >= 500 ? el.offsetHeight : 780
      const certCanvas = await captureCardToCanvas(el, certW, certH, 2.5)
      let imgData = ''
      try {
        imgData = certCanvas.toDataURL('image/jpeg', 0.95)
      } catch {
        imgData = certCanvas.toDataURL()
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, targetW, targetH, undefined, 'FAST')
    }

    const cleanFilename = (options.filename || (isBadge ? 'cracha' : 'certificado'))
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .toLowerCase()
    const fullFilename = `${cleanFilename}.pdf`

    const arrayBuffer = pdf.output('arraybuffer')
    const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(pdfBlob)
    let pdfFile: File | undefined
    try {
      pdfFile = new File([pdfBlob], fullFilename, {
        type: 'application/pdf',
        lastModified: Date.now()
      })
    } catch {}

    const result: ExportPdfResult = {
      success: true,
      blobUrl,
      blob: pdfBlob,
      file: pdfFile,
      filename: fullFilename
    }

    if (options.autoDownload !== false) {
      triggerPdfDownload(blobUrl, fullFilename, pdfBlob)
    }

    return result
  } catch (error: any) {
    console.error('Falha ao exportar PDF:', error)
    return {
      success: false,
      error: error?.message || 'Não foi possível gerar o PDF'
    }
  }
}
