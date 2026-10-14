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

  // Logos & Imagens do Criatório
  const logoUrl = vc.treeLogoUrl || vc.labelLogoUrl || vc.logoGenealogyUrl || tenant?.logoUrl || ''
  const bgWatermarkUrl = vc.treeBackgroundUrl || vc.bgGenealogyUrl || vc.labelFrontBackgroundUrl || logoUrl || ''

  // Paleta de Cores Padrão Oficial (Amarelo Canário Ouro & Preto Profundo conforme modelo de referência)
  const maleBg = vc.maleColor || vc.colorPaletteMale || '#ffd600'
  const femaleBg = vc.femaleColor || vc.colorPaletteFemale || '#000000'
  const maleTextColor = vc.maleTextColor || vc.colorTextPaletteMale || '#000000'
  const femaleTextColor = vc.femaleTextColor || vc.colorTextPaletteFemale || '#ffd600'

  // URL Ultra-curta e limpa para leitura instantânea por qualquer câmera de smartphone
  const baseUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://www.birdpro.com.br'

  const publicUrl = customPublicUrl || `${baseUrl}/ave/${encodeURIComponent(bird.id || bird.ringNumber || '01')}`

  // Resolução da árvore genealógica de 5 gerações completas (até 32 tataravós)
  const pedigree = resolvePedigreeTree(bird)

  // Dados da Ave Principal
  const rawSpecies = bird.species || 'Canário-da-Terra (Sicalis flaveola)'
  const speciesParts = rawSpecies.split('(')
  const speciesCommon = speciesParts[0].trim()
  const speciesScientific = speciesParts[1] ? `(${speciesParts[1].replace(')', '').trim()})` : '(Sicalis flaveola)'

  const anilha = bird.ringNumber || 'SISPASS 2.8 RJ/A 032734'
  const anilhaMarcacao = bird.ringNumber ? bird.ringNumber.trim().split(' ').pop() || '011' : '011'
  const dataNasc = bird.birthDate ? formatDate(bird.birthDate) : '20/12/2025'
  const sexo = bird.sex === 'MALE' ? 'Macho' : bird.sex === 'FEMALE' ? 'Fêmea' : 'Macho'

  // Dados do Criador e Criatório conforme modelo
  const criadorNome = tenant?.ownerName || tenant?.name || 'Renan De Figueiredo Arouca Monteiro'
  const ctfIbama = tenant?.registryNumber ? `CTF: ${tenant.registryNumber}` : 'CTF: 3780283'
  const criatorioNome = tenant?.name ? `CRIATÓRIO ${tenant.name.toUpperCase()}` : 'CRIATÓRIO AROUCA'
  const localidade = tenant?.city && tenant?.state 
    ? `${tenant.city}/${tenant.state}` 
    : tenant?.city || tenant?.state || 'Rio de Janeiro/RJ'

  let contatoRede = ''
  if (tenant?.instagram) {
    const cleanIg = tenant.instagram.replace('@', '').trim()
    contatoRede = cleanIg.startsWith('http') ? cleanIg : `www.instagram.com/${cleanIg}`
  } else if (tenant?.website) {
    contatoRede = tenant.website
  } else {
    contatoRede = 'www.instagram.com/criatorioarouca'
  }

  const formatNodeName = (node?: PedigreeNode | null, isMale = true): string => {
    if (!node || !node.name || !node.name.trim() || node.name.toUpperCase() === 'INDEFINIDO' || node.name.toUpperCase() === 'INDEFINIDA') {
      return 'INDEFINIDO'
    }
    return node.name.trim().toUpperCase()
  }

  // Listas de nós por geração
  // Geração 1: Pais (2)
  const pais = [
    { node: pedigree.father, isMale: true },
    { node: pedigree.mother, isMale: false }
  ]

  // Geração 2: Avós (4)
  const avos = pedigree.grandparents.map((av, idx) => ({
    node: av,
    isMale: idx % 2 === 0
  }))

  // Geração 3: Bisavós (8)
  const bisavos = pedigree.greatGrandparents.map((bis, idx) => ({
    node: bis,
    isMale: idx % 2 === 0
  }))

  // Geração 4: Trisavós (16)
  const trisavos = pedigree.greatGreatGrandparents.map((tri, idx) => ({
    node: tri,
    isMale: idx % 2 === 0
  }))

  // Geração 5: Tataravós (32)
  const tataravos = (pedigree.tataravos && pedigree.tataravos.length === 32)
    ? pedigree.tataravos.map((tat, idx) => ({
        node: tat,
        isMale: idx % 2 === 0
      }))
    : Array.from({ length: 32 }).map((_, idx) => ({
        node: null,
        isMale: idx % 2 === 0
      }))

  return (
    <div
      id="pedigree-certificate-wrapper"
      className="w-full flex justify-center py-2 overflow-x-auto print:overflow-visible print:p-0 print:m-0"
    >
      {/* Moldura Externa Completa do Certificado */}
      <div
        id="pedigree-certificate"
        className="w-[1180px] min-w-[1180px] h-[780px] max-h-[780px] relative bg-[#e2e8f0] text-black border-2 border-black shadow-2xl overflow-hidden font-sans select-none flex flex-col justify-between p-3.5 print:m-0 print:border-0 print:shadow-none print:w-full print:h-full print:max-h-none print:p-2"
        style={{ boxSizing: 'border-box' }}
      >
        {/* ======================================================== */}
        {/* DETALHES DECORATIVOS: LISTRAS DIAGONAIS AMARELO/PRETO    */}
        {/* ======================================================== */}
        {/* Canto Superior Esquerdo */}
        <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <defs>
              <pattern id="corner-stripes-tl" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <rect width="8" height="16" fill="#1e293b" />
                <rect x="8" width="8" height="16" fill="#ffd600" />
              </pattern>
            </defs>
            <polygon points="0,0 120,0 0,120" fill="url(#corner-stripes-tl)" />
            <line x1="120" y1="0" x2="0" y2="120" stroke="#000000" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Canto Inferior Direito */}
        <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <defs>
              <pattern id="corner-stripes-br" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <rect width="8" height="16" fill="#1e293b" />
                <rect x="8" width="8" height="16" fill="#ffd600" />
              </pattern>
            </defs>
            <polygon points="120,120 0,120 120,0" fill="url(#corner-stripes-br)" />
            <line x1="0" y1="120" x2="120" y2="0" stroke="#000000" strokeWidth="2.5" />
          </svg>
        </div>

        {/* ======================================================== */}
        {/* CARTÃO INTERNO BRANCO COM BORDA DOURADA / AMARELA        */}
        {/* ======================================================== */}
        <div className="relative z-10 w-full h-full bg-white rounded-2xl border-[3px] border-[#ffd600] shadow-sm flex flex-col justify-between p-3.5 overflow-hidden">
          
          {/* ======================================================== */}
          {/* MARCA D'ÁGUA EXPANSIVA & ELEGANTE DO CRIATÓRIO (SEM QUADRADO) */}
          {/* ======================================================== */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
            {/* Halo / Aura sutil e nobre ao fundo */}
            <div 
              className="absolute w-[860px] h-[580px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 214, 0, 0.08) 0%, rgba(255, 214, 0, 0.02) 50%, transparent 75%)'
              }}
            />

            {bgWatermarkUrl ? (
              <div 
                className="relative w-[780px] h-[520px] flex items-center justify-center pointer-events-none"
                style={{ 
                  opacity: 0.17,
                  mixBlendMode: 'multiply',
                  maskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, black 25%, rgba(0,0,0,0.7) 50%, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, black 25%, rgba(0,0,0,0.7) 50%, transparent 75%)'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bgWatermarkUrl}
                  alt="Marca d'água"
                  className="w-full h-full object-contain filter drop-shadow-sm scale-105"
                />
              </div>
            ) : (
              <div 
                className="text-center font-black tracking-widest text-slate-900 uppercase text-7xl"
                style={{ opacity: 0.08 }}
              >
                {criatorioNome}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* TOPO: LOGO + DADOS CRIATÓRIO + TÍTULO/FAIXA + QR CODE    */}
          {/* ======================================================== */}
          <div className="relative z-10 flex items-start justify-between pb-1 px-1">
            
            {/* Esquerda: Brasão + Informações do Criador */}
            <div className="flex items-center gap-3">
              {/* Brasão Oficial do Criatório */}
              <div className="w-[100px] h-[95px] shrink-0 flex items-center justify-center">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Brasão"
                    className="max-w-full max-h-full object-contain filter drop-shadow-xs"
                  />
                ) : (
                  <div className="w-[88px] h-[88px] rounded-full border-2 border-black bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 flex flex-col items-center justify-center text-black font-black text-center p-1 shadow-md">
                    <span className="text-lg leading-none">🏆</span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">CRIATÓRIO</span>
                    <span className="text-[10px] font-black">{tenant?.name?.slice(0, 8) || 'AROUCA'}</span>
                  </div>
                )}
              </div>

              {/* Informações de Cadastro */}
              <div className="leading-snug text-left text-black">
                <h3 className="font-bold text-[13px] tracking-tight">
                  {criadorNome}
                </h3>
                <p className="font-bold text-[12px]">
                  {ctfIbama}
                </p>
                <p className="font-extrabold text-[12px] uppercase">
                  {criatorioNome}
                </p>
                <p className="font-bold text-[11.5px]">
                  {localidade}
                </p>
                <p className="font-semibold text-[11px] lowercase text-slate-900 mt-0.5">
                  {contatoRede}
                </p>
              </div>
            </div>

            {/* Centro: "Certificado" + Faixa Dourada "ÁRVORE GENEALÓGICA" */}
            <div className="flex flex-col items-center justify-center text-center pt-0.5">
              <h1 className="text-[34px] font-bold text-black tracking-normal leading-none mb-1">
                Certificado
              </h1>
              
              {/* Faixa Dourada com Pontas Notched (Swallowtail Ribbon) */}
              <div className="relative flex items-center justify-center">
                {/* Ponta Esquerda da Faixa */}
                <svg width="22" height="28" viewBox="0 0 22 28" className="-mr-1 z-0 shrink-0">
                  <path d="M 22,0 L 0,6 L 8,14 L 0,22 L 22,28 Z" fill="#9e810a" />
                </svg>
                
                {/* Corpo Central da Faixa */}
                <div className="relative z-10 px-6 py-1 bg-gradient-to-b from-[#ffe600] to-[#ffd000] border-y border-white shadow-xs flex items-center justify-center">
                  <span className="text-white font-black text-[12.5px] tracking-wider uppercase drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.9)]">
                    ÁRVORE GENEALÓGICA
                  </span>
                </div>

                {/* Ponta Direita da Faixa */}
                <svg width="22" height="28" viewBox="0 0 22 28" className="-ml-1 z-0 shrink-0">
                  <path d="M 0,0 L 22,6 L 14,14 L 22,22 L 0,28 Z" fill="#9e810a" />
                </svg>
              </div>
            </div>

            {/* Direita: "Validação:" Vertical + QR Code de Alta Resolução */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col justify-center items-center">
                <span 
                  className="font-bold text-[11.5px] text-black tracking-wide"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  Validação:
                </span>
              </div>
              <div className="w-[78px] h-[78px] p-1 bg-white rounded-sm border border-black flex items-center justify-center shadow-xs shrink-0">
                <QRCodeSVG
                  value={publicUrl}
                  size={70}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* CORPO CENTRAL: ÁRVORE GENEALÓGICA DE 5 GERAÇÕES          */}
          {/* ======================================================== */}
          <div className="relative z-10 w-full h-[544px] flex items-center justify-between px-1">
            
            {/* ---------------------------------------------------- */}
            {/* COLUNA 0: AVE PRINCIPAL (FILHOTE) + FICHA TÉCNICA    */}
            {/* ---------------------------------------------------- */}
            <div className="w-[160px] h-[544px] relative shrink-0">
              {/* Caixa da Ave Principal (Centralizada em y = 271) */}
              <div 
                className="absolute left-0 w-[160px] h-[30px] rounded-[4px] border-2 border-black flex items-center justify-center px-1 shadow-xs"
                style={{ 
                  top: '256px',
                  backgroundColor: maleBg, 
                  color: maleTextColor 
                }}
              >
                <span className="font-black text-[12px] uppercase truncate tracking-wide">
                  {bird.name || 'FILHOTE 011'}
                </span>
              </div>

              {/* Ficha Técnica Direto Abaixo da Caixa */}
              <div 
                className="absolute left-0 w-[160px] text-left text-[9.5px] font-bold text-black leading-tight space-y-0.5 pt-1 pl-0.5"
                style={{ top: '290px' }}
              >
                <p>
                  <span className="font-bold">Espécie: </span>
                  <span>{speciesCommon}</span>
                </p>
                {speciesScientific && (
                  <p className="text-[8.5px] font-semibold text-slate-900 leading-none">
                    {speciesScientific}
                  </p>
                )}
                <p className="pt-0.5">
                  <span className="font-bold">Anilha: </span>
                  <span className="font-bold">{anilha}</span>
                </p>
                <p>
                  <span className="font-bold">Anilha de Marcação: </span>
                  <span className="font-bold">{anilhaMarcacao}</span>
                </p>
                <p>
                  <span className="font-bold">Nasc: </span>
                  <span className="font-bold">{dataNasc}</span>
                </p>
                <p>
                  <span className="font-bold">Sexo: </span>
                  <span className="font-bold">{sexo}</span>
                </p>
              </div>
            </div>

            {/* CONECTOR 0 -> 1 (Ave Principal para Pais) */}
            <div className="w-[18px] h-[544px] relative shrink-0">
              <svg className="w-full h-full" viewBox="0 0 18 544" fill="none" preserveAspectRatio="none">
                <path
                  d="M 0,271 H 9 V 135 H 18 M 9,271 V 407 H 18"
                  stroke="#000000"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                />
              </svg>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUNA 1: PAIS (2 Caixas)                             */}
            {/* ---------------------------------------------------- */}
            <div className="w-[155px] h-[544px] relative shrink-0">
              {pais.map((p, idx) => {
                const isMale = p.isMale
                const topPos = idx === 0 ? 120 : 392
                return (
                  <div
                    key={idx}
                    className="absolute left-0 w-[155px] h-[30px] rounded-[4px] border-2 border-black flex items-center justify-center px-1 shadow-xs"
                    style={{
                      top: `${topPos}px`,
                      backgroundColor: isMale ? maleBg : femaleBg,
                      color: isMale ? maleTextColor : femaleTextColor
                    }}
                  >
                    <span className="font-black text-[11px] uppercase truncate">
                      {formatNodeName(p.node, isMale)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* CONECTOR 1 -> 2 (Pais para Avós) */}
            <div className="w-[18px] h-[544px] relative shrink-0">
              <svg className="w-full h-full" viewBox="0 0 18 544" fill="none" preserveAspectRatio="none">
                {/* Pai -> Avô & Avó Paternos */}
                <path d="M 0,135 H 9 V 67 H 18 M 9,135 V 203 H 18" stroke="#000000" strokeWidth="1.8" strokeLinecap="square" />
                {/* Mãe -> Avô & Avó Maternos */}
                <path d="M 0,407 H 9 V 339 H 18 M 9,407 V 475 H 18" stroke="#000000" strokeWidth="1.8" strokeLinecap="square" />
              </svg>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUNA 2: AVÓS (4 Caixas)                             */}
            {/* ---------------------------------------------------- */}
            <div className="w-[155px] h-[544px] relative shrink-0">
              {avos.map((av, idx) => {
                const isMale = av.isMale
                const yCenter = 136 * idx + 67
                const topPos = yCenter - 14
                return (
                  <div
                    key={idx}
                    className="absolute left-0 w-[155px] h-[28px] rounded-[4px] border-2 border-black flex items-center justify-center px-1 shadow-xs"
                    style={{
                      top: `${topPos}px`,
                      backgroundColor: isMale ? maleBg : femaleBg,
                      color: isMale ? maleTextColor : femaleTextColor
                    }}
                  >
                    <span className="font-black text-[10px] uppercase truncate">
                      {formatNodeName(av.node, isMale)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* CONECTOR 2 -> 3 (Avós para Bisavós) */}
            <div className="w-[18px] h-[544px] relative shrink-0">
              <svg className="w-full h-full" viewBox="0 0 18 544" fill="none" preserveAspectRatio="none">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const yMid = 136 * idx + 67
                  const yTop = 136 * idx + 33
                  const yBtm = 136 * idx + 101
                  return (
                    <path
                      key={idx}
                      d={`M 0,${yMid} H 9 V ${yTop} H 18 M 9,${yMid} V ${yBtm} H 18`}
                      stroke="#000000"
                      strokeWidth="1.6"
                      strokeLinecap="square"
                    />
                  )
                })}
              </svg>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUNA 3: BISAVÓS (8 Caixas)                          */}
            {/* ---------------------------------------------------- */}
            <div className="w-[155px] h-[544px] relative shrink-0">
              {bisavos.map((bis, idx) => {
                const isMale = bis.isMale
                const yCenter = 68 * idx + 33
                const topPos = yCenter - 13
                return (
                  <div
                    key={idx}
                    className="absolute left-0 w-[155px] h-[26px] rounded-[4px] border-2 border-black flex items-center justify-center px-1 shadow-xs"
                    style={{
                      top: `${topPos}px`,
                      backgroundColor: isMale ? maleBg : femaleBg,
                      color: isMale ? maleTextColor : femaleTextColor
                    }}
                  >
                    <span className="font-black text-[9.5px] uppercase truncate">
                      {formatNodeName(bis.node, isMale)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* CONECTOR 3 -> 4 (Bisavós para Trisavós) */}
            <div className="w-[16px] h-[544px] relative shrink-0">
              <svg className="w-full h-full" viewBox="0 0 16 544" fill="none" preserveAspectRatio="none">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const yMid = 68 * idx + 33
                  const yTop = 68 * idx + 16
                  const yBtm = 68 * idx + 50
                  return (
                    <path
                      key={idx}
                      d={`M 0,${yMid} H 8 V ${yTop} H 16 M 8,${yMid} V ${yBtm} H 16`}
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                    />
                  )
                })}
              </svg>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUNA 4: TRISAVÓS (16 Caixas)                        */}
            {/* ---------------------------------------------------- */}
            <div className="w-[155px] h-[544px] relative shrink-0">
              {trisavos.map((tri, idx) => {
                const isMale = tri.isMale
                const yCenter = 34 * idx + 16
                const topPos = yCenter - 11
                return (
                  <div
                    key={idx}
                    className="absolute left-0 w-[155px] h-[22px] rounded-[3px] border-[1.5px] border-black flex items-center justify-center px-1 shadow-2xs"
                    style={{
                      top: `${topPos}px`,
                      backgroundColor: isMale ? maleBg : femaleBg,
                      color: isMale ? maleTextColor : femaleTextColor
                    }}
                  >
                    <span className="font-black text-[8.5px] uppercase truncate">
                      {formatNodeName(tri.node, isMale)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* CONECTOR 4 -> 5 (Trisavós para Tataravós) */}
            <div className="w-[14px] h-[544px] relative shrink-0">
              <svg className="w-full h-full" viewBox="0 0 14 544" fill="none" preserveAspectRatio="none">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const yMid = 34 * idx + 16
                  const yTop = 34 * idx + 7.5
                  const yBtm = 34 * idx + 24.5
                  return (
                    <path
                      key={idx}
                      d={`M 0,${yMid} H 7 V ${yTop} H 14 M 7,${yMid} V ${yBtm} H 14`}
                      stroke="#000000"
                      strokeWidth="1.4"
                      strokeLinecap="square"
                    />
                  )
                })}
              </svg>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUNA 5: TATARAVÓS (32 Caixas Verticais Compactas)   */}
            {/* ---------------------------------------------------- */}
            <div className="w-[150px] h-[544px] relative shrink-0">
              {tataravos.map((tat, idx) => {
                const isMale = tat.isMale
                const topPos = idx * 17
                return (
                  <div
                    key={idx}
                    className="absolute left-0 w-[150px] h-[15px] rounded-[2px] border border-black flex items-center justify-center px-1 leading-none shadow-2xs"
                    style={{
                      top: `${topPos}px`,
                      backgroundColor: isMale ? maleBg : femaleBg,
                      color: isMale ? maleTextColor : femaleTextColor
                    }}
                  >
                    <span className="font-black text-[7px] uppercase truncate tracking-tight">
                      {formatNodeName(tat.node, isMale)}
                    </span>
                  </div>
                )
              })}
            </div>

          </div>

          {/* ======================================================== */}
          {/* RODAPÉ: LOGO DA AVE + SISTEMA BIRDPRO                    */}
          {/* ======================================================== */}
          <div className="relative z-10 flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2">
              {/* Ícone Estilizado da Fênix/Pássaro em Vermelho */}
              <svg className="w-5 h-5 text-[#e11d48] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.5 5 7 8 7 11c0 2.5 1.5 4.5 3.5 5.5-.5-1.5-.5-3 0-4.5 1 2 2.5 3 4.5 3 2 0 3.5-1.5 3.5-3.5 0-3-2.5-6-6.5-9.5z" />
                <path d="M6 13c-1.5 1-2.5 2.5-2.5 4.5 0 3 2.5 5.5 5.5 5.5 1.5 0 3-.5 4-1.5-2-.5-3.5-2-3.5-4 0-1.5.5-3 1.5-4-1.5-.5-3.5-.5-5-.5z" opacity="0.8" />
                <path d="M18 13c1.5 1 2.5 2.5 2.5 4.5 0 3-2.5 5.5-5.5 5.5-1.5 0-3-.5-4-1.5 2-.5 3.5-2 3.5-4 0-1.5-.5-3-1.5-4 1.5-.5 3.5-.5 5-.5z" opacity="0.8" />
              </svg>
              <span className="text-[11.5px] font-black text-black">
                Sistema: <span className="font-extrabold">www.birdpro.com.br</span>
              </span>
            </div>

            {/* Certificação Digital Oficial */}
            <div className="text-right text-[9.5px] font-bold text-slate-700">
              <span>Certificado Genealógico Oficial de Plantel • SISPASS / IBAMA</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
