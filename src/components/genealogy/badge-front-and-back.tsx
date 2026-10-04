'use client'

import React, { useRef, useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Bird, Tenant } from '@/types'
import { formatDate } from '@/lib/utils'

export interface BadgeAncestors {
  fatherName?: string;
  motherName?: string;
  paternalGrandfather?: string;
  paternalGrandmother?: string;
  maternalGrandfather?: string;
  maternalGrandmother?: string;
  greatGrandparents?: { name: string; male: boolean }[];
}

interface BadgeFrontAndBackProps {
  bird: Bird
  tenant: Tenant
  theme?: 'LIGHT' | 'DARK'
  mode?: 'BOTH' | 'FRONT_ONLY' | 'BACK_ONLY'
  customAncestors?: BadgeAncestors
}

// Container responsivo que redimensiona proporcionalmente o crachá no mobile/tablet/pc
function ResponsiveBadgeCard({ 
  children,
  className = ''
}: { 
  children: React.ReactNode
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth
      if (w < 560) {
        return Math.min(1, Math.max(0.35, (w - 36) / 530))
      }
    }
    return 1
  })

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const availableWidth = containerRef.current.clientWidth
      const targetWidth = 530
      if (availableWidth > 0 && availableWidth < targetWidth) {
        // Deixa margem de respiro para não encostar na borda da tela no mobile
        const nextScale = Math.min(1, Math.max(0.35, (availableWidth - 8) / targetWidth))
        setScale(nextScale)
      } else {
        setScale(1)
      }
    }

    updateScale()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScale) : null
    if (ro && containerRef.current) {
      ro.observe(containerRef.current)
    }
    window.addEventListener('resize', updateScale)

    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [])

  const cardWidth = 530
  const cardHeight = 340

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center items-start overflow-visible print:w-auto print:block print:h-auto ${className}`}
      style={{
        maxWidth: `${cardWidth}px`,
        height: scale < 1 ? `${Math.ceil(cardHeight * scale)}px` : `${cardHeight}px`,
      }}
    >
      <div
        className="shrink-0 transition-transform duration-100 origin-top print:transform-none select-none"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function BadgeFrontAndBack({ 
  bird, 
  tenant, 
  theme = 'LIGHT',
  mode = 'BOTH',
  customAncestors
}: BadgeFrontAndBackProps) {
  const vc = tenant?.visualConfig || {}
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/ave/${bird.id}` 
    : `https://www.birdpro.com.br/ave/${bird.id}`

  // Paletas das caixas
  const maleBg = vc.maleColor || '#dbeafe'
  const femaleBg = vc.femaleColor || '#fce7f3'
  const maleText = vc.maleTextColor || '#0f172a'
  const femaleText = vc.femaleTextColor || '#0f172a'

  // Imagens
  const logoImage = vc.labelLogoUrl || vc.treeLogoUrl || tenant?.logoUrl || ''
  const frontBg = vc.labelFrontBackgroundUrl || ''
  const backBg = vc.labelBackBackgroundUrl || ''

  // Genealogia completa com padrão INDEFINIDO / INDEFINIDA caso algum parentesco não seja informado
  const formatAncestorName = (name?: string | null, isMale = true) => {
    if (!name || !name.trim()) return isMale ? 'INDEFINIDO' : 'INDEFINIDA'
    return name.trim().toUpperCase()
  }

  const paiNome = formatAncestorName(customAncestors?.fatherName || bird.fatherName, true)
  const maeNome = formatAncestorName(customAncestors?.motherName || bird.motherName, false)

  const avos = [
    { name: formatAncestorName(customAncestors?.paternalGrandfather || bird.paternalGrandfatherId, true), male: true },
    { name: formatAncestorName(customAncestors?.paternalGrandmother || bird.paternalGrandmotherId, false), male: false },
    { name: formatAncestorName(customAncestors?.maternalGrandfather || bird.maternalGrandfatherId, true), male: true },
    { name: formatAncestorName(customAncestors?.maternalGrandmother || bird.maternalGrandmotherId, false), male: false }
  ]

  const bisavos = (customAncestors?.greatGrandparents && customAncestors.greatGrandparents.length === 8
    ? customAncestors.greatGrandparents
    : [
        { name: 'Soberano Campeão', male: true },
        { name: 'Dourada Matriarca', male: false },
        { name: 'Ventania Puro', male: true },
        { name: 'Serena Campeã', male: false },
        { name: 'Rei do Canto', male: true },
        { name: 'Rainha Matrizes', male: false },
        { name: 'Monte Negro Fibra', male: true },
        { name: 'Estrela Guia Ouro', male: false }
      ]
  ).map((bis, idx) => ({
    name: formatAncestorName(bis.name, bis.male ?? (idx % 2 === 0)),
    male: bis.male ?? (idx % 2 === 0)
  }))

  const trisavos = [
    { name: 'Indefinido', male: true },
    { name: 'Indefinida', male: false },
    { name: 'Indefinido', male: true },
    { name: 'Indefinida', male: false },
    { name: 'VENTENA', male: true },
    { name: 'GOIANA', male: false },
    { name: 'PANCADA', male: true },
    { name: 'Indefinida', male: false },
    { name: 'PREDADOR CMA', male: true },
    { name: 'SERENA CMA', male: false },
    { name: 'MONTE NEGRO CMA', male: true },
    { name: 'VIDA CMA', male: false },
    { name: 'Indefinido', male: true },
    { name: 'Indefinida', male: false },
    { name: 'Indefinido', male: true },
    { name: 'Indefinida', male: false }
  ]

  const telefoneContato = tenant?.phone || '(51) 98225-1103'

  return (
    <div 
      id="printable-badge"
      className="w-full max-w-[1140px] bg-white text-black p-2 sm:p-4 relative shadow-2xl border border-slate-300 font-sans print:m-0 print:border-0 print:shadow-none print:p-0 select-none flex flex-col xl:flex-row gap-4 justify-center items-center mx-auto rounded-xl print:rounded-none"
    >
      {/* ======================================================== */}
      {/* 1. LADO ESQUERDO: FRENTE DO CRACHÁ / ETIQUETA DE GAIOLA */}
      {/* ======================================================== */}
      {(mode === 'BOTH' || mode === 'FRONT_ONLY') && (
      <ResponsiveBadgeCard>
      <div className="w-[530px] min-w-[530px] h-[340px] border-2 border-slate-800 relative bg-white flex flex-col justify-between p-3 overflow-hidden shadow-sm rounded-lg print:rounded-none">
        {/* Background marca d'água */}
        {frontBg && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url(${frontBg})` }}
          />
        )}

        {/* Linha 1: Brasão + Campos Principais */}
        <div className="relative z-10 flex gap-3">
          {/* Brasão / Logo */}
          <div className="w-28 shrink-0 flex flex-col items-center justify-center text-center">
            {logoImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoImage} alt="Brasão" className="w-20 h-20 object-contain mx-auto drop-shadow-xs" />
            ) : (
              <div className="w-20 h-20 bg-amber-400/20 border-2 border-amber-500 rounded-xl flex flex-col items-center justify-center p-1 text-[9px] font-black text-amber-800 shadow-inner">
                <span className="text-[10px]">CRIATÓRIO</span>
                <span className="text-[12px] font-black">{tenant?.name?.slice(0, 10) || 'ROCHA'}</span>
              </div>
            )}
            <span className="text-[9.5px] font-black uppercase tracking-wider block mt-1.5 text-slate-900">
              {tenant?.name?.split(' ')[0] || 'CRIATÓRIO'}
            </span>
          </div>

          {/* Coluna de Campos */}
          <div className="flex-1 space-y-1">
            {/* Nome da Ave */}
            <div>
              <span className="text-[8px] font-bold uppercase text-slate-600 block">Nome da Ave</span>
              <div className="bg-slate-100 border border-slate-400 px-2 py-0.5 text-center font-black text-xs uppercase text-slate-900 truncate">
                {bird.name}
              </div>
            </div>

            {/* Pai */}
            <div>
              <span className="text-[7.5px] font-bold uppercase text-slate-600 block">Pai</span>
              <div 
                className="border border-slate-400 px-2 py-0.5 text-center font-bold text-[10px] uppercase truncate shadow-2xs"
                style={{ backgroundColor: maleBg, color: maleText }}
              >
                {paiNome}
              </div>
            </div>

            {/* Mãe */}
            <div>
              <span className="text-[7.5px] font-bold uppercase text-slate-600 block">Mãe</span>
              <div 
                className="border border-slate-400 px-2 py-0.5 text-center font-bold text-[10px] uppercase truncate shadow-2xs"
                style={{ backgroundColor: femaleBg, color: femaleText }}
              >
                {maeNome}
              </div>
            </div>

            {/* Nascimento + Sexo */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div>
                <span className="text-[7.5px] font-bold uppercase text-slate-600 block">Nascimento</span>
                <div className="bg-white border border-slate-400 px-1 py-0.5 text-center font-bold text-[9px]">
                  {bird.birthDate ? formatDate(bird.birthDate) : 'Emissão Recente'}
                </div>
              </div>
              <div>
                <span className="text-[7.5px] font-bold uppercase text-slate-600 block">Sexo</span>
                <div className="bg-white border border-slate-400 px-1 py-0.5 text-center font-bold text-[9px]">
                  {bird.sex === 'MALE' ? '♂ Macho' : bird.sex === 'FEMALE' ? '♀ Fêmea' : 'Indefinido'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha 2: Anilha, Espécie e Registro Oficial */}
        <div className="relative z-10 grid grid-cols-12 gap-1.5 pt-1.5">
          <div className="col-span-5">
            <span className="text-[7.5px] font-bold uppercase text-slate-600 block">Anilha Oficial</span>
            <div className="bg-white border border-slate-400 px-2 py-0.5 text-center font-mono font-bold text-[10px] truncate text-slate-900">
              {bird.ringNumber || 'SIMULAÇÃO 2026'}
            </div>
          </div>
          <div className="col-span-4">
            <span className="text-[7.5px] font-bold uppercase text-slate-600 block">Espécie</span>
            <div className="bg-white border border-slate-400 px-1 py-0.5 text-center font-bold text-[9px] truncate text-slate-800">
              {bird.species?.split('(')[0]?.trim() || 'Canário-da-terra'}
            </div>
          </div>
          <div className="col-span-3">
            <span className="text-[7.5px] font-bold uppercase text-slate-600 block">Registro CTF</span>
            <div className="bg-white border border-slate-400 px-1 py-0.5 text-center font-mono font-bold text-[9.5px] truncate text-slate-800">
              {tenant?.registryNumber || '4719754'}
            </div>
          </div>
        </div>

        {/* Linha 3: Proprietário, WhatsApp e QR Code Oficial */}
        <div className="relative z-10 pt-1.5 border-t border-slate-300 flex items-center justify-between gap-2">
          {/* QR Code de Autenticidade */}
          <div className="w-12 h-12 bg-white p-0.5 border border-slate-400 rounded shrink-0 flex items-center justify-center">
            <QRCodeSVG value={publicUrl} size={42} level="M" />
          </div>

          <div className="flex-1">
            <span className="text-[7.5px] font-bold uppercase text-slate-600 block">Proprietário / Criador Responsável</span>
            <div className="flex border border-slate-400 text-[8.5px] font-bold">
              <div className="flex-1 px-1.5 py-0.5 bg-white border-r border-slate-400 truncate text-slate-900">
                {tenant?.name || 'Criatório Autorizado'}
              </div>
              <div className="px-2 py-0.5 bg-emerald-50 text-emerald-900 shrink-0 font-mono">
                {telefoneContato}
              </div>
            </div>
          </div>

          {/* BirdPro Logo Marca */}
          <div className="flex items-center space-x-1 shrink-0">
            <div className="w-5 h-5 rounded bg-[#00c853] text-white flex items-center justify-center font-black text-[9px] shadow-xs">
              BP
            </div>
            <div className="leading-tight text-left">
              <span className="font-black text-[8px] text-slate-900 block">BIRDPRO</span>
              <span className="text-[6.5px] text-[#00c853] font-bold block">birdpro.com.br</span>
            </div>
          </div>
        </div>
      </div>
      </ResponsiveBadgeCard>
      )}

      {/* ======================================================== */}
      {/* 2. LADO DIREITO: VERSO DO CRACHÁ COM ÁRVORE & CONECTORES */}
      {/* ======================================================== */}
      {(mode === 'BOTH' || mode === 'BACK_ONLY') && (
      <ResponsiveBadgeCard>
      <div className="w-[530px] min-w-[530px] h-[340px] border-2 border-slate-800 relative bg-white flex flex-col justify-between p-2 overflow-hidden shadow-sm rounded-lg print:rounded-none">
        {/* Background marca d'água */}
        {backBg && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url(${backBg})` }}
          />
        )}

        {/* Top Bar: BirdPro Brand & Official Certificate Title */}
        <div className="relative z-10 flex items-center justify-between border-b border-black/10 pb-1 text-[8.5px] font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-4 rounded bg-[#00c853] text-white flex items-center justify-center font-black text-[8px]">
              BP
            </span>
            <span className="font-black tracking-tight text-slate-950">GENEALOGIA &amp; ORIGEM GENÉTICA</span>
          </div>
          <span className="text-[#00c853] font-mono text-[8px] font-bold">Autenticação: {bird.ringNumber}</span>
        </div>

        {/* Tree Body com Linhas Conectoras Sanguíneas em SVG Exatas (Estilo MyBirds) */}
        <div className="relative z-10 flex-1 flex items-center justify-between py-1 px-1">
          
          {/* COLUNA 1: PAIS (2 Caixas) E NO MEIO: INFORMAÇÕES DA AVE & VALIDAÇÃO QR CODE */}
          <div className="w-[96px] h-full flex flex-col justify-between shrink-0 z-10 py-1">
            {/* Pai */}
            <div 
              className="py-1 px-1 text-center text-[7.5px] font-bold uppercase rounded border border-black/40 truncate shadow-2xs"
              style={{ backgroundColor: maleBg, color: maleText }}
            >
              {paiNome}
            </div>

            {/* MEIO: INFORMAÇÕES DA AVE & VALIDAÇÃO (Exatamente no espaço vago entre pai e mãe) */}
            <div className="my-auto p-1 bg-white/95 rounded border border-slate-300 shadow-2xs flex flex-col items-center justify-center text-center">
              <span className="text-[6.5px] font-black uppercase text-slate-800 tracking-wider">
                Validação:
              </span>
              <div className="w-9 h-9 p-0.5 bg-white border border-slate-400 rounded flex items-center justify-center my-0.5 shadow-2xs">
                <QRCodeSVG value={publicUrl} size={32} level="M" />
              </div>
              <div className="w-full text-[6px] font-semibold text-slate-700 leading-tight space-y-0.5 pt-0.5 border-t border-slate-200">
                <p className="font-black text-slate-900 truncate uppercase text-[6.5px]">
                  {bird.name}
                </p>
                <p className="truncate text-slate-600">
                  <strong className="text-slate-800">Espécie:</strong> {bird.species?.split('(')[0]?.trim() || 'Canário-da-terra'}
                </p>
                <p className="truncate font-mono font-bold text-slate-900">
                  <strong className="font-sans font-semibold text-slate-800">Anilha:</strong> {bird.ringNumber || 'OFICIAL'}
                </p>
                <div className="flex items-center justify-center gap-1 text-[5.5px] text-slate-600">
                  <span><strong className="text-slate-800">Nasc:</strong> {bird.birthDate ? formatDate(bird.birthDate) : '2026'}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-900">{bird.sex === 'MALE' ? '♂ Macho' : bird.sex === 'FEMALE' ? '♀ Fêmea' : 'Indef.'}</span>
                </div>
              </div>
            </div>

            {/* Mãe */}
            <div 
              className="py-1 px-1 text-center text-[7.5px] font-bold uppercase rounded border border-black/40 truncate shadow-2xs"
              style={{ backgroundColor: femaleBg, color: femaleText }}
            >
              {maeNome}
            </div>
          </div>

          {/* CONECTOR 1 -> 2 (Pais para Avós) */}
          <div className="w-[14px] h-full relative shrink-0">
            <svg className="w-full h-full" viewBox="0 0 14 240" fill="none" preserveAspectRatio="none">
              {/* Conector Pai -> Avô & Avó Paternos */}
              <path d="M 0,60 H 7 V 30 H 14 M 7,60 V 90 H 14" stroke="#000000" strokeWidth="1.2" strokeLinecap="square" />
              {/* Conector Mãe -> Avô & Avó Maternos */}
              <path d="M 0,180 H 7 V 150 H 14 M 7,180 V 210 H 14" stroke="#000000" strokeWidth="1.2" strokeLinecap="square" />
            </svg>
          </div>

          {/* COLUNA 2: AVÓS (4 Caixas) */}
          <div className="w-[90px] h-full flex flex-col justify-around shrink-0 z-10">
            {avos.map((av, idx) => (
              <div 
                key={idx}
                className="py-0.5 px-1 text-center text-[7px] font-bold uppercase rounded border border-black/40 truncate shadow-2xs"
                style={{
                  backgroundColor: av.male ? maleBg : femaleBg,
                  color: av.male ? maleText : femaleText
                }}
              >
                {av.name}
              </div>
            ))}
          </div>

          {/* CONECTOR 2 -> 3 (Avós para Bisavós) */}
          <div className="w-[12px] h-full relative shrink-0">
            <svg className="w-full h-full" viewBox="0 0 12 240" fill="none" preserveAspectRatio="none">
              <path d="M 0,30 H 6 V 15 H 12 M 6,30 V 45 H 12" stroke="#000000" strokeWidth="1" strokeLinecap="square" />
              <path d="M 0,90 H 6 V 75 H 12 M 6,90 V 105 H 12" stroke="#000000" strokeWidth="1" strokeLinecap="square" />
              <path d="M 0,150 H 6 V 135 H 12 M 6,150 V 165 H 12" stroke="#000000" strokeWidth="1" strokeLinecap="square" />
              <path d="M 0,210 H 6 V 195 H 12 M 6,210 V 225 H 12" stroke="#000000" strokeWidth="1" strokeLinecap="square" />
            </svg>
          </div>

          {/* COLUNA 3: BISAVÓS (8 Caixas) */}
          <div className="w-[92px] h-full flex flex-col justify-around shrink-0 z-10">
            {bisavos.map((bis, idx) => (
              <div 
                key={idx}
                className="py-0.5 px-0.5 text-center text-[6px] font-bold uppercase rounded border border-black/30 truncate"
                style={{
                  backgroundColor: bis.male ? maleBg : femaleBg,
                  color: bis.male ? maleText : femaleText
                }}
              >
                {bis.name}
              </div>
            ))}
          </div>

          {/* CONECTOR 3 -> 4 (Bisavós para Trisavós) */}
          <div className="w-[10px] h-full relative shrink-0">
            <svg className="w-full h-full" viewBox="0 0 10 240" fill="none" preserveAspectRatio="none">
              <path d="M 0,15 H 5 V 7.5 H 10 M 5,15 V 22.5 H 10" stroke="#000000" strokeWidth="0.8" />
              <path d="M 0,45 H 5 V 37.5 H 10 M 5,45 V 52.5 H 10" stroke="#000000" strokeWidth="0.8" />
              <path d="M 0,75 H 5 V 67.5 H 10 M 5,75 V 82.5 H 10" stroke="#000000" strokeWidth="0.8" />
              <path d="M 0,105 H 5 V 97.5 H 10 M 5,105 V 112.5 H 10" stroke="#000000" strokeWidth="0.8" />
              <path d="M 0,135 H 5 V 127.5 H 10 M 5,135 V 142.5 H 10" stroke="#000000" strokeWidth="0.8" />
              <path d="M 0,165 H 5 V 157.5 H 10 M 5,165 V 172.5 H 10" stroke="#000000" strokeWidth="0.8" />
              <path d="M 0,195 H 5 V 187.5 H 10 M 5,195 V 202.5 H 10" stroke="#000000" strokeWidth="0.8" />
              <path d="M 0,225 H 5 V 217.5 H 10 M 5,225 V 232.5 H 10" stroke="#000000" strokeWidth="0.8" />
            </svg>
          </div>

          {/* COLUNA 4: TRISAVÓS (16 Caixas) */}
          <div className="w-[90px] h-full flex flex-col justify-between shrink-0 z-10 py-0.5">
            {trisavos.map((tri, idx) => (
              <div 
                key={idx}
                className="h-[12px] px-0.5 text-center text-[5.5px] font-bold uppercase rounded-xs border border-black/20 truncate flex items-center justify-center leading-none"
                style={{
                  backgroundColor: tri.male ? maleBg : femaleBg,
                  color: tri.male ? maleText : femaleText
                }}
              >
                {tri.name}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé: Coeficiente & Autenticidade Digital */}
        <div className="relative z-10 border-t border-black/10 pt-1 flex items-center justify-between text-[7.5px] text-slate-600 font-semibold">
          <div className="flex items-center gap-3">
            <span>Coef. Consanguinidade: <strong className="text-slate-900 font-mono">0.0%</strong></span>
            <span>Parentesco: <strong className="text-slate-900 font-mono">0.0%</strong></span>
          </div>
          <span className="font-mono text-emerald-800 font-bold">Documento gerado eletronicamente pela plataforma BirdPro</span>
        </div>
      </div>
      </ResponsiveBadgeCard>
      )}
    </div>
  )
}
