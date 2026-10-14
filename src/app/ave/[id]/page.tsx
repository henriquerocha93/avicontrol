'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Sparkles, 
  Award,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Bird as BirdIcon
} from 'lucide-react'
import { db } from '@/lib/db'
import { firebaseSync } from '@/lib/firebase-service'
import { Bird, Tenant } from '@/types'
import { formatDate } from '@/lib/utils'
import { resolvePedigreeTree } from '@/lib/pedigree'
import { BadgeFrontAndBack } from '@/components/genealogy/badge-front-and-back'
import { PedigreeCertificateArouca } from '@/components/genealogy/pedigree-certificate-arouca'

function PublicCertificateContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const routeId = params?.id as string
  const queryCode = searchParams?.get('code') || ''
  const autoPrint = searchParams?.get('print') === '1'
  const requestedStyle = (searchParams?.get('style') as any) || 'BADGE_PRO'
  const requestedGen = Number(searchParams?.get('gen')) || 5
  
  // Parâmetros instantâneos passados pelo QR code (permite renderização imediata no celular em 0ms)
  const ringParam = searchParams?.get('r') || searchParams?.get('ring') || ''
  const nameParam = searchParams?.get('n') || searchParams?.get('name') || ''
  const speciesParam = searchParams?.get('s') || searchParams?.get('species') || ''
  const sexParam = (searchParams?.get('x') as any) || ''
  const birthDateParam = searchParams?.get('d') || searchParams?.get('birth') || ''
  const tenantNameParam = searchParams?.get('t') || searchParams?.get('tenant') || ''
  const ctfParam = searchParams?.get('c') || searchParams?.get('ctf') || ''
  const phoneParam = searchParams?.get('w') || searchParams?.get('phone') || ''

  const [bird, setBird] = useState<Bird | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [themeStyle, setThemeStyle] = useState<'BADGE_PRO' | 'CLASSIC_LIGHT' | 'DARK_PRESTIGE'>(requestedStyle)
  const [badgeMode, setBadgeMode] = useState<'FRONT_ONLY' | 'BACK_ONLY' | 'BOTH'>('FRONT_ONLY')
  const [generationsCount, setGenerationsCount] = useState<number>(requestedGen)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadBirdData = async () => {
      const decodedId = decodeURIComponent(routeId || '')
      let targetBird: Bird | null = null

      // 1. Banco de Dados Local por ID ou Anilha
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

      // 3. LocalStorage para ave simulada recente
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

      // 4. Se veio dados nos parâmetros da URL do QR Code (garante renderização instantânea no celular de qualquer pessoa)
      if (!targetBird && (nameParam || ringParam)) {
        targetBird = {
          id: decodedId || `bird-${Date.now()}`,
          tenantId: 'tenant-demo-01',
          name: nameParam || 'AVE REGISTRADA BIRDPRO',
          ringNumber: ringParam || 'SISPASS OFICIAL',
          species: speciesParam || 'Canário-da-terra (Sicalis flaveola)',
          sex: sexParam === 'FEMALE' ? 'FEMALE' : 'MALE',
          birthDate: birthDateParam || new Date().toISOString().split('T')[0],
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

      // 5. Fallback para demonstração caso não encontre
      if (!targetBird) {
        const allBirds = db.getBirds()
        if (allBirds.length > 0) {
          targetBird = allBirds[0]
        } else {
          targetBird = {
            id: decodedId || `sim-${Date.now()}`,
            tenantId: 'tenant-demo-01',
            name: nameParam || 'AVE REGISTRADA BIRDPRO',
            ringNumber: ringParam || (decodedId ? decodedId : 'SISPASS 2026'),
            species: speciesParam || 'Canário-da-terra (Sicalis flaveola)',
            sex: sexParam === 'FEMALE' ? 'FEMALE' : 'MALE',
            birthDate: birthDateParam || new Date().toISOString().split('T')[0],
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

      // 6. Carrega Criatório
      let t: Tenant | null = null
      if (targetBird?.tenantId) {
        t = db.getTenant(targetBird.tenantId) || null
      }
      if (!t) {
        t = db.getTenant() || null
      }
      if (tenantNameParam || ctfParam || phoneParam) {
        t = {
          ...(t || ({} as any)),
          name: tenantNameParam || t?.name || 'CRIATÓRIO AUTORIZADO',
          registryNumber: ctfParam || t?.registryNumber || '—',
          phone: phoneParam || t?.phone || '',
          cellphone: phoneParam || t?.cellphone || ''
        }
      }

      if (isCancelled) return

      setBird(targetBird)
      setTenant(t)
      setIsAuthenticating(false)

      // 7. Consulta em nuvem em segundo plano com timeout robusto para mobile (4G/5G)
      if (decodedId && firebaseSync.isAvailable()) {
        try {
          const timeoutBird = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
          const cloudBird = await Promise.race([firebaseSync.fetchBirdAnywhere(decodedId), timeoutBird])
          if (cloudBird && !isCancelled) {
            setBird(cloudBird)

            // Se o pássaro já tiver o tenantSnapshot embutido, aplica com merge inteligente do criatório mais recente
            if ((cloudBird as any).tenantSnapshot) {
              const snapT = (cloudBird as any).tenantSnapshot
              const localT = db.getTenant(cloudBird.tenantId) || db.getTenant()
              setTenant({
                ...snapT,
                visualConfig: {
                  ...(snapT?.visualConfig || {}),
                  ...(localT?.visualConfig || {})
                }
              })
            }

            // Busca os dados e imagens do criatório na nuvem com timeout independente
            const tid = cloudBird.tenantId || targetBird?.tenantId || 'tenant-demo-01'
            if (tid) {
              const timeoutTenant = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
              const cloudTenant = await Promise.race([
                firebaseSync.fetchTenantById(tid),
                timeoutTenant
              ])
              if (cloudTenant && !isCancelled) {
                setTenant(prev => ({
                  ...(prev || {}),
                  ...cloudTenant,
                  visualConfig: {
                    ...(prev?.visualConfig || {}),
                    ...(cloudTenant.visualConfig || {})
                  }
                }))
              }
            }
          }
        } catch (e) {
          console.warn('Busca nuvem finalizada:', e)
        }
      }
    }

    loadBirdData()

    return () => {
      isCancelled = true
    }
  }, [routeId, queryCode, nameParam, ringParam, speciesParam, sexParam, tenantNameParam, ctfParam, phoneParam])

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

  const publicUrl = typeof window !== 'undefined' ? window.location.href : `https://www.birdpro.com.br/ave/${bird?.id || routeId}`

  const handlePrint = () => {
    window.print()
  }

  // Telefone para contato no WhatsApp
  const rawPhone = tenant?.cellphone || tenant?.phone || phoneParam || ''
  const cleanPhone = rawPhone.replace(/\D/g, '')
  const whatsAppUrl = cleanPhone 
    ? `https://wa.me/55${cleanPhone.replace(/^55/, '')}?text=${encodeURIComponent(
        `Olá! Estou visualizando o crachá oficial da ave ${bird?.name || ''} (${bird?.ringNumber || ''}) na plataforma BirdPro.`
      )}`
    : ''

  if (!bird || !tenant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 text-center max-w-md space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-spin">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold">Carregando Crachá Online...</h2>
          <p className="text-xs text-slate-400">Identificando dados da ave e do criatório na plataforma BIRDPRO.</p>
        </div>
      </div>
    )
  }

  const pedigree = resolvePedigreeTree(bird)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center print:bg-white print:p-0">
      
      {/* Top Floating Controls Bar */}
      <div className="w-full bg-[#1b222a] border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md sticky top-0 z-50 print:hidden">
        
        {/* Identificação BirdPro */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#00c853] flex items-center justify-center text-slate-950 font-black text-xs shadow">
            BP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white tracking-wide">BIRDPRO</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓ Crachá Online Verificado
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {bird.name} ({bird.ringNumber}) • {tenant.name}
            </p>
          </div>
        </div>

        {/* Controles de Visualização: Crachá Online vs Certificado A4 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          <div className="inline-flex rounded-md bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setThemeStyle('BADGE_PRO')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                themeStyle === 'BADGE_PRO' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>🏅 Crachá Online</span>
            </button>

            <button
              onClick={() => setThemeStyle('CLASSIC_LIGHT')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                themeStyle === 'CLASSIC_LIGHT' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>🌟 Certificado A4 Oficial</span>
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

      {/* ========================================================================= */}
      {/* CONTEÚDO PRINCIPAL: CRACHÁ ONLINE OFICIAL OU CERTIFICADO A4              */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-6 flex justify-center w-full overflow-x-auto print:p-0">
        
        {themeStyle === 'BADGE_PRO' ? (
          <div className="w-full max-w-4xl flex flex-col items-center space-y-6">
            
            {/* 1. SELETOR DE LADO DO CRACHÁ (FRENTE / VERSO / AMBOS) */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl print:hidden shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00c853] animate-pulse" />
                <span>Visualizador do Crachá Oficial:</span>
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setBadgeMode('FRONT_ONLY')}
                  className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                    badgeMode === 'FRONT_ONLY' 
                      ? 'bg-[#00c853] text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏷️ 1. Frente do Crachá
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeMode('BACK_ONLY')}
                  className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                    badgeMode === 'BACK_ONLY' 
                      ? 'bg-[#00c853] text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌳 2. Verso (Genealogia)
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeMode('BOTH')}
                  className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                    badgeMode === 'BOTH' 
                      ? 'bg-[#00c853] text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📄 Ver Ambos os Lados
                </button>
              </div>
            </div>

            {/* 2. O CRACHÁ OFICIAL RESPONSIVO INTERATIVO */}
            <div className="w-full flex justify-center overflow-x-hidden">
              <BadgeFrontAndBack 
                bird={bird} 
                tenant={tenant} 
                mode={badgeMode} 
              />
            </div>

            {/* 3. BOTÕES DE AÇÃO RÁPIDA (WHATSAPP, CERTIFICADO COMPLETO) */}
            <div className="w-full flex flex-wrap items-center justify-center gap-3 print:hidden">
              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-slate-950" />
                  <span>Falar com o Criatório no WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setThemeStyle('CLASSIC_LIGHT')}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>Ver Certificado A4 Genealógico Completo</span>
              </button>
            </div>

            {/* 4. DOCUMENTO INDIVIDUAL OFICIAL DA AVE */}
            <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-2xl text-slate-200">
              
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00c853] to-emerald-600 flex items-center justify-center text-white font-black text-base shadow-md">
                    BP
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                      Ficha Zootécnica &amp; Registro da Ave
                    </h2>
                    <p className="text-xs text-slate-400">
                      Autenticidade Verificada na Plataforma BirdPro
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Registro Oficial Ativo</span>
                  </span>
                </div>
              </div>

              {/* Grid: Identificação da Ave & Criatório */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Coluna A: Dados da Ave */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider block border-b border-slate-800 pb-1.5">
                    Identificação da Ave
                  </span>

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
                      <span className="text-slate-300 block">{bird.birthDate ? formatDate(bird.birthDate) : '20/12/2025'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Situação no Criatório</span>
                      <span className="text-emerald-400 font-bold block">Plantel Oficial</span>
                    </div>
                  </div>
                </div>

                {/* Coluna B: Dados do Criatório Responsável */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider block border-b border-slate-800 pb-1.5">
                    Criatório Responsável
                  </span>

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

              {/* Linhagem: Pais da Ave */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider block border-b border-slate-800 pb-1.5">
                  Filiação Oficial (1ª Geração)
                </span>

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

            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* CERTIFICADO A4 OFICIAL (PADRÃO AROUCA / CRIATÓRIO DE ALTA QUALIDADE)      */
          /* ========================================================================= */
          <div className="w-full flex justify-center">
            <PedigreeCertificateArouca
              bird={bird}
              tenant={tenant}
              generationsCount={generationsCount}
              showQrCode={true}
              publicUrl={publicUrl}
            />
          </div>
        )}

      </div>

    </div>
  )
}

export default function PublicQrGenealogyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Carregando...</p>
        </div>
      </div>
    }>
      <PublicCertificateContent />
    </Suspense>
  )
}
