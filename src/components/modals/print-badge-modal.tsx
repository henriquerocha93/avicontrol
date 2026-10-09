'use client'

import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, X, Eye } from 'lucide-react'
import { Bird, Tenant } from '@/types'
import { formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import { resolvePedigreeTree } from '@/lib/pedigree'

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

  const vc = activeTenant?.visualConfig || {}
  const publicUrl = bird.qrCodePublicUrl 
    ? bird.qrCodePublicUrl 
    : (typeof window !== 'undefined' 
        ? `${window.location.origin}/ave/${encodeURIComponent(bird.id)}` 
        : `https://birdpro.com.br/ave/${encodeURIComponent(bird.id)}`)

  const handlePrint = () => {
    window.print()
  }

  // Palettes from Visual Config or Default
  const maleBg = vc.maleColor || vc.colorPaletteMale || '#dbeafe'
  const femaleBg = vc.femaleColor || vc.colorPaletteFemale || '#fce7f3'
  const maleText = vc.maleTextColor || vc.colorTextPaletteMale || '#000000'
  const femaleText = vc.femaleTextColor || vc.colorTextPaletteFemale || '#000000'

  // Cores personalizadas de campos e textos da placa
  const fieldBg = vc.fieldBgColor || vc.colorField || '#ffffff'
  const fieldText = vc.fieldTextColor || vc.colorTextField || '#000000'
  const labelFrontText = vc.labelFrontTextColor || vc.textColorLabelFront || '#475569'
  const labelBackText = vc.labelBackTextColor || vc.textColorLabelBack || '#475569'

  // Image configurations from Criatório com resolução inteligente de fallback
  const logoImage = vc.labelLogoUrl || vc.treeLogoUrl || activeTenant?.logoUrl || ''
  const frontBg = vc.labelFrontBackgroundUrl || vc.treeBackgroundUrl || ''
  const backBg = vc.labelBackBackgroundUrl || vc.labelFrontBackgroundUrl || vc.treeBackgroundUrl || ''

  // Padrão obrigatório: Sempre INDEFINIDO / INDEFINIDA quando o parentesco não for preenchido
  const formatName = (val?: string | null, isMale = true) => {
    if (!val || !val.trim()) return isMale ? 'INDEFINIDO' : 'INDEFINIDA'
    return val.trim().toUpperCase()
  }

  const allBirds = db.getBirds()
  const pedigree = resolvePedigreeTree(bird, allBirds)

  const paiNome = formatName(pedigree.father.isRegistered ? pedigree.father.name : bird.fatherName, true)
  const maeNome = formatName(pedigree.mother.isRegistered ? pedigree.mother.name : bird.motherName, false)

  const avos = [
    { name: formatName(pedigree.grandparents[0]?.isRegistered ? pedigree.grandparents[0].name : bird.paternalGrandfatherId, true), male: true },
    { name: formatName(pedigree.grandparents[1]?.isRegistered ? pedigree.grandparents[1].name : bird.paternalGrandmotherId, false), male: false },
    { name: formatName(pedigree.grandparents[2]?.isRegistered ? pedigree.grandparents[2].name : bird.maternalGrandfatherId, true), male: true },
    { name: formatName(pedigree.grandparents[3]?.isRegistered ? pedigree.grandparents[3].name : bird.maternalGrandmotherId, false), male: false }
  ]

  const bisavos = pedigree.greatGrandparents.map((bis) => {
    const isMale = bis.sex === 'MALE'
    const realName = bis.isRegistered ? bis.name : undefined
    return {
      name: formatName(realName, isMale),
      male: isMale
    }
  })

  const trisavos = pedigree.greatGreatGrandparents.map((tri) => {
    const isMale = tri.sex === 'MALE'
    const realName = tri.isRegistered ? tri.name : undefined
    return {
      name: formatName(realName, isMale),
      male: isMale
    }
  })

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
            <span className="font-bold text-sm">Etiqueta de Gaiola Oficial</span>
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
          
          {/* Printable Tag Document Container (PDF A4 Strip/Fold layout) */}
          <div 
            id="printable-badge"
            className={`${
              printMode === 'BOTH'
                ? 'w-[1100px] min-w-[1100px] flex gap-4'
                : 'w-[562px] min-w-[530px] flex justify-center'
            } bg-white text-black p-4 relative shadow-2xl overflow-hidden border border-slate-300 font-sans print:m-0 print:p-0 print:border-0 print:shadow-none select-none`}
          >
            {/* ======================================================== */}
            {/* LADO ESQUERDO: FRENTE DA ETIQUETA DE GAIOLA               */}
            {/* ======================================================== */}
            {(printMode === 'BOTH' || printMode === 'FRONT_ONLY') && (
            <div className="w-[530px] h-[340px] border-2 border-slate-800 relative bg-white flex flex-col justify-between p-2.5 overflow-hidden shrink-0">
              {/* Background from Criatório Config */}
              {frontBg && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30 bg-center bg-no-repeat bg-cover z-0"
                  style={{ 
                    backgroundImage: `url("${frontBg}")`,
                    transform: vc.labelFrontScale && vc.labelFrontScale !== 1 ? `scale(${vc.labelFrontScale})` : undefined
                  }}
                />
              )}

              {/* Top Row: Logo + Fields (Nome da Ave, Pais, Nascimento, Sexo) */}
              <div className="relative z-10 flex gap-2.5">
                {/* Logo / Brasão */}
                <div className="w-28 shrink-0 flex flex-col items-center justify-center text-center">
                  {logoImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={logoImage} 
                      alt="Brasão" 
                      className="w-20 h-20 object-contain mx-auto transition-transform" 
                      style={{ transform: vc.labelLogoScale && vc.labelLogoScale !== 1 ? `scale(${vc.labelLogoScale})` : undefined }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-amber-400/20 border border-amber-500 rounded flex flex-col items-center justify-center p-1 text-[9px] font-black text-amber-800">
                      <span>CRIATÓRIO</span>
                      <span className="text-[11px]">{activeTenant?.name?.slice(0, 8) || 'ROCHA'}</span>
                    </div>
                  )}
                  <span className="text-[9px] font-black uppercase tracking-wider block mt-1 text-slate-900">
                    {activeTenant?.name?.split(' ')[0] || 'CRIATÓRIO'}
                  </span>
                </div>

                {/* Main Fields Column */}
                <div className="flex-1 space-y-1">
                  {/* Nome da Ave */}
                  <div>
                    <span className="text-[8px] font-bold uppercase block" style={{ color: labelFrontText }}>Nome da Ave</span>
                    <div 
                      className="border border-slate-400 px-2 py-0.5 text-center font-bold text-xs uppercase truncate"
                      style={{ backgroundColor: fieldBg, color: fieldText }}
                    >
                      {bird.name}
                    </div>
                  </div>

                  {/* Pai */}
                  <div>
                    <span className="text-[7.5px] font-bold uppercase block" style={{ color: labelFrontText }}>Pai</span>
                    <div 
                      className="border border-slate-400 px-2 py-0.5 text-center font-bold text-[10px] uppercase truncate"
                      style={{ backgroundColor: maleBg, color: maleText }}
                    >
                      {paiNome}
                    </div>
                  </div>

                  {/* Mãe */}
                  <div>
                    <span className="text-[7.5px] font-bold uppercase block" style={{ color: labelFrontText }}>Mãe</span>
                    <div 
                      className="border border-slate-400 px-2 py-0.5 text-center font-bold text-[10px] uppercase truncate"
                      style={{ backgroundColor: femaleBg, color: femaleText }}
                    >
                      {maeNome}
                    </div>
                  </div>

                  {/* Nascimento + Sexo */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <div>
                      <span className="text-[7.5px] font-bold uppercase block" style={{ color: labelFrontText }}>Nascimento</span>
                      <div 
                        className="border border-slate-400 px-1 py-0.5 text-center font-bold text-[9px]"
                        style={{ backgroundColor: fieldBg, color: fieldText }}
                      >
                        {bird.birthDate ? formatDate(bird.birthDate) : '04/11/2021'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[7.5px] font-bold uppercase block" style={{ color: labelFrontText }}>Sexo</span>
                      <div 
                        className="border border-slate-400 px-1 py-0.5 text-center font-bold text-[9px]"
                        style={{ backgroundColor: fieldBg, color: fieldText }}
                      >
                        {bird.sex === 'MALE' ? 'Macho' : bird.sex === 'FEMALE' ? 'Fêmea' : 'Indefinido'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row: Anilha e Registro */}
              <div className="relative z-10 grid grid-cols-12 gap-1.5 pt-1">
                <div className="col-span-8">
                  <span className="text-[7.5px] font-bold uppercase block" style={{ color: labelFrontText }}>Anilha</span>
                  <div 
                    className="border border-slate-400 px-2 py-0.5 text-center font-mono font-bold text-[10px] truncate"
                    style={{ backgroundColor: fieldBg, color: fieldText }}
                  >
                    {bird.ringNumber || 'SISPASS 2.8 RS/A 036460'}
                  </div>
                </div>
                <div className="col-span-4">
                  <span className="text-[7.5px] font-bold uppercase block" style={{ color: labelFrontText }}>Registro</span>
                  <div 
                    className="border border-slate-400 px-1 py-0.5 text-center font-mono font-bold text-[10px] truncate"
                    style={{ backgroundColor: fieldBg, color: fieldText }}
                  >
                    {activeTenant?.registryNumber || activeTenant?.registrationNumber || '—'}
                  </div>
                </div>
              </div>

              {/* Bottom Row: QR Code de Autenticidade + Proprietário + BirdPro Watermark */}
              <div className="relative z-10 pt-1 border-t border-slate-300 flex items-center justify-between gap-2">
                {/* QR Code Oficial na Frente da Etiqueta */}
                <div className="w-12 h-12 bg-white p-0.5 border border-slate-400 rounded shrink-0 flex items-center justify-center shadow-2xs">
                  <QRCodeSVG value={publicUrl} size={42} level="M" />
                </div>

                <div className="flex-1">
                  <span className="text-[7.5px] font-bold uppercase block" style={{ color: labelFrontText }}>Proprietário / Criador Responsável</span>
                  <div className="flex border border-slate-400 text-[8.5px] font-bold">
                    <div 
                      className="flex-1 px-1.5 py-0.5 border-r border-slate-400 truncate"
                      style={{ backgroundColor: fieldBg, color: fieldText }}
                    >
                      {activeTenant?.name || '—'}
                    </div>
                    <div 
                      className="px-2 py-0.5 shrink-0 font-mono"
                      style={{ backgroundColor: fieldBg, color: fieldText }}
                    >
                      {activeTenant?.phone || activeTenant?.cellphone || '—'}
                    </div>
                  </div>
                </div>

                {/* BirdPro Branding Front */}
                <div className="flex items-center space-x-1 shrink-0">
                  <div className="w-5 h-5 rounded bg-[#00c853] text-white flex items-center justify-center font-black text-[9px] shadow-xs">
                    BP
                  </div>
                  <div className="leading-tight text-left">
                    <span className="font-extrabold text-[8px] text-slate-900 block">BIRDPRO</span>
                    <span className="text-[6.5px] text-[#00c853] font-bold block">www.birdpro.com.br</span>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* ======================================================== */}
            {/* LADO DIREITO: VERSO DA ETIQUETA (GENEALOGIA COMPACTA)    */}
            {/* ======================================================== */}
            {(printMode === 'BOTH' || printMode === 'BACK_ONLY') && (
            <div className="w-[530px] h-[340px] border-2 border-slate-800 relative bg-white flex flex-col justify-between p-2 overflow-hidden shrink-0">
              {/* Background from Criatório Config */}
              {backBg && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30 bg-center bg-no-repeat bg-cover z-0"
                  style={{ 
                    backgroundImage: `url("${backBg}")`,
                    transform: vc.labelBackScale && vc.labelBackScale !== 1 ? `scale(${vc.labelBackScale})` : undefined
                  }}
                />
              )}

              {/* Top Bar: BirdPro Brand & Official Link */}
              <div className="relative z-10 flex items-center justify-between border-b border-black/10 pb-1 text-[8.5px] font-bold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded bg-[#00c853] text-white flex items-center justify-center font-black text-[8px]">
                    BP
                  </span>
                  <span className="font-black tracking-tight" style={{ color: labelBackText }}>BIRDPRO</span>
                </div>
                <span className="text-[#00c853] font-mono text-[8px] font-bold">www.birdpro.com.br</span>
              </div>

              {/* Genealogy Tree Mini Body (4 Colunas com Linhas Conectoras) */}
              <div className="relative z-10 flex-1 flex items-center justify-between py-1">
                
                {/* COL 1: PAIS (2 Caixas) */}
                <div className="w-[95px] h-full flex flex-col justify-around shrink-0 z-10">
                  <div 
                    className="py-0.5 px-1 text-center text-[7.5px] font-bold uppercase rounded border border-black/40 truncate"
                    style={{ backgroundColor: maleBg, color: maleText }}
                  >
                    {paiNome}
                  </div>
                  <div 
                    className="py-0.5 px-1 text-center text-[7.5px] font-bold uppercase rounded border border-black/40 truncate"
                    style={{ backgroundColor: femaleBg, color: femaleText }}
                  >
                    {maeNome}
                  </div>
                </div>

                {/* CONECTOR 1 -> 2 */}
                <div className="w-[12px] h-full relative shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 12 240" fill="none">
                    <path d="M 0,60 H 6 V 30 H 12 M 6,60 V 90 H 12" stroke="#000000" strokeWidth="1" />
                    <path d="M 0,180 H 6 V 150 H 12 M 6,180 V 210 H 12" stroke="#000000" strokeWidth="1" />
                  </svg>
                </div>

                {/* COL 2: AVÓS (4 Caixas) */}
                <div className="w-[95px] h-full flex flex-col justify-around shrink-0 z-10">
                  {avos.map((av, idx) => (
                    <div 
                      key={idx}
                      className="py-0.5 px-1 text-center text-[7px] font-bold uppercase rounded border border-black/40 truncate"
                      style={{ backgroundColor: av.male ? maleBg : femaleBg, color: av.male ? maleText : femaleText }}
                    >
                      {av.name}
                    </div>
                  ))}
                </div>

                {/* CONECTOR 2 -> 3 */}
                <div className="w-[10px] h-full relative shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 10 240" fill="none">
                    <path d="M 0,30 H 5 V 15 H 10 M 5,30 V 45 H 10" stroke="#000000" strokeWidth="1" />
                    <path d="M 0,90 H 5 V 75 H 10 M 5,90 V 105 H 10" stroke="#000000" strokeWidth="1" />
                    <path d="M 0,150 H 5 V 135 H 10 M 5,150 V 165 H 10" stroke="#000000" strokeWidth="1" />
                    <path d="M 0,210 H 5 V 195 H 10 M 5,210 V 225 H 10" stroke="#000000" strokeWidth="1" />
                  </svg>
                </div>

                {/* COL 3: BISAVÓS (8 Caixas) */}
                <div className="w-[90px] h-full flex flex-col justify-around shrink-0 z-10">
                  {bisavos.map((bis, idx) => (
                    <div 
                      key={idx}
                      className="py-0 px-0.5 text-center text-[6.5px] font-bold uppercase rounded border border-black/40 truncate"
                      style={{ backgroundColor: bis.male ? maleBg : femaleBg, color: bis.male ? maleText : femaleText }}
                    >
                      {bis.name}
                    </div>
                  ))}
                </div>

                {/* CONECTOR 3 -> 4 */}
                <div className="w-[8px] h-full relative shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 8 240" fill="none">
                    {[
                      { y: 15, y1: 7, y2: 22 },
                      { y: 45, y1: 37, y2: 52 },
                      { y: 75, y1: 67, y2: 82 },
                      { y: 105, y1: 97, y2: 112 },
                      { y: 135, y1: 127, y2: 142 },
                      { y: 165, y1: 157, y2: 172 },
                      { y: 195, y1: 187, y2: 202 },
                      { y: 225, y1: 217, y2: 232 }
                    ].map((c, i) => (
                      <path 
                        key={i} 
                        d={`M 0,${c.y} H 4 V ${c.y1} H 8 M 4,${c.y} V ${c.y2} H 8`} 
                        stroke="#000000" 
                        strokeWidth="0.8" 
                      />
                    ))}
                  </svg>
                </div>

                {/* COL 4: TRISAVÓS (16 Caixas) */}
                <div className="w-[85px] h-full flex flex-col justify-around shrink-0 z-10">
                  {trisavos.map((tri, idx) => (
                    <div 
                      key={idx}
                      className="py-0 px-0.5 text-center text-[5.5px] font-black uppercase rounded border border-black/30 truncate"
                      style={{ backgroundColor: tri.male ? maleBg : femaleBg, color: tri.male ? maleText : femaleText }}
                    >
                      {tri.name}
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom Footer: QR Code + Species and Bird Name + BirdPro Stamp */}
              <div className="relative z-10 flex items-center justify-between border-t border-black/10 pt-1 text-[7.5px]" style={{ color: labelBackText }}>
                <div className="flex items-center space-x-2">
                  <div className="p-0.5 bg-white border border-slate-400 rounded shrink-0">
                    <QRCodeSVG value={publicUrl} size={34} level="M" />
                  </div>
                  <div>
                    <span className="font-bold uppercase text-slate-900 block">{bird.name}</span>
                    <span className="text-[7px] text-slate-600 block">Nasc: {bird.birthDate ? formatDate(bird.birthDate) : '04/11/2021'}</span>
                    <span className="text-[7px] italic text-slate-500">Espécie: {bird.species}</span>
                  </div>
                </div>

                <div className="text-right text-[7px] text-slate-500 font-semibold">
                  <p>Autenticação Digital</p>
                  <p className="font-mono">{bird.ringNumber}</p>
                  <p className="text-[#00c853] font-bold">www.birdpro.com.br</p>
                </div>
              </div>

            </div>
            )}

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-800 px-6 py-3 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00c853] inline-block"></span>
            <span>Autenticado por <strong>BirdPro</strong> (www.birdpro.com.br)</span>
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

