'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { 
  GitFork, 
  Printer, 
  Download, 
  ExternalLink, 
  Eye, 
  Check, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  Layers,
  ChevronDown
} from 'lucide-react'
import { db } from '@/lib/db'
import { Bird, Tenant } from '@/types'
import { resolvePedigreeTree } from '@/lib/pedigree'

export default function NovaGenealogiaConfigPage() {
  const tenant = db.getTenant()
  const birds = db.getBirds()
  
  const [selectedBirdId, setSelectedBirdId] = useState(birds[0]?.id || '')
  const [generations, setGenerations] = useState<3 | 4 | 5 | 6>(4)
  const [themeStyle, setThemeStyle] = useState<'DARK_PRESTIGE' | 'CLASSIC_LIGHT' | 'BADGE_PRO'>('DARK_PRESTIGE')
  const [showCertificateTitle, setShowCertificateTitle] = useState(true)
  const [showQrCode, setShowQrCode] = useState(true)

  const selectedBird = birds.find(b => b.id === selectedBirdId) || birds[0]

  // Resolve dynamic pedigree tree from database
  const pedigree = resolvePedigreeTree(selectedBird, birds)

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ave/${selectedBird.id}`
    : `https://www.birdpro.com.br/ave/${selectedBird.id}`

  const handlePrint = () => {
    window.print()
  }

  const handleOpenPdf = () => {
    if (typeof window !== 'undefined') {
      window.open(`/ave/${selectedBird.id}?print=1&style=${themeStyle}&gen=${generations}`, '_blank')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Top Breadcrumb & Actions Bar (Hidden on print) */}
      <div className="bg-white dark:bg-[#1e252b] p-4 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#00c853]/15 text-[#00c853] rounded-xl">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
              Certificado de Árvore Genealógica &amp; Pedigree
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Gere certificados oficiais de 3ª a 6ª geração com QR Code escaneável e impressão A4 em alta resolução
            </p>
          </div>
        </div>

        {/* Print & PDF Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleOpenPdf}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-xs transition cursor-pointer border border-slate-600"
            title="Abrir em nova aba para salvar em PDF"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Abrir / Baixar PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 px-5 py-2 rounded-lg font-black text-xs shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Imprimir Certificado</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Selecione Ave | Gerações | Tema | Checkboxes (Hidden on print) */}
      <div className="bg-white dark:bg-[#1e252b] p-5 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 print:hidden">
        
        {/* Left Inputs */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          
          {/* Selecione a Ave Modelo */}
          <div className="min-w-[260px]">
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              Selecione a Ave Modelo
            </label>
            <select
              value={selectedBirdId}
              onChange={e => setSelectedBirdId(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-slate-50 dark:bg-[#151b22] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00c853] cursor-pointer"
            >
              {birds.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.ringNumber}) - {b.species.split('(')[0].trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Gerações para Exibição */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              Gerações para Exibição
            </label>
            <select
              value={generations}
              onChange={e => setGenerations(Number(e.target.value) as any)}
              className="text-xs font-bold px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-slate-50 dark:bg-[#151b22] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#00c853] cursor-pointer"
            >
              <option value={3}>3 Gerações (Pais e Avós)</option>
              <option value={4}>4 Gerações (Até Bisavós)</option>
              <option value={5}>5 Gerações (Até Trisavós)</option>
            </select>
          </div>

          {/* Tema Visual */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              Estilo Visual
            </label>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-[#151b22] p-0.5 border border-gray-300 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setThemeStyle('DARK_PRESTIGE')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  themeStyle === 'DARK_PRESTIGE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🌙 Dark Prestige
              </button>
              <button
                type="button"
                onClick={() => setThemeStyle('CLASSIC_LIGHT')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  themeStyle === 'CLASSIC_LIGHT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🌟 Clássico A4
              </button>
            </div>
          </div>

        </div>

        {/* Right Checkboxes */}
        <div className="flex items-center gap-5 pt-2 sm:pt-0">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              id="certTitle"
              checked={showCertificateTitle}
              onChange={e => setShowCertificateTitle(e.target.checked)}
              className="w-4 h-4 accent-[#00c853] rounded cursor-pointer"
            />
            <span>Imprimir cabeçalho "CERTIFICADO"</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              id="qrCode"
              checked={showQrCode}
              onChange={e => setShowQrCode(e.target.checked)}
              className="w-4 h-4 accent-[#00c853] rounded cursor-pointer"
            />
            <span>Incluir QR Code de Autenticidade</span>
          </label>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TREE CERTIFICATE PREVIEW CANVAS (Exact styling structured like Crachá)    */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 flex justify-center overflow-x-auto print:p-0">
        
        <div 
          id="pedigree-certificate"
          className={`w-[1140px] min-w-[1140px] h-[720px] rounded-2xl p-6 relative shadow-2xl overflow-hidden font-sans select-none flex flex-col justify-between print:m-0 print:border-0 print:shadow-none ${
            themeStyle === 'DARK_PRESTIGE'
              ? 'bg-[#111827] text-white border border-slate-700'
              : 'bg-white text-slate-900 border border-slate-300'
          }`}
        >
          
          {/* Header Title */}
          {showCertificateTitle && (
            <div className={`text-center border-b pb-3 mb-4 relative z-10 ${
              themeStyle === 'DARK_PRESTIGE' ? 'border-emerald-500/20 bg-slate-900/40' : 'border-emerald-600/30 bg-slate-50/60'
            }`}>
              <h2 className={`text-xl sm:text-2xl font-black tracking-widest uppercase ${
                themeStyle === 'DARK_PRESTIGE' ? 'text-emerald-400 drop-shadow-sm' : 'text-slate-950'
              }`}>
                CERTIFICADO DE ORIGEM &amp; GENEALOGIA
              </h2>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${
                themeStyle === 'DARK_PRESTIGE' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {tenant.name} • REGISTRO IBAMA / SISPASS: {tenant.registryNumber || '4719754'}
              </p>
            </div>
          )}

          {/* Main Tree Columns (Matching Crachá & Tree Structure) */}
          <div className="grid grid-cols-4 gap-4 items-center flex-1 relative z-10 px-2">
            
            {/* 1. Main Bird Card (Indivíduo Principal) */}
            <div className="p-5 bg-slate-900/90 border-2 border-[#00c853] rounded-xl shadow-lg text-center space-y-2.5">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#00c853] text-slate-950 uppercase tracking-wider inline-block">
                INDIVÍDUO PRINCIPAL
              </span>
              <h3 className="font-black text-base text-white uppercase tracking-wide">
                {selectedBird?.name}
              </h3>
              <p className="text-xs font-mono font-bold text-emerald-400 bg-black/40 py-1 px-2 rounded">
                Anilha: {selectedBird?.ringNumber}
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                {selectedBird?.species}
              </p>
              <p className="text-[11px] text-slate-400 font-bold">
                Sexo: {selectedBird?.sex === 'MALE' ? '♂ Macho' : selectedBird?.sex === 'FEMALE' ? '♀ Fêmea' : 'Indefinido'}
              </p>
            </div>

            {/* 2. Parents (1ª Geração: Pai ♂ e Mãe ♀ com dados reais) */}
            <div className="space-y-4">
              
              {/* Pai */}
              <div className="p-3 bg-sky-950/40 border-2 border-sky-500 rounded-xl text-center space-y-1 shadow-sm">
                <span className="text-[9px] font-black text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30 uppercase inline-block">
                  PAI (1ª GERAÇÃO) ♂
                </span>
                <p className="text-xs font-black text-sky-400 uppercase truncate">
                  {pedigree.father.name}
                </p>
                <p className="text-[10px] font-mono font-bold text-slate-400">
                  {pedigree.father.ringNumber}
                </p>
              </div>

              {/* Mãe */}
              <div className="p-3 bg-rose-950/40 border-2 border-rose-500 rounded-xl text-center space-y-1 shadow-sm">
                <span className="text-[9px] font-black text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 uppercase inline-block">
                  MÃE (1ª GERAÇÃO) ♀
                </span>
                <p className="text-xs font-black text-rose-400 uppercase truncate">
                  {pedigree.mother.name}
                </p>
                <p className="text-[10px] font-mono font-bold text-slate-400">
                  {pedigree.mother.ringNumber}
                </p>
              </div>

            </div>

            {/* 3. Grandparents (2ª Geração: 4 Avós) */}
            <div className="space-y-2">
              {pedigree.grandparents.map((av, idx) => (
                <div 
                  key={idx}
                  className={`p-2 rounded-lg border text-center space-y-0.5 shadow-xs ${
                    av.sex === 'MALE'
                      ? 'bg-sky-950/30 border-sky-500/40 text-slate-200'
                      : 'bg-rose-950/30 border-rose-500/40 text-slate-200'
                  }`}
                >
                  <span className="text-[8px] font-black text-slate-400 uppercase block">
                    {av.role} {av.sex === 'MALE' ? '♂' : '♀'}
                  </span>
                  <p className="text-[11px] font-bold truncate text-slate-100">{av.name}</p>
                  <p className="text-[9px] font-mono text-slate-400">{av.ringNumber}</p>
                </div>
              ))}
            </div>

            {/* 4. Bisavós (3ª Geração: 8 Bisavós) */}
            <div className="space-y-1.5">
              {pedigree.greatGrandparents.map((bis, idx) => (
                <div 
                  key={idx}
                  className={`p-1.5 rounded border text-center space-y-0.5 shadow-2xs ${
                    bis.sex === 'MALE'
                      ? 'bg-sky-950/20 border-sky-500/30 text-slate-300'
                      : 'bg-rose-950/20 border-rose-500/30 text-slate-300'
                  }`}
                >
                  <span className="text-[7.5px] font-bold text-slate-400 block truncate">
                    {bis.role}
                  </span>
                  <p className="text-[9.5px] font-bold text-slate-200 truncate">{bis.name}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Genuine Scannable QR Code Footer (Fixed & Working 100%) */}
          {showQrCode && (
            <div className={`mt-4 pt-4 border-t flex items-center justify-between text-xs relative z-10 ${
              themeStyle === 'DARK_PRESTIGE' ? 'border-slate-700/80 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}>
              {/* QR Code Scannable */}
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-300 shrink-0">
                  <QRCodeSVG
                    value={publicUrl}
                    size={56}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs">Autenticação Digital BirdPro</p>
                  <p className="text-[10px] text-slate-400">Acesse o laudo oficial escaneando o código QR</p>
                  <p className="text-[9px] font-mono text-emerald-400 mt-0.5">www.birdpro.com.br/ave/{selectedBird.id}</p>
                </div>
              </div>

              {/* Timestamp & Disclaimer */}
              <div className="text-right space-y-0.5">
                <p className="font-bold text-slate-300 text-[11px]">
                  Certificado emitido em: <strong className="text-emerald-400">{new Date().toLocaleDateString('pt-BR')}</strong>
                </p>
                <p className="text-[9.5px] text-slate-400">Documento gerado eletronicamente pela plataforma <strong>BirdPro</strong></p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
