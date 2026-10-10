'use client'

import React, { useState, useEffect } from 'react'
import { Printer, X } from 'lucide-react'
import { Bird, Tenant } from '@/types'
import { db } from '@/lib/db'
import { BadgeFrontAndBack } from '@/components/genealogy/badge-front-and-back'

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
  const [printMode, setPrintMode] = useState<'BOTH' | 'FRONT_ONLY' | 'BACK_ONLY'>('BOTH')

  const getLatestTenant = () => {
    const fromDb = db.getTenant(tenant?.id || bird?.tenantId) || db.getTenant()
    const mergedVc = {
      ...(fromDb?.visualConfig || {}),
      ...(tenant?.visualConfig || {})
    }
    const vcKeys = [
      'labelLogoUrl', 'treeLogoUrl',
      'labelFrontBackgroundUrl', 'labelBackBackgroundUrl', 'treeBackgroundUrl',
      'fieldBgColor', 'colorField', 'fieldTextColor', 'colorTextField',
      'maleColor', 'colorPaletteMale', 'femaleColor', 'colorPaletteFemale',
      'maleTextColor', 'colorTextPaletteMale', 'femaleTextColor', 'colorTextPaletteFemale',
      'labelFrontTextColor', 'textColorLabelFront', 'labelBackTextColor', 'textColorLabelBack',
      'labelFrontScale', 'labelBackScale', 'labelLogoScale', 'treeLogoScale', 'treeBackgroundScale'
    ] as const
    for (const k of vcKeys) {
      if (fromDb?.visualConfig?.[k]) {
        (mergedVc as any)[k] = fromDb.visualConfig[k]
      }
    }
    return {
      ...fromDb,
      ...(tenant && tenant.id ? tenant : {}),
      visualConfig: mergedVc
    }
  }

  const [activeTenant, setActiveTenant] = useState<Tenant>(getLatestTenant)

  useEffect(() => {
    setActiveTenant(getLatestTenant())
    const handleUpdate = () => {
      setActiveTenant(getLatestTenant())
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('birdpro_db_updated', handleUpdate)
      return () => window.removeEventListener('birdpro_db_updated', handleUpdate)
    }
  }, [tenant, bird?.tenantId, isOpen])

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Modal Box */}
      <div className="bg-slate-900 rounded-lg shadow-2xl w-full max-w-[1240px] border border-slate-700 overflow-hidden flex flex-col my-auto animate-scale-in">
        
        {/* Top Actions Bar (Hidden on print) */}
        <div className="bg-slate-800 px-5 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-white print:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-[#00c853] flex items-center justify-center text-white font-black text-[9px] shadow">
              BP
            </div>
            <span className="font-bold text-sm">Etiqueta de Gaiola / Crachá Oficial (9cm x 6cm - 4K Ultra HD)</span>
            <span className="text-xs text-slate-400">| {bird.name} ({bird.ringNumber})</span>
          </div>

          {/* Opções de Impressão: Frente e Verso / Somente Frente / Somente Verso */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setPrintMode('BOTH')}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                printMode === 'BOTH'
                  ? 'bg-[#00c853] text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Frente e Verso</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('FRONT_ONLY')}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                printMode === 'FRONT_ONLY'
                  ? 'bg-[#00c853] text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Somente Frente</span>
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
              <span>Somente Verso</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded flex items-center space-x-1.5 transition shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {printMode === 'FRONT_ONLY' 
                  ? 'Imprimir Somente Frente (PDF)' 
                  : printMode === 'BACK_ONLY' 
                    ? 'Imprimir Somente Verso (PDF)' 
                    : 'Imprimir Frente e Verso (PDF)'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tag Preview Area */}
        <div className="p-4 sm:p-6 bg-slate-950 overflow-x-auto flex justify-center print:p-0 print:bg-white">
          <BadgeFrontAndBack
            bird={bird}
            tenant={activeTenant}
            mode={printMode}
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-800 px-6 py-3 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00c853] inline-block"></span>
            <span>Dimensões de Impressão: <strong>9 cm x 6 cm (4K Ultra HD)</strong> • Autenticado por <strong>BirdPro</strong> (birdpro.com.br)</span>
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
              className="px-6 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded shadow transition flex items-center space-x-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {printMode === 'FRONT_ONLY' 
                  ? 'Imprimir Somente Frente (PDF)' 
                  : printMode === 'BACK_ONLY' 
                    ? 'Imprimir Somente Verso (PDF)' 
                    : 'Imprimir Frente e Verso (PDF)'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
