'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, Download, ArrowLeft, ShieldCheck, CheckCircle2, QrCode, Sparkles, Moon, Sun } from 'lucide-react'
import { db } from '@/lib/db'
import { firebaseSync } from '@/lib/firebase-service'
import { Bird, Tenant } from '@/types'
import { formatDate } from '@/lib/utils'
import { resolvePedigreeTree } from '@/lib/pedigree'
import { BadgeFrontAndBack } from '@/components/genealogy/badge-front-and-back'

function PublicCertificateContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const routeId = params?.id as string
  const queryCode = searchParams?.get('code') || ''
  const autoPrint = searchParams?.get('print') === '1'
  const requestedStyle = (searchParams?.get('style') as any) || 'BADGE_PRO'
  const requestedGen = Number(searchParams?.get('gen')) || 4
  
  const [bird, setBird] = useState<Bird | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [themeStyle, setThemeStyle] = useState<'BADGE_PRO' | 'DARK_PRESTIGE' | 'CLASSIC_LIGHT'>(requestedStyle)
  const [generationsCount, setGenerationsCount] = useState<number>(requestedGen)
  const [isAuthenticating, setIsAuthenticating] = useState(true)

  useEffect(() => {
    let isCancelled = false

    const loadBirdData = async () => {
      let targetBird: Bird | null = null
      const decodedId = decodeURIComponent(routeId || '')

      // 1. Local Database by ID or Ring
      if (decodedId) {
        targetBird = db.getBirdById(decodedId) || null
        if (!targetBird) {
          const allBirds = db.getBirds()
          targetBird = allBirds.find(b => 
            b.id === decodedId || 
            (b.ringNumber && b.ringNumber.trim().toLowerCase() === decodedId.trim().toLowerCase())
          ) || null
        }
      }

      // 2. Query code
      if (!targetBird && queryCode) {
        const decodedQuery = decodeURIComponent(queryCode)
        const allBirds = db.getBirds()
        targetBird = allBirds.find(b => 
          b.id === decodedQuery || 
          (b.ringNumber && b.ringNumber.trim().toLowerCase() === decodedQuery.trim().toLowerCase())
        ) || null
      }

      // 3. LocalStorage for simulated or recently viewed bird
      if (!targetBird && typeof window !== 'undefined') {
        try {
          const storedSim = localStorage.getItem('birdpro_simulated_bird')
          if (storedSim) {
            const parsed = JSON.parse(storedSim)
            if (parsed && (parsed.id === decodedId || parsed.ringNumber === decodedId || decodedId.startsWith('sim-'))) {
              targetBird = parsed
            }
          }
        } catch {}
      }

      // 4. Cloud Firestore (permite leitura instantânea por qualquer celular ao escanear a etiqueta física)
      if (!targetBird && decodedId && firebaseSync.isAvailable()) {
        try {
          targetBird = await firebaseSync.fetchBirdAnywhere(decodedId)
        } catch (e) {
          console.warn('Erro ao consultar ave na nuvem:', e)
        }
      }

      // 5. Fallback para ave existente ou demonstração
      if (!targetBird) {
        const allBirds = db.getBirds()
        if (allBirds.length > 0) {
          targetBird = allBirds[0]
        } else {
          targetBird = {
            id: decodedId || `sim-${Date.now()}`,
            tenantId: 'tenant-demo-01',
            name: 'AVE REGISTRADA BIRDPRO',
            ringNumber: decodedId || 'SISPASS 2026',
            species: 'Canário-da-terra (Sicalis flaveola)',
            sex: 'MALE',
            birthDate: new Date().toISOString().split('T')[0],
            status: 'ACTIVE',
            origin: 'OTHER',
            entryDate: new Date().toISOString().split('T')[0],
            isPublic: true,
            fatherName: 'INDEFINIDO',
            fatherRing: '—',
            motherName: 'INDEFINIDA',
            motherRing: '—',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      }

      if (isCancelled) return

      setBird(targetBird)

      // Carrega criatório responsável
      let t: Tenant | null = null
      if (targetBird?.tenantId) {
        t = db.getTenant(targetBird.tenantId) || null
        if (!t && firebaseSync.isAvailable()) {
          try {
            t = await firebaseSync.fetchTenantById(targetBird.tenantId)
          } catch {}
        }
      }
      if (!t) {
        t = db.getTenant() || null
      }
      setTenant(t)
      setIsAuthenticating(false)
    }

    loadBirdData()

    return () => {
      isCancelled = true
    }
  }, [routeId, queryCode])

  useEffect(() => {
    if (bird) {
      const p = resolvePedigreeTree(bird)
      if (p.maxGenerations && !searchParams?.get('gen')) {
        setGenerationsCount(p.maxGenerations)
      }
    }
  }, [bird?.id, bird?.ancestry, searchParams])

  useEffect(() => {
    if (autoPrint && bird && !isAuthenticating) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [autoPrint, bird, isAuthenticating])

  if (isAuthenticating || !bird || !tenant) {
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
          {/* Generations Selector for Certificate */}
          {themeStyle !== 'BADGE_PRO' && (
            <select
              value={generationsCount}
              onChange={(e) => setGenerationsCount(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value={3}>3 Gerações (Até Avós)</option>
              <option value={4}>4 Gerações (Até Bisavós)</option>
              <option value={5}>5 Gerações (Até Trisavós)</option>
              <option value={6}>6 Gerações (Até Tataravós)</option>
            </select>
          )}

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
            <button
              onClick={() => setThemeStyle('BADGE_PRO')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${themeStyle === 'BADGE_PRO' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🏅 Estilo Crachá
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

      {/* Main Certificate / Badge Display */}
      <div className="p-4 sm:p-8 flex justify-center w-full overflow-x-auto print:p-0">
        {themeStyle === 'BADGE_PRO' ? (
          <div className="w-full max-w-5xl flex flex-col items-center space-y-8">
            
            {/* 1. CRACHÁ OFICIAL FRENTE E VERSO DA AVE */}
            <div className="w-full flex flex-col items-center space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 self-start print:hidden">
                <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
                <span>Crachá Oficial de Gaiola (Frente e Verso)</span>
              </div>
              <div className="w-full flex justify-center">
                <BadgeFrontAndBack bird={bird} tenant={tenant} mode="BOTH" />
              </div>
            </div>

            {/* 2. DOCUMENTO INDIVIDUAL OFICIAL DA AVE */}
            <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-200">
              
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00c853] to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    BP
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
                      Documento Individual Oficial da Ave
                    </h2>
                    <p className="text-xs text-slate-400">
                      Registro Genealógico &amp; Certificado de Autenticidade Digital
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Registro Oficial Ativo</span>
                  </span>
                </div>
              </div>

              {/* Grid 1: Identificação da Ave & Criatório */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Coluna A: Dados da Ave */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                      Identificação da Ave
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID: {bird.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nome da Ave</span>
                      <strong className="text-white text-sm uppercase block truncate">{bird.name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Anilha Oficial</span>
                      <strong className="text-emerald-400 font-mono text-xs block">{bird.ringNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Espécie</span>
                      <span className="text-slate-300 font-medium block">{bird.species}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Sexo</span>
                      <span className="text-slate-300 font-semibold block">
                        {bird.sex === 'MALE' ? '♂ Macho' : bird.sex === 'FEMALE' ? '♀ Fêmea' : 'Indefinido'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Data de Nascimento</span>
                      <span className="text-slate-300 block">{bird.birthDate ? formatDate(bird.birthDate) : 'Não informada'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Situação no Criatório</span>
                      <span className="text-emerald-400 font-bold block">Plantel Oficial</span>
                    </div>
                  </div>
                </div>

                {/* Coluna B: Dados do Criatório Responsável */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                      Criatório Proprietário
                    </span>
                    <span className="text-[10px] text-slate-400">Autorizado SISPASS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nome do Criatório</span>
                      <strong className="text-white text-sm block truncate">{tenant.name || 'Criatório Autorizado'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Registro CTF / IBAMA</span>
                      <strong className="text-sky-400 font-mono text-xs block">{tenant.registryNumber || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Criador Responsável</span>
                      <span className="text-slate-300 block truncate">{tenant.ownerName || tenant.name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Contato / Telefone</span>
                      <span className="text-slate-300 font-mono block">{tenant.phone || tenant.cellphone || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Localidade</span>
                      <span className="text-slate-300 block">
                        {tenant.city && tenant.state ? `${tenant.city} - ${tenant.state}` : 'Brasil'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Grid 2: Linhagem e Filiação Completa */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider block border-b border-slate-800 pb-2">
                  Linhagem &amp; Parentescos da Ave (Todas as Gerações Registradas)
                </span>

                {/* 1ª Geração: Pais */}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">1ª Geração • Pais</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Pai */}
                    <div className="bg-sky-950/40 border border-sky-800/40 rounded-lg p-3 space-y-1">
                      <span className="text-[9.5px] font-black uppercase text-sky-400 block">Pai ♂ (1ª Geração)</span>
                      <strong className="text-white block truncate">{pedigree.father.name}</strong>
                      <span className="text-[10px] font-mono text-slate-400 block">{pedigree.father.ringNumber || '—'}</span>
                    </div>

                    {/* Mãe */}
                    <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg p-3 space-y-1">
                      <span className="text-[9.5px] font-black uppercase text-rose-400 block">Mãe ♀ (1ª Geração)</span>
                      <strong className="text-white block truncate">{pedigree.mother.name}</strong>
                      <span className="text-[10px] font-mono text-slate-400 block">{pedigree.mother.ringNumber || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 2ª Geração: 4 Avós */}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">2ª Geração • Avós</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {pedigree.grandparents.map((av, idx) => (
                      <div key={idx} className={`p-2.5 rounded-lg border space-y-1 ${av.sex === 'MALE' ? 'bg-sky-950/30 border-sky-800/30' : 'bg-rose-950/30 border-rose-800/30'}`}>
                        <span className="text-[9px] font-black uppercase text-slate-400 block">{av.role}</span>
                        <strong className="text-slate-200 block truncate">{av.name}</strong>
                        <span className="text-[10px] font-mono text-slate-500 block">{av.ringNumber || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3ª Geração: 8 Bisavós */}
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">3ª Geração • Bisavós</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
                    {pedigree.greatGrandparents.map((bis, idx) => (
                      <div key={idx} className={`p-2 rounded border text-center space-y-0.5 ${bis.sex === 'MALE' ? 'bg-sky-950/20 border-sky-800/20' : 'bg-rose-950/20 border-rose-800/20'}`}>
                        <span className="text-[8px] font-bold text-slate-400 block truncate">{bis.role.split(' ')[0]} {bis.sex === 'MALE' ? '♂' : '♀'}</span>
                        <p className="font-bold text-[10px] text-slate-200 truncate">{bis.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4ª Geração: 16 Trisavós (se houver cadastrados) */}
                {pedigree.greatGreatGrandparents.some(t => t.isRegistered) && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">4ª Geração • Trisavós</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-xs">
                      {pedigree.greatGreatGrandparents.map((tri, idx) => (
                        <div key={idx} className={`p-1 rounded border text-center ${tri.sex === 'MALE' ? 'bg-sky-950/20 border-sky-800/20 text-sky-200' : 'bg-rose-950/20 border-rose-800/20 text-rose-200'}`}>
                          <p className="text-[8px] font-mono truncate">{tri.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Document Footer: Autenticação Digital BirdPro */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-white rounded border border-slate-400 shrink-0">
                    <QRCodeSVG value={publicUrl} size={48} level="M" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Selo de Autenticidade Digital BirdPro</span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      CHAVE: BP-{bird.id.toUpperCase()}-VERIFIED
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      www.birdpro.com.br/ave/{bird.id}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px]">
                  <p className="text-slate-300 font-semibold">Documento emitido eletronicamente pela plataforma BIRDPRO</p>
                  <p className="text-slate-500 text-[10px]">Válido em todo território nacional conforme registro do criatório</p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div
            id="pedigree-certificate"
            className={`${
              generationsCount >= 6 ? 'w-[1360px] min-w-[1360px]' : generationsCount >= 5 ? 'w-[1240px] min-w-[1240px]' : 'w-[1140px] min-w-[1140px]'
            } h-[740px] relative shadow-2xl overflow-hidden font-sans select-none flex flex-col justify-between print:m-0 print:border-0 print:shadow-none ${
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
                {tenant.name || 'Criatório'} • REGISTRO IBAMA / SISPASS: {tenant.registryNumber || '—'}
              </p>
            </div>

            {/* Tree Body with Bloodline Connector Lines */}
            <div className="relative z-10 px-6 py-4 flex-1 flex items-center justify-between gap-1">
              {/* 1. Main Bird Card */}
              <div className="w-[200px] shrink-0">
                <div className={`p-4 rounded-xl text-center space-y-2 relative shadow-lg ${
                  themeStyle === 'DARK_PRESTIGE'
                    ? 'bg-[#1e293b] border-2 border-[#00c853] text-white'
                    : 'bg-slate-50 border-2 border-emerald-600 text-slate-900'
                }`}>
                  <span className="inline-block px-3 py-1 bg-[#00c853] text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider">
                    INDIVÍDUO PRINCIPAL
                  </span>
                  <h2 className="text-base font-black uppercase tracking-wide drop-shadow-xs">
                    {bird.name}
                  </h2>
                  <div className="space-y-1 text-xs font-semibold">
                    <p className="font-mono text-emerald-400 font-bold text-xs bg-black/40 py-1 px-2 rounded">
                      Anilha: {bird.ringNumber}
                    </p>
                    <p className={`text-[11px] ${themeStyle === 'DARK_PRESTIGE' ? 'text-slate-300' : 'text-slate-700'}`}>{bird.species}</p>
                    <p className={`text-[11px] font-bold ${themeStyle === 'DARK_PRESTIGE' ? 'text-slate-400' : 'text-slate-600'}`}>
                      Sexo: {bird.sex === 'MALE' ? '♂ Macho' : bird.sex === 'FEMALE' ? '♀ Fêmea' : 'Indefinido'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conector 1 -> 2: Principal -> Pais */}
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

              {/* 2. Parents */}
              <div className="w-[190px] shrink-0 h-[440px] flex flex-col justify-around">
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

              {/* Conector 2 -> 3: Pais -> Avós */}
              <div className="w-[18px] h-[460px] relative shrink-0">
                <svg className="w-full h-full" viewBox="0 0 18 460" fill="none" preserveAspectRatio="none">
                  <path
                    d="M 0,115 H 9 V 58 H 18 M 9,115 V 172 H 18"
                    stroke={themeStyle === 'DARK_PRESTIGE' ? '#38bdf8' : '#0284c7'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0,345 H 9 V 288 H 18 M 9,345 V 402 H 18"
                    stroke={themeStyle === 'DARK_PRESTIGE' ? '#f43f5e' : '#e11d48'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* 3. Grandparents */}
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
                    <span className="text-[8px] font-black uppercase text-slate-400 block">{av.role}</span>
                    <p className="font-bold text-[11px] truncate">{av.name}</p>
                    <p className="text-[9px] font-mono text-slate-400">{av.ringNumber}</p>
                  </div>
                ))}
              </div>

              {/* Conector 3 -> 4: Avós -> Bisavós */}
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

              {/* 4. Great Grandparents */}
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
                      <span className="text-[7.5px] font-bold text-slate-400 block truncate">{bis.role}</span>
                      <p className="font-bold text-[9.5px] truncate">{bis.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Conector 4 -> 5: Bisavós para Trisavós */}
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

              {/* 5. Geração 4: Trisavós (16 Cards) */}
              {generationsCount >= 5 && (
                <div className="w-[145px] shrink-0 h-[490px] flex flex-col justify-around">
                  {pedigree.greatGreatGrandparents.map((tri, idx) => (
                    <div
                      key={idx}
                      className={`py-0.5 px-1 rounded text-center truncate ${
                        tri.sex === 'MALE'
                          ? 'bg-sky-950/40 text-sky-200 border border-sky-500/20 text-[7.5px]'
                          : 'bg-rose-950/40 text-rose-200 border border-rose-500/20 text-[7.5px]'
                      }`}
                      title={`${tri.role}: ${tri.name}`}
                    >
                      {tri.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Conector 5 -> 6: Trisavós para Tataravós */}
              {generationsCount >= 6 && (
                <div className="w-[10px] h-[500px] relative shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 10 500" fill="none" preserveAspectRatio="none">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <path key={i} d={`M 0,${15 + i * 31} H 5 V ${8 + i * 31} H 10 M 5,${15 + i * 31} V ${22 + i * 31} H 10`} stroke="#64748b" strokeWidth="0.8" />
                    ))}
                  </svg>
                </div>
              )}

              {/* 6. Geração 5: Tataravós (32 Cards) */}
              {generationsCount >= 6 && (
                <div className="w-[130px] shrink-0 h-[500px] flex flex-col justify-around">
                  {pedigree.tataravos.map((tat, idx) => (
                    <div
                      key={idx}
                      className={`py-0 px-0.5 rounded text-center truncate ${
                        tat.sex === 'MALE'
                          ? 'bg-sky-950/50 text-sky-300 border border-sky-500/20 text-[6.5px]'
                          : 'bg-rose-950/50 text-rose-300 border border-rose-500/20 text-[6.5px]'
                      }`}
                      title={`${tat.role}: ${tat.name}`}
                    >
                      {tat.name}
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
                  <span className={`font-extrabold block ${themeStyle === 'DARK_PRESTIGE' ? 'text-white' : 'text-slate-900'}`}>
                    Autenticação Digital BirdPro
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Acesse o laudo oficial escaneando o código QR</span>
                  <span className="text-[9px] font-mono text-emerald-500 block">www.birdpro.com.br/ave/{bird.id}</span>
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
        )}
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
