'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, Download, ArrowLeft, ShieldCheck, CheckCircle2, QrCode, Sparkles, Moon, Sun } from 'lucide-react'
import { db } from '@/lib/db'
import { Bird, Tenant } from '@/types'
import { formatDate } from '@/lib/utils'
import { resolvePedigreeTree } from '@/lib/pedigree'

function PublicCertificateContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const routeId = params?.id as string
  const queryCode = searchParams?.get('code') || ''
  const autoPrint = searchParams?.get('print') === '1'
  const requestedStyle = (searchParams?.get('style') as any) || 'DARK_PRESTIGE'
  const requestedGen = Number(searchParams?.get('gen')) || 4
  
  const [bird, setBird] = useState<Bird | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [themeStyle, setThemeStyle] = useState<'DARK_PRESTIGE' | 'CLASSIC_LIGHT' | 'BADGE_PRO'>(requestedStyle)
  const [generationsCount, setGenerationsCount] = useState<3 | 4 | 5>(requestedGen as any)

  useEffect(() => {
    let targetBird: Bird | null = null
    const allBirds = db.getBirds()

    if (routeId) {
      targetBird = db.getBirdById(routeId) || null
    }

    if (!targetBird && queryCode) {
      targetBird = allBirds.find(b => b.id === queryCode || b.ringNumber === queryCode) || null
    }

    if (!targetBird && allBirds.length > 0) {
      targetBird = allBirds[0]
    }

    if (targetBird) {
      setBird(targetBird)
      const t = db.getTenant(targetBird.tenantId)
      setTenant(t)
    }
  }, [routeId, queryCode])

  useEffect(() => {
    if (autoPrint && bird) {
      setTimeout(() => {
        window.print()
      }, 600)
    }
  }, [autoPrint, bird])

  if (!bird || !tenant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-center max-w-md space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold">Autenticando Certificado Digital...</h2>
          <p className="text-xs text-slate-400">Verificando registro oficial SISPASS / IBAMA na plataforma BIRDPRO.</p>
        </div>
      </div>
    )
  }

  const pedigree = resolvePedigreeTree(bird)
  const publicUrl = typeof window !== 'undefined' ? window.location.href : `https://www.birdpro.com.br/ave/${bird.id}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center print:bg-white print:p-0">
      
      {/* Top Floating Controls Bar */}
      <div className="w-full bg-[#1b222a] border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#00c853] flex items-center justify-center text-white font-black text-xs shadow">
            BP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white tracking-wide">BIRDPRO</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓ Certificado Autenticado
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {bird.name} ({bird.ringNumber}) • {tenant.name}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Theme Selector */}
          <div className="inline-flex rounded-md bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setThemeStyle('DARK_PRESTIGE')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${themeStyle === 'DARK_PRESTIGE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🌙 Dark Prestige
            </button>
            <button
              onClick={() => setThemeStyle('CLASSIC_LIGHT')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${themeStyle === 'CLASSIC_LIGHT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🌟 Clássico A4
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-black rounded-lg flex items-center space-x-1.5 transition shadow cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Main Certificate Display */}
      <div className="p-4 sm:p-8 flex justify-center w-full overflow-x-auto print:p-0">
        <div
          id="pedigree-certificate"
          className={`w-[1140px] min-w-[1140px] h-[720px] relative shadow-2xl overflow-hidden font-sans select-none flex flex-col justify-between print:m-0 print:border-0 print:shadow-none ${
            themeStyle === 'DARK_PRESTIGE'
              ? 'bg-[#111827] text-white border border-slate-700'
              : 'bg-white text-slate-900 border border-slate-300'
          }`}
        >
          {/* Header */}
          <div className={`px-8 pt-5 pb-2 text-center border-b relative z-10 ${
            themeStyle === 'DARK_PRESTIGE' ? 'border-emerald-500/20 bg-slate-900/50' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-widest ${
              themeStyle === 'DARK_PRESTIGE' ? 'text-emerald-400 drop-shadow-sm' : 'text-slate-950'
            }`}>
              CERTIFICADO DE ORIGEM &amp; GENEALOGIA
            </h1>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${
              themeStyle === 'DARK_PRESTIGE' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {tenant.name} • REGISTRO IBAMA / SISPASS: {tenant.registryNumber || '4719754'}
            </p>
          </div>

          {/* Tree Body */}
          <div className="relative z-10 px-6 py-4 flex-1 flex items-center justify-between gap-4">
            {/* Main Bird Card */}
            <div className="w-[220px] shrink-0">
              <div className={`p-4 rounded-xl text-center space-y-2 relative shadow-lg ${
                themeStyle === 'DARK_PRESTIGE'
                  ? 'bg-[#1e293b] border-2 border-[#00c853] text-white'
                  : 'bg-slate-50 border-2 border-emerald-600 text-slate-900'
              }`}>
                <span className="inline-block px-3 py-1 bg-[#00c853] text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider">
                  INDIVÍDUO PRINCIPAL
                </span>
                <h2 className="text-base font-black uppercase tracking-wide text-white drop-shadow-xs">
                  {bird.name}
                </h2>
                <div className="space-y-1 text-xs font-semibold">
                  <p className="font-mono text-emerald-400 font-bold text-xs bg-black/40 py-1 px-2 rounded">
                    Anilha: {bird.ringNumber}
                  </p>
                  <p className="text-[11px] text-slate-300">{bird.species}</p>
                  <p className="text-[11px] text-slate-400 font-bold">
                    Sexo: {bird.sex === 'MALE' ? '♂ Macho' : bird.sex === 'FEMALE' ? '♀ Fêmea' : 'Indefinido'}
                  </p>
                </div>
              </div>
            </div>

            {/* Parents */}
            <div className="w-[200px] shrink-0 h-[440px] flex flex-col justify-around">
              <div className={`p-3 rounded-xl border-2 shadow-md space-y-1 text-center ${
                themeStyle === 'DARK_PRESTIGE' ? 'bg-[#1e293b] border-sky-500/70 text-white' : 'bg-sky-50 border-sky-500 text-slate-900'
              }`}>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 inline-block">
                  PAI (1ª GERAÇÃO) ♂
                </span>
                <h3 className="font-black text-xs uppercase truncate text-sky-400">{pedigree.father.name}</h3>
                <p className="text-[10px] font-mono text-slate-400 font-bold">{pedigree.father.ringNumber}</p>
              </div>

              <div className={`p-3 rounded-xl border-2 shadow-md space-y-1 text-center ${
                themeStyle === 'DARK_PRESTIGE' ? 'bg-[#1e293b] border-rose-500/70 text-white' : 'bg-rose-50 border-rose-500 text-slate-900'
              }`}>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                  MÃE (1ª GERAÇÃO) ♀
                </span>
                <h3 className="font-black text-xs uppercase truncate text-rose-400">{pedigree.mother.name}</h3>
                <p className="text-[10px] font-mono text-slate-400 font-bold">{pedigree.mother.ringNumber}</p>
              </div>
            </div>

            {/* Grandparents */}
            <div className="w-[190px] shrink-0 h-[460px] flex flex-col justify-around">
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
                  <span className="text-[8px] font-black uppercase text-slate-400 block">{av.role}</span>
                  <p className="font-bold text-[11px] truncate">{av.name}</p>
                  <p className="text-[9px] font-mono text-slate-400">{av.ringNumber}</p>
                </div>
              ))}
            </div>

            {/* Great Grandparents */}
            {generationsCount >= 4 && (
              <div className="w-[180px] shrink-0 h-[480px] flex flex-col justify-around">
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
                    <span className="text-[7.5px] font-bold text-slate-400 block truncate">{bis.role}</span>
                    <p className="font-bold text-[9.5px] truncate">{bis.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer QR Code */}
          <div className={`px-8 py-3 border-t flex items-center justify-between relative z-10 ${
            themeStyle === 'DARK_PRESTIGE' ? 'border-slate-700 bg-slate-900/90 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-300 shrink-0">
                <QRCodeSVG value={publicUrl} size={54} level="H" includeMargin={false} />
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="font-extrabold text-white block">Autenticação Digital BirdPro</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Acesse o laudo oficial escaneando o código QR</span>
                <span className="text-[9px] font-mono text-emerald-400 block">www.birdpro.com.br/ave/{bird.id}</span>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <p className="font-bold text-slate-300 text-[11px]">
                Certificado emitido em: <strong className="text-emerald-400">{new Date().toLocaleDateString('pt-BR')}</strong>
              </p>
              <p className="text-[9.5px] text-slate-400">Documento gerado eletronicamente pela plataforma <strong>BirdPro</strong></p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function PublicQrGenealogyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando Certificado...</div>}>
      <PublicCertificateContent />
    </Suspense>
  )
}
