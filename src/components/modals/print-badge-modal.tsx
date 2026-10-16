'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, Ruler, Download, Loader2, Check } from 'lucide-react'
import { Bird, Tenant } from '@/types'
import { db } from '@/lib/db'
import { firebaseSync } from '@/lib/firebase-service'
import { BadgeFrontAndBack } from '@/components/genealogy/badge-front-and-back'
import { exportElementToPdf } from '@/lib/pdf-export'

interface PrintBadgeModalProps {
  isOpen: boolean
  onClose: () => void
  bird: Bird
  tenant?: Tenant | null
}

export function PrintBadgeModal({
  isOpen,
  onClose,
  bird,
  tenant
}: PrintBadgeModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('is-printing-modal-open')
    } else {
      document.body.classList.remove('is-printing-modal-open')
    }
    return () => {
      document.body.classList.remove('is-printing-modal-open')
    }
  }, [isOpen])

  // Padrão: Imprimir SOMENTE 1 CRACHÁ (Frente Oficial com QR Code)
  const [printMode, setPrintMode] = useState<'FRONT_ONLY' | 'BACK_ONLY' | 'BOTH'>('FRONT_ONLY')
  const [badgeWidthCm, setBadgeWidthCm] = useState<number>(9)
  const [badgeHeightCm, setBadgeHeightCm] = useState<number>(6)
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false)
  const [pdfReadyUrl, setPdfReadyUrl] = useState<string | null>(null)
  const [pdfReadyFilename, setPdfReadyFilename] = useState<string>('cracha.pdf')

  const getLatestTenant = (): Tenant => {
    const fromDb = db.getTenant(tenant?.id || bird?.tenantId) || db.getTenant()
    const dbVc = fromDb?.visualConfig || {}
    const propVc = tenant?.visualConfig || {}

    const mergedVc: TenantVisualConfig = {
      ...propVc,
      ...dbVc
    }

    const priorityKeys: (keyof TenantVisualConfig)[] = [
      'labelFrontBackgroundUrl', 'bgLabelFrontUrl',
      'labelBackBackgroundUrl', 'bgLabelBackUrl',
      'treeBackgroundUrl', 'bgGenealogyUrl',
      'labelLogoUrl', 'logoLabelUrl',
      'treeLogoUrl', 'logoGenealogyUrl',
      'labelFrontScale', 'labelBackScale', 'treeBackgroundScale', 'labelLogoScale', 'treeLogoScale',
      'maleColor', 'colorPaletteMale', 'femaleColor', 'colorPaletteFemale',
      'maleTextColor', 'colorTextPaletteMale', 'femaleTextColor', 'colorTextPaletteFemale',
      'fieldBgColor', 'colorField', 'fieldTextColor', 'colorTextField',
      'labelFrontTextColor', 'textColorLabelFront', 'labelBackTextColor', 'textColorLabelBack'
    ]

    for (const key of priorityKeys) {
      if (dbVc[key] !== undefined && dbVc[key] !== '') {
        (mergedVc as any)[key] = dbVc[key]
      } else if (propVc[key] !== undefined && propVc[key] !== '') {
        (mergedVc as any)[key] = propVc[key]
      }
    }

    const isBadImg = (url?: string | null) => {
      if (!url || typeof url !== 'string') return true
      return (
        url.includes('1544717305') ||
        url.includes('1534528741') ||
        url.includes('53994a69daeb') ||
        url.includes('2782549b5136')
      )
    }

    // Fundo dos crachás
    const crachaBg = !isBadImg(mergedVc.labelFrontBackgroundUrl)
      ? mergedVc.labelFrontBackgroundUrl
      : (!isBadImg(mergedVc.bgLabelFrontUrl) ? mergedVc.bgLabelFrontUrl : '')

    if (crachaBg) {
      if (!mergedVc.labelFrontBackgroundUrl) mergedVc.labelFrontBackgroundUrl = crachaBg
      if (!mergedVc.labelBackBackgroundUrl) mergedVc.labelBackBackgroundUrl = crachaBg
    }

    // Logo / Foto
    const candidateLogo = 
      mergedVc.labelLogoUrl || 
      mergedVc.logoLabelUrl || 
      mergedVc.treeLogoUrl || 
      fromDb?.logoUrl || 
      tenant?.logoUrl || 
      ''

    const universalLogo = isBadImg(candidateLogo) ? '' : candidateLogo

    if (universalLogo) {
      if (!mergedVc.labelLogoUrl && !mergedVc.logoLabelUrl) {
        mergedVc.labelLogoUrl = universalLogo
        mergedVc.logoLabelUrl = universalLogo
      }
      if (!mergedVc.treeLogoUrl && !mergedVc.logoGenealogyUrl) {
        mergedVc.treeLogoUrl = universalLogo
        mergedVc.logoGenealogyUrl = universalLogo
      }
    }

    return {
      ...(tenant && (tenant.id || tenant.name) ? tenant : {}),
      ...(fromDb || {}),
      logoUrl: fromDb?.logoUrl || tenant?.logoUrl || universalLogo || undefined,
      ownerName: fromDb?.ownerName || tenant?.ownerName || '',
      visualConfig: mergedVc
    } as Tenant
  }

  const [activeTenant, setActiveTenant] = useState<Tenant>(getLatestTenant)

  useEffect(() => {
    const lat = getLatestTenant()
    setActiveTenant(lat)
    const handleUpdate = () => {
      setActiveTenant(getLatestTenant())
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('birdpro_db_updated', handleUpdate)
      window.addEventListener('storage', handleUpdate)
      return () => {
        window.removeEventListener('birdpro_db_updated', handleUpdate)
        window.removeEventListener('storage', handleUpdate)
      }
    }
  }, [tenant, bird?.tenantId, isOpen])

  // Sincroniza ave e criatório na nuvem em background sempre que o modal de impressão for aberto
  useEffect(() => {
    if (isOpen && bird && firebaseSync.isAvailable()) {
      const lat = getLatestTenant()
      const tenantSnapshot = lat ? {
        id: lat.id,
        name: lat.name,
        ownerName: lat.ownerName,
        registryNumber: lat.registryNumber,
        phone: lat.phone || lat.cellphone,
        logoUrl: lat.logoUrl,
        visualConfig: lat.visualConfig
      } : undefined
      firebaseSync.saveDocument('birds', bird.id, { ...bird, tenantSnapshot }).catch(() => {})
      if (lat) {
        firebaseSync.saveTenant(lat).catch(() => {})
      }
    }
  }, [isOpen, bird?.id])

  if (!isOpen || !mounted || typeof document === 'undefined') return null

  const handleSavePdf = async () => {
    if (isExportingPdf) return
    setIsExportingPdf(true)
    setPdfReadyUrl(null)
    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('birdpro_simulated_bird', JSON.stringify(bird))
        } catch {}
      }

      const cleanName = (bird.ringNumber || bird.name || 'cracha').replace(/[^a-zA-Z0-9_\-]/g, '_')
      const filename = `cracha_${cleanName}`
      const res = await exportElementToPdf('printable-badge', {
        filename,
        format: 'badge',
        widthCm: badgeWidthCm,
        heightCm: badgeHeightCm,
        orientation: 'landscape'
      })

      if (res.success && res.blobUrl) {
        setPdfReadyUrl(res.blobUrl)
        setPdfReadyFilename(res.filename || `${filename}.pdf`)
      }
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handlePrint = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('birdpro_simulated_bird', JSON.stringify(bird))
      } catch {}
    }

    const isMobile = typeof window !== 'undefined' && (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
    )

    if (!isMobile) {
      window.print()
      return
    }

    try {
      window.print()
    } catch {}

    await handleSavePdf()
  }

  const modalContent = (
    <div id="print-modal-root" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:overflow-visible print:bg-transparent print:p-0 print:m-0">
      {/* Modal Box */}
      <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-[1240px] border border-slate-700 overflow-hidden flex flex-col my-auto animate-scale-in print:border-0 print:shadow-none print:bg-transparent print:w-auto print:max-w-none print:m-0 print:overflow-visible">
        
        {/* Top Actions Bar (Hidden on print) */}
        <div className="bg-slate-800 px-5 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-white print:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-[#00c853] flex items-center justify-center text-white font-black text-[9px] shadow">
              BP
            </div>
            <span className="font-bold text-sm">Etiqueta de Gaiola / Crachá Oficial (4K Ultra HD)</span>
            <span className="text-xs text-slate-400">| {bird.name} ({bird.ringNumber})</span>
          </div>

          {/* Opções de Impressão: Somente 1 Crachá (Frente) / Somente Verso / Frente e Verso */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setPrintMode('FRONT_ONLY')}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                printMode === 'FRONT_ONLY'
                  ? 'bg-[#00c853] text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🏷️ 1 Crachá (Frente Oficial)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('BACK_ONLY')}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                printMode === 'BACK_ONLY'
                  ? 'bg-[#00c853] text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🌳 Verso (Genealogia)</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('BOTH')}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                printMode === 'BOTH'
                  ? 'bg-[#00c853] text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>📄 Frente e Verso (2 Crachás)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {pdfReadyUrl ? (
              <a
                href={pdfReadyUrl}
                download={pdfReadyFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded flex items-center space-x-1.5 transition shadow cursor-pointer animate-pulse"
                title="Toque para abrir ou baixar o PDF gerado"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Baixar PDF Pronto</span>
              </a>
            ) : (
              <button
                onClick={handleSavePdf}
                disabled={isExportingPdf}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded flex items-center space-x-1.5 transition shadow cursor-pointer"
                title="Salvar ou abrir crachá em PDF"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span>{isExportingPdf ? 'Gerando PDF...' : 'Salvar PDF'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              disabled={isExportingPdf}
              className="px-4 py-1.5 bg-[#00c853] hover:bg-[#00b84a] active:bg-[#009b3e] disabled:opacity-60 text-white text-xs font-bold rounded flex items-center space-x-1.5 transition shadow cursor-pointer"
              title="Imprimir crachá diretamente"
            >
              <Printer className="w-4 h-4" />
              <span>
                {printMode === 'FRONT_ONLY' 
                  ? 'Imprimir Crachá' 
                  : printMode === 'BACK_ONLY' 
                    ? 'Imprimir Verso' 
                    : 'Imprimir Frente e Verso'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de PDF Gerado com Sucesso / Download Imediato */}
        {pdfReadyUrl && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold animate-fade-in print:hidden shadow-lg border-b border-emerald-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>PDF gerado com sucesso! Toque no botão para abrir ou salvar:</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={pdfReadyUrl}
                download={pdfReadyFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white text-emerald-950 rounded-lg font-black hover:bg-emerald-50 active:bg-emerald-100 transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Abrir / Baixar PDF</span>
              </a>
              <button
                type="button"
                onClick={() => setPdfReadyUrl(null)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
                title="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Barra de Tamanho do Crachá em cm para Impressão */}
        <div className="bg-[#131920] border-b border-emerald-500/30 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white print:hidden animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
              <Ruler className="w-4 h-4 text-[#00c853]" />
              <span>Tamanho do Crachá:</span>
            </div>

            {/* Presets Rápidos */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => { setBadgeWidthCm(9); setBadgeHeightCm(6); }}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  badgeWidthCm === 9 && badgeHeightCm === 6
                    ? 'bg-[#00c853] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                9 × 6 cm (Padrão 4K)
              </button>
              <button
                type="button"
                onClick={() => { setBadgeWidthCm(8.5); setBadgeHeightCm(5.5); }}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  badgeWidthCm === 8.5 && badgeHeightCm === 5.5
                    ? 'bg-[#00c853] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                8.5 × 5.5 cm (Cartão/PVC)
              </button>
              <button
                type="button"
                onClick={() => { setBadgeWidthCm(10); setBadgeHeightCm(7); }}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  badgeWidthCm === 10 && badgeHeightCm === 7
                    ? 'bg-[#00c853] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                10 × 7 cm (Gaiola Média)
              </button>
              <button
                type="button"
                onClick={() => { setBadgeWidthCm(12); setBadgeHeightCm(8); }}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  badgeWidthCm === 12 && badgeHeightCm === 8
                    ? 'bg-[#00c853] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                12 × 8 cm (Gaiolão)
              </button>
            </div>

            {/* Digitar Tamanho Personalizado em cm */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-semibold text-[11px]">Largura:</span>
                <input
                  type="number"
                  step="0.1"
                  min="4"
                  max="30"
                  value={badgeWidthCm}
                  onChange={(e) => setBadgeWidthCm(Math.max(3, parseFloat(e.target.value) || 9))}
                  className="w-14 bg-slate-800 text-white text-center font-bold font-mono text-xs rounded border border-slate-600 px-1 py-0.5 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-slate-400 text-[11px]">cm</span>
              </div>

              <span className="text-slate-500 font-bold">×</span>

              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-semibold text-[11px]">Altura:</span>
                <input
                  type="number"
                  step="0.1"
                  min="3"
                  max="25"
                  value={badgeHeightCm}
                  onChange={(e) => setBadgeHeightCm(Math.max(2, parseFloat(e.target.value) || 6))}
                  className="w-14 bg-slate-800 text-white text-center font-bold font-mono text-xs rounded border border-slate-600 px-1 py-0.5 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-slate-400 text-[11px]">cm</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00c853] inline-block animate-pulse"></span>
            <span>Saída de Impressão: <strong>{badgeWidthCm}cm × {badgeHeightCm}cm</strong></span>
          </div>
        </div>

        {/* Tag Preview Area */}
        <div className="p-4 sm:p-6 bg-slate-950 overflow-x-auto flex justify-center print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
          <BadgeFrontAndBack
            bird={bird}
            tenant={activeTenant}
            mode={printMode}
            printWidthCm={badgeWidthCm}
            printHeightCm={badgeHeightCm}
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-800 px-6 py-3 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00c853] inline-block"></span>
            <span>Dimensões de Impressão: <strong>{badgeWidthCm} cm × {badgeHeightCm} cm (4K Ultra HD)</strong> • Autenticado por <strong>BirdPro</strong> (birdpro.com.br)</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              disabled={isExportingPdf}
              className="px-6 py-2 bg-[#00c853] hover:bg-[#00b84a] active:bg-[#009b3e] disabled:opacity-60 text-white text-xs font-bold rounded shadow transition flex items-center space-x-2 cursor-pointer"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>
                {isExportingPdf ? 'Gerando PDF...' : (
                  printMode === 'FRONT_ONLY' 
                    ? 'Imprimir 1 Crachá (PDF)' 
                    : printMode === 'BACK_ONLY' 
                      ? 'Imprimir Somente Verso (PDF)' 
                      : 'Imprimir Frente e Verso (PDF)'
                )}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
