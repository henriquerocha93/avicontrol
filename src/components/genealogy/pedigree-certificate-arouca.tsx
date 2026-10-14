'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Bird, Tenant } from '@/types'
import { formatDate } from '@/lib/utils'
import { resolvePedigreeTree, PedigreeNode } from '@/lib/pedigree'

export interface PedigreeCertificateAroucaProps {
  bird: Bird
  tenant?: Tenant | null
  generationsCount?: number
  showQrCode?: boolean
  publicUrl?: string
}

export function PedigreeCertificateArouca({
  bird,
  tenant,
  generationsCount = 5,
  showQrCode = true,
  publicUrl: customPublicUrl
}: PedigreeCertificateAroucaProps) {
  if (!bird) return null

  const vc = tenant?.visualConfig || {}

  // Logos & Imagens configuradas no criatório
  const logoUrl = vc.treeLogoUrl || vc.labelLogoUrl || vc.logoGenealogyUrl || tenant?.logoUrl || ''
  const bgWatermarkUrl = vc.treeBackgroundUrl || vc.bgGenealogyUrl || vc.labelFrontBackgroundUrl || logoUrl || bird.photoUrl || ''

  // Paleta configurada ou padrão oficial (Amarelo Canário Ouro & Preto profundo do print de referência)
  const maleBg = vc.maleColor || vc.colorPaletteMale || '#ffd000'
  const femaleBg = vc.femaleColor || vc.colorPaletteFemale || '#000000'
  const maleTextColor = vc.maleTextColor || vc.colorTextPaletteMale || '#000000'
  const femaleTextColor = vc.femaleTextColor || vc.colorTextPaletteFemale || '#ffd000'

  // URL de validação para o QR Code
  const baseUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://www.birdpro.com.br'

  const queryParams = new URLSearchParams()
  if (bird.ringNumber) queryParams.set('r', bird.ringNumber)
  if (bird.name) queryParams.set('n', bird.name)
  if (bird.species) queryParams.set('s', bird.species)
  if (bird.sex) queryParams.set('x', bird.sex)
  if (tenant?.name) queryParams.set('t', tenant.name)
  if (tenant?.registryNumber) queryParams.set('c', tenant.registryNumber)
  const qs = queryParams.toString() ? `?${queryParams.toString()}` : ''

  const publicUrl = customPublicUrl || `${baseUrl}/ave/${encodeURIComponent(bird.id)}${qs}`

  // Resolução da árvore genealógica de até 5 gerações
  const pedigree = resolvePedigreeTree(bird)

  // Espécie e nome científico
  const speciesParts = (bird.species || 'Canário-da-terra (Sicalis flaveola)').split('(')
  const speciesCommon = speciesParts[0].trim()
  const speciesScientific = speciesParts[1] ? `(${speciesParts[1].replace(')', '').trim()})` : ''

  // Contato / Instagram / Site
  const criadorNome = tenant?.ownerName || tenant?.name || 'CRIADOR OFICIAL'
  const ctfIbama = tenant?.registryNumber ? `CTF: ${tenant.registryNumber}` : 'SISPASS / IBAMA'
  const criatorioNome = tenant?.name ? `CRIATÓRIO ${tenant.name.toUpperCase()}` : 'CRIATÓRIO AUTORIZADO'
  const localidade = tenant?.city && tenant?.state 
    ? `${tenant.city}/${tenant.state}` 
    : tenant?.city || tenant?.state || 'Brasil'

  let contatoRede = ''
  if (tenant?.instagram) {
    const cleanIg = tenant.instagram.replace('@', '').trim()
    contatoRede = cleanIg.startsWith('http') ? cleanIg : `www.instagram.com/${cleanIg}`
  } else if (tenant?.website) {
    contatoRede = tenant.website
  } else if (tenant?.phone || tenant?.cellphone) {
    contatoRede = tenant.phone || tenant.cellphone || ''
  } else {
    contatoRede = 'www.birdpro.com.br'
  }

  const formatNodeName = (node?: PedigreeNode | null, isMale = true): string => {
    if (!node || !node.name || !node.name.trim() || node.name === 'INDEFINIDO' || node.name === 'INDEFINIDA') {
      return 'INDEFINIDO'
    }
    return node.name.trim().toUpperCase()
  }

  return (
    <div
      id="pedigree-certificate"
      className="w-[1140px] min-w-[1140px] h-[780px] max-h-[780px] relative bg-white text-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden font-sans select-none flex flex-col justify-between p-4 print:m-0 print:border-0 print:shadow-none print:w-full print:h-full print:max-h-none print:p-3"
      style={{
        backgroundImage: 'radial-gradient(circle at center, #ffffff 60%, #fafafa 100%)'
      }}
    >
      {/* ======================================================== */}
      {/* DETALHES DECORATIVOS: CANTOS CHANFRADOS EM OURO E PRETO */}
      {/* ======================================================== */}
      {/* Canto Superior Esquerdo */}
      <div className="absolute top-0 left-0 pointer-events-none z-0">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <polygon points="0,0 120,0 0,120" fill="#ffcc00" />
          <polygon points="0,0 80,0 0,80" fill="#000000" />
          <line x1="0" y1="80" x2="80" y2="0" stroke="#ffcc00" strokeWidth="3" />
          <line x1="0" y1="120" x2="120" y2="0" stroke="#000000" strokeWidth="3" />
        </svg>
      </div>

      {/* Canto Inferior Direito */}
      <div className="absolute bottom-0 right-0 pointer-events-none z-0">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <polygon points="120,120 0,120 120,0" fill="#ffcc00" />
          <polygon points="120,120 40,120 120,40" fill="#000000" />
          <line x1="40" y1="120" x2="120" y2="40" stroke="#ffcc00" strokeWidth="3" />
          <line x1="0" y1="120" x2="120" y2="0" stroke="#000000" strokeWidth="3" />
        </svg>
      </div>

      {/* ======================================================== */}
      {/* MARCA D'ÁGUA CENTRAL TRANSLÚCIDA DO CRIATÓRIO             */}
      {/* ======================================================== */}
      {bgWatermarkUrl && (
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-0"
          style={{ opacity: 0.16 }}
        >
          <img
            src={bgWatermarkUrl}
            alt="Marca d'água do Criatório"
            className="max-w-[480px] max-h-[380px] object-contain filter drop-shadow-sm"
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* CABEÇALHO DO CERTIFICADO: LOGO + DADOS + TÍTULO + QR CODE*/}
      {/* ======================================================== */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-slate-300 pb-3 pl-8 pr-4">
        
        {/* Esquerda: Brasão do Criatório + Dados do Criador e Registro */}
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="w-[84px] h-[84px] p-1 bg-white rounded-xl border border-slate-300 shadow-sm flex items-center justify-center shrink-0">
              <img 
                src={logoUrl} 
                alt="Brasão Oficial do Criatório" 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
          ) : (
            <div className="w-[84px] h-[84px] rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 border-2 border-slate-900 shadow-md flex flex-col items-center justify-center text-slate-950 font-black shrink-0">
              <span className="text-xl">🏆</span>
              <span className="text-[10px] tracking-wider uppercase">CRIATÓRIO</span>
            </div>
          )}

          <div className="leading-tight text-left">
            <h3 className="font-extrabold text-[13px] text-slate-900 uppercase tracking-tight">
              {criadorNome}
            </h3>
            <p className="font-black text-[11px] text-slate-900 mt-0.5">
              {ctfIbama}
            </p>
            <p className="font-black text-[11px] text-slate-900 uppercase">
              {criatorioNome}
            </p>
            <p className="text-[10.5px] font-bold text-slate-700">
              {localidade}
            </p>
            <p className="text-[10px] font-semibold text-slate-600 lowercase mt-0.5">
              {contatoRede}
            </p>
          </div>
        </div>

        {/* Centro: Título Majestoso "Certificado" + Faixa Dourada "ÁRVORE GENEALÓGICA" */}
        <div className="flex flex-col items-center justify-center text-center -ml-8">
          <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-none mb-1">
            Certificado
          </h1>
          <div className="relative">
            {/* Faixa Dourada */}
            <div className="px-6 py-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xs border border-amber-600 shadow-xs flex items-center justify-center">
              <span>ÁRVORE GENEALÓGICA</span>
            </div>
          </div>
        </div>

        {/* Direita: QR Code de Validação para leitura com câmera do celular */}
        {showQrCode && (
          <div className="flex items-center gap-2.5 bg-white/90 p-1.5 rounded-lg border border-slate-300 shadow-xs">
            <div className="text-right leading-none">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-800 block">
                Validação:
              </span>
              <span className="text-[7.5px] font-bold text-emerald-700 block mt-0.5">
                OFICIAL
              </span>
            </div>
            <div className="p-1 bg-white rounded border border-slate-400 shrink-0">
              <QRCodeSVG value={publicUrl} size={66} level="M" />
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* CORPO DA ÁRVORE GENEALÓGICA (5 GERAÇÕES COMPLETAS)        */}
      {/* ======================================================== */}
      <div className="relative z-10 flex-1 flex items-center justify-between gap-0 px-2 py-2">
        
        {/* 1. INDIVÍDUO PRINCIPAL (FILHOTE / AVE) */}
        <div className="w-[170px] shrink-0 flex flex-col justify-center items-center">
          
          {/* Caixa do Nome da Ave Principal (Amarelo Canário Ouro) */}
          <div 
            className="w-full py-1.5 px-2 text-center rounded-sm border border-black shadow-xs"
            style={{ backgroundColor: maleBg, color: maleTextColor }}
          >
            <h2 className="font-black text-[12px] uppercase tracking-wide truncate">
              {bird.name}
            </h2>
          </div>

          {/* Dados Ficha da Ave Abaixo da Caixa (Igual ao Print de Referência) */}
          <div className="w-full mt-2 space-y-0.5 text-left text-[9px] font-bold text-slate-900 leading-snug pl-1">
            <p>
              <span className="font-normal text-slate-700">Espécie: </span>
              <strong>{speciesCommon}</strong>
            </p>
            {speciesScientific && (
              <p className="italic text-slate-600 text-[8.5px]">
                {speciesScientific}
              </p>
            )}
            <p>
              <span className="font-normal text-slate-700">Anilha: </span>
              <strong>{bird.ringNumber || 'SEM REGISTRO'}</strong>
            </p>
            <p>
              <span className="font-normal text-slate-700">Anilha de Marcação: </span>
              <strong>{bird.ringNumber ? bird.ringNumber.split(' ').pop() : '—'}</strong>
            </p>
            <p>
              <span className="font-normal text-slate-700">Nasc: </span>
              <strong>{bird.birthDate ? formatDate(bird.birthDate) : '20/12/2025'}</strong>
            </p>
            <p>
              <span className="font-normal text-slate-700">Sexo: </span>
              <strong>{bird.sex === 'MALE' ? 'Macho' : bird.sex === 'FEMALE' ? 'Fêmea' : 'Indefinido'}</strong>
            </p>
          </div>

        </div>

        {/* CONECTOR 1 -> 2 (Indivíduo Principal para Pais) */}
        <div className="w-[20px] h-[480px] relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 20 480" fill="none" preserveAspectRatio="none" shapeRendering="geometricPrecision">
            <path
              d="M 0,240 H 10 V 120 H 20 M 10,240 V 360 H 20"
              stroke="#000000"
              strokeWidth="1.8"
              strokeLinecap="square"
            />
          </svg>
        </div>

        {/* 2. GERAÇÃO 1: PAIS (Pai ♂ e Mãe ♀) */}
        <div className="w-[160px] shrink-0 h-[480px] flex flex-col justify-around py-8">
          {/* Pai (Amarelo) */}
          <div 
            className="w-full py-2 px-2 text-center rounded-sm border border-black shadow-xs flex items-center justify-center"
            style={{ backgroundColor: maleBg, color: maleTextColor }}
          >
            <span className="font-black text-[11px] uppercase truncate">
              {formatNodeName(pedigree.father, true)}
            </span>
          </div>

          {/* Mãe (Preto com texto Amarelo Ouro) */}
          <div 
            className="w-full py-2 px-2 text-center rounded-sm border border-black shadow-xs flex items-center justify-center"
            style={{ backgroundColor: femaleBg, color: femaleTextColor }}
          >
            <span className="font-black text-[11px] uppercase truncate">
              {formatNodeName(pedigree.mother, false)}
            </span>
          </div>
        </div>

        {/* CONECTOR 2 -> 3 (Pais para Avós) */}
        <div className="w-[18px] h-[520px] relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 18 520" fill="none" preserveAspectRatio="none" shapeRendering="geometricPrecision">
            {/* Pai -> Avô & Avó Paternos */}
            <path d="M 0,130 H 9 V 65 H 18 M 9,130 V 195 H 18" stroke="#000000" strokeWidth="1.6" strokeLinecap="square" />
            {/* Mãe -> Avô & Avó Maternos */}
            <path d="M 0,390 H 9 V 325 H 18 M 9,390 V 455 H 18" stroke="#000000" strokeWidth="1.6" strokeLinecap="square" />
          </svg>
        </div>

        {/* 3. GERAÇÃO 2: AVÓS (4 Caixas) */}
        <div className="w-[160px] shrink-0 h-[520px] flex flex-col justify-around py-4">
          {pedigree.grandparents.map((av, idx) => {
            const isMale = av.sex === 'MALE'
            return (
              <div
                key={idx}
                className="w-full py-1.5 px-1.5 text-center rounded-sm border border-black shadow-xs flex items-center justify-center"
                style={{
                  backgroundColor: isMale ? maleBg : femaleBg,
                  color: isMale ? maleTextColor : femaleTextColor
                }}
              >
                <span className="font-black text-[10px] uppercase truncate">
                  {formatNodeName(av, isMale)}
                </span>
              </div>
            )
          })}
        </div>

        {/* CONECTOR 3 -> 4 (Avós para Bisavós) */}
        <div className="w-[16px] h-[560px] relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 16 560" fill="none" preserveAspectRatio="none" shapeRendering="geometricPrecision">
            <path d="M 0,70 H 8 V 35 H 16 M 8,70 V 105 H 16" stroke="#000000" strokeWidth="1.4" strokeLinecap="square" />
            <path d="M 0,210 H 8 V 175 H 16 M 8,210 V 245 H 16" stroke="#000000" strokeWidth="1.4" strokeLinecap="square" />
            <path d="M 0,350 H 8 V 315 H 16 M 8,350 V 385 H 16" stroke="#000000" strokeWidth="1.4" strokeLinecap="square" />
            <path d="M 0,490 H 8 V 455 H 16 M 8,490 V 525 H 16" stroke="#000000" strokeWidth="1.4" strokeLinecap="square" />
          </svg>
        </div>

        {/* 4. GERAÇÃO 3: BISAVÓS (8 Caixas) */}
        <div className="w-[155px] shrink-0 h-[560px] flex flex-col justify-around py-1">
          {pedigree.greatGrandparents.map((bis, idx) => {
            const isMale = bis.sex === 'MALE'
            return (
              <div
                key={idx}
                className="w-full py-1 px-1 text-center rounded-sm border border-black shadow-2xs flex items-center justify-center"
                style={{
                  backgroundColor: isMale ? maleBg : femaleBg,
                  color: isMale ? maleTextColor : femaleTextColor
                }}
              >
                <span className="font-black text-[9px] uppercase truncate">
                  {formatNodeName(bis, isMale)}
                </span>
              </div>
            )
          })}
        </div>

        {/* CONECTOR 4 -> 5 (Bisavós para Trisavós - 16 conexões) */}
        <div className="w-[12px] h-[580px] relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 12 580" fill="none" preserveAspectRatio="none" shapeRendering="geometricPrecision">
            {Array.from({ length: 8 }).map((_, i) => {
              const yMid = 36 + i * 72.5
              const yTop = yMid - 18
              const yBtm = yMid + 18
              return (
                <path
                  key={i}
                  d={`M 0,${yMid} H 6 V ${yTop} H 12 M 6,${yMid} V ${yBtm} H 12`}
                  stroke="#000000"
                  strokeWidth="1.2"
                  strokeLinecap="square"
                />
              )
            })}
          </svg>
        </div>

        {/* 5. GERAÇÃO 4: TRISAVÓS (16 Caixas) */}
        <div className="w-[145px] shrink-0 h-[580px] flex flex-col justify-between py-1">
          {pedigree.greatGreatGrandparents.map((tri, idx) => {
            const isMale = tri.sex === 'MALE'
            return (
              <div
                key={idx}
                className="w-full h-[23px] px-1 text-center rounded-xs border border-black/80 shadow-2xs flex items-center justify-center leading-none"
                style={{
                  backgroundColor: isMale ? maleBg : femaleBg,
                  color: isMale ? maleTextColor : femaleTextColor
                }}
              >
                <span className="font-black text-[7.5px] uppercase truncate">
                  {formatNodeName(tri, isMale)}
                </span>
              </div>
            )
          })}
        </div>

      </div>

      {/* ======================================================== */}
      {/* RODAPÉ DO CERTIFICADO: SISTEMA BIRDPRO + ASSINATURA DIGITAL */}
      {/* ======================================================== */}
      <div className="relative z-10 flex items-center justify-between border-t-2 border-slate-300 pt-2 pl-6 pr-6">
        
        {/* Marca do Sistema BIRDPRO */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-rose-700 flex items-center justify-center text-white text-[9px] font-black shadow-xs">
            BP
          </div>
          <span className="text-[11px] font-black text-slate-800 tracking-wide">
            Sistema: <strong className="text-black">BIRDPRO</strong> • <span className="text-slate-600 font-normal">www.birdpro.com.br</span>
          </span>
        </div>

        {/* Data de Emissão e Validação */}
        <div className="text-right text-[10px] text-slate-600 font-semibold">
          <span>Certificado Emitido em: <strong>{new Date().toLocaleDateString('pt-BR')}</strong> • Registro Oficial SISPASS</span>
        </div>

      </div>

    </div>
  )
}
