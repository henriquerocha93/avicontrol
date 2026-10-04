'use client'

import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, X, Download, FileText, Sparkles, Check, ExternalLink, ChevronDown, Moon, Sun, Award, QrCode } from 'lucide-react'
import { Bird, Tenant } from '@/types'
import { formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import { resolvePedigreeTree } from '@/lib/pedigree'
import { BadgeFrontAndBack } from '@/components/genealogy/badge-front-and-back'

interface PrintPedigreeModalProps {
  isOpen: boolean
  onClose: () => void
  bird: Bird
  tenant?: Tenant | null
}

export function PrintPedigreeModal({
  isOpen,
  onClose,
  bird: initialBird,
  tenant: initialTenant
}: PrintPedigreeModalProps) {
  const allBirds = db.getBirds()
  const [selectedBirdId, setSelectedBirdId] = useState<string>(initialBird?.id || '')
  const [activeBird, setActiveBird] = useState<Bird>(initialBird)
  
  // Customization controls matching user's screenshot
  const [generationsCount, setGenerationsCount] = useState<3 | 4 | 5>(4)
  const [themeStyle, setThemeStyle] = useState<'DARK_PRESTIGE' | 'CLASSIC_LIGHT' | 'BADGE_PRO'>('DARK_PRESTIGE')
  const [showCertificateHeader, setShowCertificateHeader] = useState<boolean>(true)
  const [showQrCode, setShowQrCode] = useState<boolean>(true)

  const tenant = initialTenant || db.getTenant(activeBird?.tenantId) || db.getTenant()

  useEffect(() => {
    if (initialBird) {
      setActiveBird(initialBird)
      setSelectedBirdId(initialBird.id)
    }
  }, [initialBird])

  const handleSelectBirdChange = (newId: string) => {
    setSelectedBirdId(newId)
    const found = allBirds.find(b => b.id === newId)
    if (found) {
      setActiveBird(found)
    }
  }

  if (!isOpen || !activeBird) return null

  // Resolve dynamic ancestors from DB
  const pedigree = resolvePedigreeTree(activeBird, allBirds)

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/ave/${activeBird.id}` 
    : `https://www.birdpro.com.br/ave/${activeBird.id}`

  const handlePrint = () => {
    window.print()
  }

  const handleOpenPdf = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('birdpro_simulated_bird', JSON.stringify(activeBird))
      } catch {}
      window.open(`/ave/${activeBird.id}?print=1&style=${themeStyle}&gen=${generationsCount}`, '_blank')
    }
  }

  const vc = tenant?.visualConfig || {}
  const bgImage = vc.treeBackgroundUrl || vc.bgGenealogyUrl || ''
  const logoImage = vc.treeLogoUrl || vc.labelLogoUrl || vc.logoGenealogyUrl || tenant?.logoUrl || ''
  const profileImage = activeBird.photoUrl || vc.labelLogoUrl || vc.treeLogoUrl || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      
      {/* Modal Container */}
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[1260px] border border-slate-700 overflow-hidden flex flex-col my-auto animate-scale-in print:border-0 print:shadow-none print:bg-white">
        
        {/* ========================================================================= */}
        {/* TOP CONTROLS BAR (Matching User Screenshot: Selecione Ave | Gerações | Checkboxes) */}
        {/* ========================================================================= */}
        <div className="bg-[#1b222a] border-b border-slate-700 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white print:hidden">
          
          {/* Left: Bird Selector & Generations Dropdown */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            
            {/* Selecione a Ave Modelo */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Selecione a Ave Modelo</span>
              <select
                value={selectedBirdId}
                onChange={(e) => handleSelectBirdChange(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-md px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400 cursor-pointer min-w-[260px]"
              >
                {allBirds.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.ringNumber}) - {b.species.split('(')[0].trim()}
                  </option>
                ))}
              </select>
            </div>

            {/* Gerações para Exibição */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Gerações para Exibição</span>
              <select
                value={generationsCount}
                onChange={(e) => setGenerationsCount(Number(e.target.value) as any)}
                className="bg-slate-800 border border-slate-600 rounded-md px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value={3}>3 Gerações (Até Avós)</option>
                <option value={4}>4 Gerações (Até Bisavós)</option>
                <option value={5}>5 Gerações (Até Trisavós)</option>
              </select>
            </div>

            {/* Estilo Visual do Certificado */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Tema Visual</span>
              <div className="inline-flex rounded-md bg-slate-800 p-0.5 border border-slate-600">
                <button
                  type="button"
                  onClick={() => setThemeStyle('DARK_PRESTIGE')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    themeStyle === 'DARK_PRESTIGE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌙 Dark Prestige
                </button>
                <button
                  type="button"
                  onClick={() => setThemeStyle('CLASSIC_LIGHT')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    themeStyle === 'CLASSIC_LIGHT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌟 Clássico A4
                </button>
                <button
                  type="button"
                  onClick={() => setThemeStyle('BADGE_PRO')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    themeStyle === 'BADGE_PRO' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏅 Estilo Crachá
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-4 pt-3 sm:pt-0">
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={showCertificateHeader}
                  onChange={(e) => setShowCertificateHeader(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#00c853] rounded cursor-pointer"
                />
                <span>Imprimir cabeçalho "CERTIFICADO"</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={showQrCode}
                  onChange={(e) => setShowQrCode(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#00c853] rounded cursor-pointer"
                />
                <span>Incluir QR Code de Autenticidade</span>
              </label>
            </div>

          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenPdf}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-600 flex items-center gap-1.5 transition cursor-pointer"
              title="Abrir em nova aba para salvar como PDF"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Abrir / Baixar PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-lg flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Certificado</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CERTIFICATE CANVAS OR BADGE FRONT & BACK CANVAS                           */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 bg-slate-950 overflow-x-auto flex justify-center print:p-0 print:bg-white">
          
          {themeStyle === 'BADGE_PRO' ? (
            <div className="w-full flex justify-center">
              <BadgeFrontAndBack bird={activeBird} tenant={tenant || ({} as any)} />
            </div>
          ) : (
            <div
              id="pedigree-certificate"
              className={`w-[1140px] min-w-[1140px] h-[720px] relative shadow-2xl overflow-hidden font-sans select-none flex flex-col justify-between print:m-0 print:border-0 print:shadow-none ${
                themeStyle === 'DARK_PRESTIGE'
                  ? 'bg-[#111827] text-white border border-slate-700'
                  : 'bg-white text-slate-900 border border-slate-300'
              }`}
            >
              
              {/* Background Watermark Image if present */}
              {bgImage && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-10 bg-center bg-no-repeat bg-cover"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
              )}

              {/* --- TOP CERTIFICATE HEADER --- */}
              {showCertificateHeader && (
                <div className={`px-8 pt-5 pb-2 text-center border-b relative z-10 ${
                  themeStyle === 'DARK_PRESTIGE' 
                    ? 'border-emerald-500/20 bg-slate-900/50' 
                    : 'border-slate-200 bg-slate-50/70'
                }`}>
                  <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-widest ${
                    themeStyle === 'DARK_PRESTIGE'
                      ? 'text-emerald-400 drop-shadow-sm'
                      : 'text-slate-950'
                  }`}>
                    CERTIFICADO DE ORIGEM &amp; GENEALOGIA
                  </h1>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${
                    themeStyle === 'DARK_PRESTIGE' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {tenant?.name || 'CRIATÓRIO'} • REGISTRO IBAMA / SISPASS: {tenant?.registryNumber || '—'}
                  </p>
                </div>
              )}

              {/* --- MAIN MULTI-GENERATION PEDIGREE TREE WITH BLOODLINE CONNECTOR LINES --- */}
              <div className="relative z-10 px-6 py-4 flex-1 flex items-center justify-between gap-1">
                
                {/* 1. INDIVÍDUO PRINCIPAL (Card com Borda Verde Neon ou Azul) */}
                <div className="w-[200px] shrink-0">
                  <div className={`p-4 rounded-xl text-center space-y-2 relative shadow-lg ${
                    themeStyle === 'DARK_PRESTIGE'
                      ? 'bg-[#1e293b] border-2 border-[#00c853] text-white'
                      : 'bg-slate-50 border-2 border-emerald-600 text-slate-900'
                  }`}>
                    {/* Badge */}
                    <span className="inline-block px-3 py-1 bg-[#00c853] text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider">
                      INDIVÍDUO PRINCIPAL
                    </span>

                    {/* Nome da Ave */}
                    <h2 className="text-base font-black uppercase tracking-wide drop-shadow-xs">
                      {activeBird.name}
                    </h2>

                    {/* Anilha & Dados */}
                    <div className="space-y-1 text-xs font-semibold">
                      <p className="font-mono text-emerald-400 font-bold text-xs bg-black/40 py-1 px-2 rounded">
                        Anilha: {activeBird.ringNumber}
                      </p>
                      <p className={`text-[11px] ${themeStyle === 'DARK_PRESTIGE' ? 'text-slate-300' : 'text-slate-700'}`}>
                        {activeBird.species}
                      </p>
                      <p className={`text-[11px] font-bold ${themeStyle === 'DARK_PRESTIGE' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Sexo: {activeBird.sex === 'MALE' ? '♂ Macho' : activeBird.sex === 'FEMALE' ? '♀ Fêmea' : 'Indefinido'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONECTOR 1 -> 2: Indivíduo Principal para Pais (Linha Sanguínea) */}
                <div className="w-[20px] h-[440px] relative shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 20 440" fill="none" preserveAspectRatio="none">
                    <path
                      d="M 0,220 H 10 V 110 H 20 M 10,220 V 330 H 20"
                      stroke={themeStyle === 'DARK_PRESTIGE' ? '#38bdf8' : '#0284c7'}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* 2. GERAÇÃO 1: PAIS (Pai ♂ e Mãe ♀) */}
                <div className="w-[190px] shrink-0 h-[440px] flex flex-col justify-around">
                  
                  {/* Pai */}
                  <div className={`p-3 rounded-xl border-2 shadow-md space-y-1 text-center ${
                    themeStyle === 'DARK_PRESTIGE'
                      ? 'bg-[#1e293b] border-sky-500/70 text-white'
                      : 'bg-sky-50 border-sky-500 text-slate-900'
                  }`}>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 inline-block">
                      PAI (1ª GERAÇÃO) ♂
                    </span>
                    <h3 className="font-black text-xs uppercase truncate text-sky-400">
                      {pedigree.father.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 font-bold">
                      {pedigree.father.ringNumber}
                    </p>
                  </div>

                  {/* Mãe */}
                  <div className={`p-3 rounded-xl border-2 shadow-md space-y-1 text-center ${
                    themeStyle === 'DARK_PRESTIGE'
                      ? 'bg-[#1e293b] border-rose-500/70 text-white'
                      : 'bg-rose-50 border-rose-500 text-slate-900'
                  }`}>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                      MÃE (1ª GERAÇÃO) ♀
                    </span>
                    <h3 className="font-black text-xs uppercase truncate text-rose-400">
                      {pedigree.mother.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 font-bold">
                      {pedigree.mother.ringNumber}
                    </p>
                  </div>

                </div>

                {/* CONECTOR 2 -> 3: Pais para Avós (Linha Sanguínea) */}
                <div className="w-[18px] h-[460px] relative shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 18 460" fill="none" preserveAspectRatio="none">
                    {/* Pai -> Avô & Avó Paternos */}
                    <path
                      d="M 0,115 H 9 V 58 H 18 M 9,115 V 172 H 18"
                      stroke={themeStyle === 'DARK_PRESTIGE' ? '#38bdf8' : '#0284c7'}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    {/* Mãe -> Avô & Avó Maternos */}
                    <path
                      d="M 0,345 H 9 V 288 H 18 M 9,345 V 402 H 18"
                      stroke={themeStyle === 'DARK_PRESTIGE' ? '#f43f5e' : '#e11d48'}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* 3. GERAÇÃO 2: AVÓS (4 Cards) */}
                <div className="w-[180px] shrink-0 h-[460px] flex flex-col justify-around">
                  {pedigree.grandparents.map((av, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-center space-y-0.5 shadow-xs ${
                        av.sex === 'MALE'
                          ? themeStyle === 'DARK_PRESTIGE'
                            ? 'bg-[#1e293b]/90 border-sky-500/40 text-slate-200'
                            : 'bg-sky-50/80 border-sky-300 text-slate-900'
                          : themeStyle === 'DARK_PRESTIGE'
                          ? 'bg-[#1e293b]/90 border-rose-500/40 text-slate-200'
                          : 'bg-rose-50/80 border-rose-300 text-slate-900'
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase text-slate-400 block">
                        {av.role} {av.sex === 'MALE' ? '♂' : '♀'}
                      </span>
                      <p className="font-bold text-[11px] truncate">{av.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">{av.ringNumber}</p>
                    </div>
                  ))}
                </div>

                {/* CONECTOR 3 -> 4: Avós para Bisavós (Linha Sanguínea) */}
                {generationsCount >= 4 && (
                  <div className="w-[16px] h-[480px] relative shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 16 480" fill="none" preserveAspectRatio="none">
                      <path d="M 0,60 H 8 V 30 H 16 M 8,60 V 90 H 16" stroke={themeStyle === 'DARK_PRESTIGE' ? '#38bdf8' : '#0284c7'} strokeWidth="1.5" />
                      <path d="M 0,180 H 8 V 150 H 16 M 8,180 V 210 H 16" stroke={themeStyle === 'DARK_PRESTIGE' ? '#38bdf8' : '#0284c7'} strokeWidth="1.5" />
                      <path d="M 0,300 H 8 V 270 H 16 M 8,300 V 330 H 16" stroke={themeStyle === 'DARK_PRESTIGE' ? '#f43f5e' : '#e11d48'} strokeWidth="1.5" />
                      <path d="M 0,420 H 8 V 390 H 16 M 8,420 V 450 H 16" stroke={themeStyle === 'DARK_PRESTIGE' ? '#f43f5e' : '#e11d48'} strokeWidth="1.5" />
                    </svg>
                  </div>
                )}

                {/* 4. GERAÇÃO 3: BISAVÓS (8 Cards) */}
                {generationsCount >= 4 && (
                  <div className="w-[170px] shrink-0 h-[480px] flex flex-col justify-around">
                    {pedigree.greatGrandparents.map((bis, idx) => (
                      <div
                        key={idx}
                        className={`p-1.5 rounded border text-center space-y-0.5 shadow-2xs ${
                          bis.sex === 'MALE'
                            ? themeStyle === 'DARK_PRESTIGE'
                              ? 'bg-[#1e293b]/70 border-sky-500/30 text-slate-300'
                              : 'bg-sky-50/50 border-sky-200 text-slate-800'
                            : themeStyle === 'DARK_PRESTIGE'
                            ? 'bg-[#1e293b]/70 border-rose-500/30 text-slate-300'
                            : 'bg-rose-50/50 border-rose-200 text-slate-800'
                        }`}
                      >
                        <span className="text-[7.5px] font-bold text-slate-400 block truncate">
                          {bis.role}
                        </span>
                        <p className="font-bold text-[9.5px] truncate">{bis.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* CONECTOR 4 -> 5: Bisavós para Trisavós (se 5 gerações) */}
                {generationsCount >= 5 && (
                  <div className="w-[12px] h-[490px] relative shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 12 490" fill="none" preserveAspectRatio="none">
                      <path d="M 0,30 H 6 V 15 H 12 M 6,30 V 45 H 12" stroke="#64748b" strokeWidth="1" />
                      <path d="M 0,90 H 6 V 75 H 12 M 6,90 V 105 H 12" stroke="#64748b" strokeWidth="1" />
                      <path d="M 0,150 H 6 V 135 H 12 M 6,150 V 165 H 12" stroke="#64748b" strokeWidth="1" />
                      <path d="M 0,210 H 6 V 195 H 12 M 6,210 V 225 H 12" stroke="#64748b" strokeWidth="1" />
                      <path d="M 0,270 H 6 V 255 H 12 M 6,270 V 285 H 12" stroke="#64748b" strokeWidth="1" />
                      <path d="M 0,330 H 6 V 315 H 12 M 6,330 V 345 H 12" stroke="#64748b" strokeWidth="1" />
                      <path d="M 0,390 H 6 V 375 H 12 M 6,390 V 405 H 12" stroke="#64748b" strokeWidth="1" />
                      <path d="M 0,450 H 6 V 435 H 12 M 6,450 V 465 H 12" stroke="#64748b" strokeWidth="1" />
                    </svg>
                  </div>
                )}

                {/* 5. GERAÇÃO 4: TRISAVÓS (16 Cards) */}
                {generationsCount >= 5 && (
                  <div className="w-[150px] shrink-0 h-[490px] flex flex-col justify-around">
                    {pedigree.greatGreatGrandparents.map((tri, idx) => (
                      <div
                        key={idx}
                        className={`py-0.5 px-1 rounded text-center truncate ${
                          tri.sex === 'MALE'
                            ? 'bg-sky-950/40 text-sky-200 border border-sky-500/20 text-[7.5px]'
                            : 'bg-rose-950/40 text-rose-200 border border-rose-500/20 text-[7.5px]'
                        }`}
                      >
                        {tri.name}
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* --- BOTTOM FOOTER WITH REAL QR CODE & AUTHENTICITY (MATCHING SCREENSHOT) --- */}
              <div className={`px-8 py-3 border-t flex items-center justify-between relative z-10 ${
                themeStyle === 'DARK_PRESTIGE'
                  ? 'border-slate-700 bg-slate-900/90 text-slate-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                
                {/* Bottom Left: Genuine Scannable QR Code & Label */}
                {showQrCode && (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-300 shrink-0">
                      <QRCodeSVG
                        value={publicUrl}
                        size={54}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <span className={`font-extrabold block ${themeStyle === 'DARK_PRESTIGE' ? 'text-white' : 'text-slate-900'}`}>
                        Autenticação Digital BirdPro
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Acesse o laudo oficial escaneando o código QR
                      </span>
                      <span className="text-[9px] font-mono text-emerald-500 block">
                        www.birdpro.com.br/ave/{activeBird.id}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Right: Issue Date & System Signature */}
                <div className="text-right text-xs space-y-0.5">
                  <p className="font-bold text-slate-300 text-[11px]">
                    Certificado emitido em: <strong className="text-emerald-400">{new Date().toLocaleDateString('pt-BR')}</strong>
                  </p>
                  <p className="text-[9.5px] text-slate-400">
                    Documento gerado eletronicamente pela plataforma <strong>BirdPro</strong>
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}
