'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Edit3, 
  Plus, 
  Minus, 
  ChevronLeft, 
  Check, 
  Search, 
  X, 
  CheckCircle2,
  Printer,
  ExternalLink,
  Award,
  Sparkles,
  Bird as BirdIcon
} from 'lucide-react'
import { db } from '@/lib/db'
import { Bird } from '@/types'
import { PrintPedigreeModal } from '@/components/modals/print-pedigree-modal'
import { PrintBadgeModal } from '@/components/modals/print-badge-modal'

// Desenho nítido e autêntico de passarinho pousado no galho, fiel ao print de genealogia
export function PassarinhoIcon({ 
  className = "w-8 h-8 text-slate-800",
  sex = "UNKNOWN"
}: { 
  className?: string
  sex?: 'MALE' | 'FEMALE' | 'UNKNOWN'
}) {
  const getSexFill = () => {
    if (sex === 'MALE') return "rgba(2, 132, 199, 0.12)" // azul suave macho
    if (sex === 'FEMALE') return "rgba(225, 29, 72, 0.12)" // rosa suave fêmea
    return "rgba(16, 185, 129, 0.10)" // verde suave ave raiz
  }

  const getWingFill = () => {
    if (sex === 'MALE') return "rgba(2, 132, 199, 0.22)"
    if (sex === 'FEMALE') return "rgba(225, 29, 72, 0.22)"
    return "rgba(16, 185, 129, 0.20)"
  }

  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Galho horizontal com bifurcação / broto à direita */}
      <path d="M4 25 L22 25" stroke="currentColor" />
      <path d="M21 25 L26.5 22" stroke="currentColor" />
      <path d="M22.5 25 L26 27.5" stroke="currentColor" />
      
      {/* Pés segurando o galho */}
      <path d="M13.5 21.5 L13.5 25" stroke="currentColor" />
      <path d="M16.5 21.5 L16.5 25" stroke="currentColor" />
      
      {/* Silhueta do Passarinho (rabo, dorso, cabeça, bico, papo e barriga) */}
      <path 
        d="M5 24.5 L9 21.5 C11 16 13 10 17.5 7.5 C18.8 7.5 19.8 8.2 20.2 9 L23.5 10.2 L20.2 11.2 C20.8 15 19.5 21.5 14 21.5 L9 21.5 Z" 
        fill={getSexFill()}
        stroke="currentColor"
      />
      
      {/* Asa detalhada e curvada */}
      <path 
        d="M11 19.5 C12.5 15 14.5 12.5 16.5 13.5 C16.8 16.5 14.5 19 11 19.5 Z" 
        fill={getWingFill()}
        stroke="currentColor"
      />
      
      {/* Olho com ponto de brilho branco */}
      <circle cx="18.2" cy="9.8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="18" cy="9.5" r="0.3" fill="#ffffff" stroke="none" />
    </svg>
  )
}

interface NodeData {
  id?: string
  name: string
  ringNumber: string
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN'
}

export interface NovaGenealogiaEnvironmentProps {
  initialBirdId?: string
  initialRingNumber?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function NovaGenealogiaEnvironment({
  initialBirdId,
  initialRingNumber,
  showBackButton = true,
  onBack
}: NovaGenealogiaEnvironmentProps) {
  const [mounted, setMounted] = useState(false)
  const [allBirds, setAllBirds] = useState<Bird[]>([])

  // Safe load birds from database
  useEffect(() => {
    setMounted(true)
    try {
      const list = db.getBirds()
      if (Array.isArray(list)) {
        setAllBirds(list)
      }
    } catch (e) {
      console.warn('Erro ao carregar aves para genealogia:', e)
    }
  }, [])

  // Generation level: 2 = Pais (matching screenshot), 3 = Avós
  const [generations, setGenerations] = useState<2 | 3>(2)
  const [zoomScale, setZoomScale] = useState<number>(1)

  // Nodes State
  const [mainBird, setMainBird] = useState<NodeData>({ name: '', ringNumber: '', sex: 'UNKNOWN' })
  const [father, setFather] = useState<NodeData>({ name: '', ringNumber: '', sex: 'MALE' })
  const [mother, setMother] = useState<NodeData>({ name: '', ringNumber: '', sex: 'FEMALE' })

  // Grandparents (Level 3)
  const [patGrandfather, setPatGrandfather] = useState<NodeData>({ name: '', ringNumber: '', sex: 'MALE' })
  const [patGrandmother, setPatGrandmother] = useState<NodeData>({ name: '', ringNumber: '', sex: 'FEMALE' })
  const [matGrandfather, setMatGrandfather] = useState<NodeData>({ name: '', ringNumber: '', sex: 'MALE' })
  const [matGrandmother, setMatGrandmother] = useState<NodeData>({ name: '', ringNumber: '', sex: 'FEMALE' })

  // Full Active Bird Object for actions / modals
  const [selectedFullBird, setSelectedFullBird] = useState<Bird | null>(null)
  const [isPedigreeOpen, setIsPedigreeOpen] = useState(false)
  const [isBadgeOpen, setIsBadgeOpen] = useState(false)

  // Ring Number Quick Search State
  const [ringSearchQuery, setRingSearchQuery] = useState('')
  const [showRingSuggestions, setShowRingSuggestions] = useState(false)
  const [ringNotFound, setRingNotFound] = useState<string | null>(null)

  // Selection Modal State
  const [modalTarget, setModalTarget] = useState<
    'main' | 'father' | 'mother' | 'patGF' | 'patGM' | 'matGF' | 'matGM' | null
  >(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [manualName, setManualName] = useState('')
  const [manualRing, setManualRing] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Open modal to select bird
  const handleOpenSelector = (target: 'main' | 'father' | 'mother' | 'patGF' | 'patGM' | 'matGF' | 'matGM') => {
    setModalTarget(target)
    setSearchTerm('')
    setManualName('')
    setManualRing('')
  }

  // Handle bird selection from database with full recursive genealogy ancestry resolution
  const handleSelectBird = (bird: Bird, targetOverride?: 'main' | 'father' | 'mother' | 'patGF' | 'patGM' | 'matGF' | 'matGM') => {
    if (!bird) return
    const target = targetOverride || modalTarget
    const data: NodeData = {
      id: bird.id || '',
      name: bird.name || 'Sem Nome',
      ringNumber: bird.ringNumber || '',
      sex: (bird.sex as any) || 'UNKNOWN'
    }

    if (target === 'main') {
      setMainBird(data)
      setSelectedFullBird(bird)
      setRingNotFound(null)

      // 1. Resolve Father
      let fName = bird.fatherName || ''
      let fRing = bird.fatherRing || ''
      const fBird = allBirds.find(b => 
        (bird.fatherId && b.id === bird.fatherId) ||
        (fRing && b.ringNumber && b.ringNumber.toLowerCase().trim() === fRing.toLowerCase().trim()) ||
        (fName && b.name && b.name.toLowerCase().trim() === fName.toLowerCase().trim())
      )

      if (fBird) {
        fName = fBird.name
        fRing = fBird.ringNumber || fRing
      }

      setFather({
        id: fBird?.id,
        name: fName,
        ringNumber: fRing,
        sex: 'MALE'
      })

      // 2. Resolve Mother
      let mName = bird.motherName || ''
      let mRing = bird.motherRing || ''
      const mBird = allBirds.find(b => 
        (bird.motherId && b.id === bird.motherId) ||
        (mRing && b.ringNumber && b.ringNumber.toLowerCase().trim() === mRing.toLowerCase().trim()) ||
        (mName && b.name && b.name.toLowerCase().trim() === mName.toLowerCase().trim())
      )

      if (mBird) {
        mName = mBird.name
        mRing = mBird.ringNumber || mRing
      }

      setMother({
        id: mBird?.id,
        name: mName,
        ringNumber: mRing,
        sex: 'FEMALE'
      })

      // 3. Resolve Paternal Grandparents
      let patGfName = bird.paternalGrandfatherId || fBird?.fatherName || ''
      let patGfRing = fBird?.fatherRing || ''
      let patGmName = bird.paternalGrandmotherId || fBird?.motherName || ''
      let patGmRing = fBird?.motherRing || ''

      const patGfBird = allBirds.find(b => 
        (patGfRing && b.ringNumber && b.ringNumber.toLowerCase().trim() === patGfRing.toLowerCase().trim()) || 
        (patGfName && b.name && b.name.toLowerCase().trim() === patGfName.toLowerCase().trim())
      )
      if (patGfBird) {
        patGfName = patGfBird.name
        patGfRing = patGfBird.ringNumber || patGfRing
      }

      const patGmBird = allBirds.find(b => 
        (patGmRing && b.ringNumber && b.ringNumber.toLowerCase().trim() === patGmRing.toLowerCase().trim()) || 
        (patGmName && b.name && b.name.toLowerCase().trim() === patGmName.toLowerCase().trim())
      )
      if (patGmBird) {
        patGmName = patGmBird.name
        patGmRing = patGmBird.ringNumber || patGmRing
      }

      setPatGrandfather({
        id: patGfBird?.id,
        name: patGfName,
        ringNumber: patGfRing,
        sex: 'MALE'
      })
      setPatGrandmother({
        id: patGmBird?.id,
        name: patGmName,
        ringNumber: patGmRing,
        sex: 'FEMALE'
      })

      // 4. Resolve Maternal Grandparents
      let matGfName = bird.maternalGrandfatherId || mBird?.fatherName || ''
      let matGfRing = mBird?.fatherRing || ''
      let matGmName = bird.maternalGrandmotherId || mBird?.motherName || ''
      let matGmRing = mBird?.motherRing || ''

      const matGfBird = allBirds.find(b => 
        (matGfRing && b.ringNumber && b.ringNumber.toLowerCase().trim() === matGfRing.toLowerCase().trim()) || 
        (matGfName && b.name && b.name.toLowerCase().trim() === matGfName.toLowerCase().trim())
      )
      if (matGfBird) {
        matGfName = matGfBird.name
        matGfRing = matGfBird.ringNumber || matGfRing
      }

      const matGmBird = allBirds.find(b => 
        (matGmRing && b.ringNumber && b.ringNumber.toLowerCase().trim() === matGmRing.toLowerCase().trim()) || 
        (matGmName && b.name && b.name.toLowerCase().trim() === matGmName.toLowerCase().trim())
      )
      if (matGmBird) {
        matGmName = matGmBird.name
        matGmRing = matGmBird.ringNumber || matGmRing
      }

      setMatGrandfather({
        id: matGfBird?.id,
        name: matGfName,
        ringNumber: matGfRing,
        sex: 'MALE'
      })
      setMatGrandmother({
        id: matGmBird?.id,
        name: matGmName,
        ringNumber: matGmRing,
        sex: 'FEMALE'
      })

      // Se houver qualquer avô ou avó cadastrado, abre automaticamente 3 gerações
      if (patGfName || patGmName || matGfName || matGmName) {
        setGenerations(3)
      }
    } else if (target === 'father') {
      setFather(data)
    } else if (target === 'mother') {
      setMother(data)
    } else if (target === 'patGF') {
      setPatGrandfather(data)
    } else if (target === 'patGM') {
      setPatGrandmother(data)
    } else if (target === 'matGF') {
      setMatGrandfather(data)
    } else if (target === 'matGM') {
      setMatGrandmother(data)
    }

    setModalTarget(null)
  }

  // Quick Ring Search Handler
  const handleSearchByRing = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : ringSearchQuery).trim()
    if (!q) return

    const qClean = q.toLowerCase()
    const qAlpha = qClean.replace(/[^a-z0-9]/g, '')

    const found = db.getBirdByRingNumber(q) || allBirds.find(b => {
      if (!b.ringNumber) return false
      const bRing = b.ringNumber.toLowerCase().trim()
      const bAlpha = bRing.replace(/[^a-z0-9]/g, '')
      return (
        bRing === qClean || 
        (qAlpha && bAlpha === qAlpha) || 
        bRing.includes(qClean) || 
        (qAlpha && bAlpha.includes(qAlpha)) ||
        (b.name && b.name.toLowerCase().includes(qClean))
      )
    })

    if (found) {
      handleSelectBird(found, 'main')
      setShowRingSuggestions(false)
      setRingNotFound(null)
    } else {
      setRingNotFound(q)
      setShowRingSuggestions(false)
    }
  }

  // Ring suggestions list as user types
  const ringSuggestions = ringSearchQuery.trim()
    ? allBirds.filter(b => {
        if (!b.ringNumber) return false
        const q = ringSearchQuery.toLowerCase().trim()
        const qAlpha = q.replace(/[^a-z0-9]/g, '')
        const r = b.ringNumber.toLowerCase()
        const rAlpha = r.replace(/[^a-z0-9]/g, '')
        const n = (b.name || '').toLowerCase()
        return r.includes(q) || (qAlpha && rAlpha.includes(qAlpha)) || n.includes(q)
      }).slice(0, 6)
    : []

  // Auto-seleciona a ave inicial, por ID ou por número da anilha, ou localStorage
  useEffect(() => {
    if (!Array.isArray(allBirds) || allBirds.length === 0) return

    let targetBirdId = initialBirdId
    let targetRing = initialRingNumber

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (!targetBirdId) targetBirdId = urlParams.get('birdId') || localStorage.getItem('birdpro_active_tree_bird_id') || undefined
      if (!targetRing) targetRing = urlParams.get('anilha') || undefined
    }

    let birdToSelect: Bird | undefined

    if (targetRing) {
      const qClean = targetRing.toLowerCase().trim()
      const qAlpha = qClean.replace(/[^a-z0-9]/g, '')
      birdToSelect = allBirds.find(b => {
        if (!b.ringNumber) return false
        const bRing = b.ringNumber.toLowerCase().trim()
        const bAlpha = bRing.replace(/[^a-z0-9]/g, '')
        return bRing === qClean || (qAlpha && bAlpha === qAlpha) || bRing.includes(qClean)
      })
    }

    if (!birdToSelect && targetBirdId) {
      birdToSelect = allBirds.find(b => b && b.id === targetBirdId)
    }

    if (!birdToSelect && allBirds.length > 0) {
      birdToSelect = allBirds.find(b => b && (b.fatherName || b.motherName)) || allBirds[0]
    }

    if (birdToSelect) {
      handleSelectBird(birdToSelect, 'main')
    }
  }, [initialBirdId, initialRingNumber, allBirds])

  // Handle manual bird assignment
  const handleApplyManual = () => {
    if (!manualName && !manualRing) return

    const data: NodeData = {
      name: manualName || 'Sem Nome',
      ringNumber: manualRing || '',
      sex: modalTarget?.includes('mother') || modalTarget?.includes('GM') ? 'FEMALE' : 'MALE'
    }

    if (modalTarget === 'main') setMainBird(data)
    else if (modalTarget === 'father') setFather(data)
    else if (modalTarget === 'mother') setMother(data)
    else if (modalTarget === 'patGF') setPatGrandfather(data)
    else if (modalTarget === 'patGM') setPatGrandmother(data)
    else if (modalTarget === 'matGF') setMatGrandfather(data)
    else if (modalTarget === 'matGM') setMatGrandmother(data)

    setModalTarget(null)
  }

  // Clear specific node
  const handleClearNode = () => {
    const empty: NodeData = { name: '', ringNumber: '', sex: 'UNKNOWN' }
    if (modalTarget === 'main') setMainBird(empty)
    else if (modalTarget === 'father') setFather({ ...empty, sex: 'MALE' })
    else if (modalTarget === 'mother') setMother({ ...empty, sex: 'FEMALE' })
    else if (modalTarget === 'patGF') setPatGrandfather({ ...empty, sex: 'MALE' })
    else if (modalTarget === 'patGM') setPatGrandmother({ ...empty, sex: 'FEMALE' })
    else if (modalTarget === 'matGF') setMatGrandfather({ ...empty, sex: 'MALE' })
    else if (modalTarget === 'matGM') setMatGrandmother({ ...empty, sex: 'FEMALE' })
    setModalTarget(null)
  }

  // Save genealogy relationship safely
  const handleSave = () => {
    try {
      if (mainBird && mainBird.id) {
        db.updateBird(mainBird.id, {
          fatherName: father?.name || undefined,
          motherName: mother?.name || undefined,
          paternalGrandfatherId: patGrandfather?.name || undefined,
          paternalGrandmotherId: patGrandmother?.name || undefined,
          maternalGrandfatherId: matGrandfather?.name || undefined,
          maternalGrandmotherId: matGrandmother?.name || undefined,
        })
      }

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3500)
    } catch (e) {
      console.error('Erro ao salvar genealogia:', e)
    }
  }

  // Zoom / generation controls
  const handleZoomIn = () => {
    if (generations < 3) {
      setGenerations(3)
    } else {
      setZoomScale(prev => Math.min(prev + 0.1, 1.25))
    }
  }

  const handleZoomOut = () => {
    if (zoomScale > 1) {
      setZoomScale(prev => Math.max(prev - 0.1, 0.85))
    } else if (generations > 2) {
      setGenerations(2)
    }
  }

  // Filter birds for modal with defensive null-checks
  const filteredBirds = Array.isArray(allBirds) ? allBirds.filter(b => {
    if (!b) return false
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase().trim()
    const nameStr = String(b.name || '').toLowerCase()
    const ringStr = String(b.ringNumber || '').toLowerCase()
    const speciesStr = String(b.species || '').toLowerCase()
    return nameStr.includes(term) || ringStr.includes(term) || speciesStr.includes(term)
  }) : []

  if (!mounted) {
    return (
      <div className="w-full max-w-7xl mx-auto py-2 sm:py-4 px-2 sm:px-4 font-sans space-y-4">
        <div className="bg-white border border-gray-300 rounded-lg shadow-xs p-12 min-h-[460px] flex items-center justify-center">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
            <div className="w-4 h-4 border-2 border-[#009fe3] border-t-transparent rounded-full animate-spin" />
            <span>Carregando Genealogia...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-2 sm:py-4 px-2 sm:px-4 font-sans space-y-4">
      
      {/* Success notification banner */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
            <span>Genealogia salva com sucesso no sistema! Os vínculos genéticos foram atualizados.</span>
          </div>
          <button 
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. BARRA DE BUSCA RÁPIDA POR NÚMERO DA ANILHA                              */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2 text-slate-700 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <BirdIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block leading-tight">Buscar por Número da Anilha</span>
              <span className="text-[10px] text-slate-400">Encontre a ave e toda a árvore cadastrada</span>
            </div>
          </div>

          {/* Input with real-time suggestions */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Digite a anilha (ex: SISPASS 2.2 RS/A 041738, 041738, 2024)..."
                value={ringSearchQuery}
                onChange={(e) => {
                  setRingSearchQuery(e.target.value)
                  setShowRingSuggestions(true)
                  setRingNotFound(null)
                }}
                onFocus={() => setShowRingSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearchByRing()
                  }
                }}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00c853] focus:bg-white font-mono transition"
              />
              {ringSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setRingSearchQuery('')
                    setShowRingSuggestions(false)
                    setRingNotFound(null)
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Floating Suggestions */}
            {showRingSuggestions && ringSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 max-h-60 overflow-y-auto divide-y divide-slate-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Anilhas Encontradas ({ringSuggestions.length}):
                </div>
                {ringSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    onClick={() => {
                      setRingSearchQuery(sug.ringNumber)
                      handleSearchByRing(sug.ringNumber)
                    }}
                    className="px-3 py-2 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                        {sug.ringNumber}
                      </span>
                      <span className="text-xs text-slate-700 font-medium truncate max-w-[150px]">
                        {sug.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({sug.species.split('(')[0].trim()})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {sug.sex === 'MALE' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">♂ Macho</span>
                      ) : sug.sex === 'FEMALE' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">♀ Fêmea</span>
                      ) : null}
                      <span className="text-[10px] font-bold text-emerald-600 group-hover:underline">Ver Árvore →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => handleSearchByRing()}
            className="px-4 py-2 bg-[#00c853] hover:bg-[#00b84a] active:bg-[#009e3e] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar Árvore</span>
          </button>
        </div>

        {/* Not Found Alert */}
        {ringNotFound && (
          <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center justify-between animate-in fade-in">
            <span>
              Nenhuma ave cadastrada encontrada com a anilha <strong>&quot;{ringNotFound}&quot;</strong>. Verifique o número digitado ou importe/cadastre a ave.
            </span>
            <button
              type="button"
              onClick={() => setRingNotFound(null)}
              className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. CARD RESUMO DA AVE ATIVA NA ÁRVORE COM AÇÕES RÁPIDAS                    */}
      {/* ========================================================================= */}
      {(selectedFullBird || mainBird.name) && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl p-3 sm:p-4 shadow-sm border border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <PassarinhoIcon sex={mainBird.sex} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ave em Destaque na Árvore
                </span>
                <span className="font-mono font-bold text-xs bg-black/40 px-2 py-0.5 rounded border border-white/10 text-emerald-400">
                  Anilha: {mainBird.ringNumber || 'Sem Anilha'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
                {mainBird.name}
                {selectedFullBird?.species ? (
                  <span className="text-xs font-normal text-slate-300 ml-2">
                    • {selectedFullBird.species.split('(')[0].trim()}
                  </span>
                ) : null}
              </h2>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedFullBird && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPedigreeOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Imprimir Certificado Genealógico Oficial A4"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pedigree A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBadgeOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Imprimir Etiqueta da Gaiola com QR Code"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Etiqueta Gaiola</span>
                </button>

                <Link
                  href={`/dashboard/aves/${selectedFullBird.id}`}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                  title="Ver Ficha Zootécnica Completa"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ficha Completa</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTAINER MATCHING SCREENSHOT                                        */}
      {/* ========================================================================= */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-xs overflow-hidden flex flex-col">
        
        {/* ----------------------------------------------------------------------- */}
        {/* TOP BAR / HEADER (Matching Screenshot: [Edit Icon] Genealogia ... [+][-])*/}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#f8fafc] border-b border-gray-200 px-4 py-2.5 flex items-center justify-between select-none">
          
          {/* Left Title with Edit Icon */}
          <div className="flex items-center gap-2 text-slate-800">
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-800">
              Genealogia
            </span>
          </div>

          {/* Right Controls: [ + ] and [ - ] Buttons (Dark slate buttons from screenshot) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#94a3b8] hover:bg-[#64748b] active:bg-[#475569] text-white rounded flex items-center justify-center shadow-sm transition cursor-pointer"
              title="Expandir gerações ou aumentar zoom"
              aria-label="Aumentar zoom ou gerações"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#94a3b8] hover:bg-[#64748b] active:bg-[#475569] text-white rounded flex items-center justify-center shadow-sm transition cursor-pointer"
              title="Recolher gerações ou diminuir zoom"
              aria-label="Diminuir zoom ou gerações"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* MAIN CANVAS / TREE DIAGRAM AREA                                         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white min-h-[460px] sm:min-h-[520px] p-6 sm:p-12 flex flex-col items-center justify-center relative overflow-x-auto select-none">
          
          <div 
            className="flex flex-col items-center transition-transform duration-300"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
          >
            
            {/* 1. ROOT NODE: AVE (TOP CENTER) */}
            <div className="flex flex-col items-center relative z-10">
              
              <div 
                onClick={() => handleOpenSelector('main')}
                className={`w-28 sm:w-32 bg-white border rounded-md p-2.5 text-center shadow-xs cursor-pointer hover:border-emerald-500 hover:shadow-sm transition-all group ${
                  mainBird.name ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-300'
                }`}
                title="Clique para selecionar ou definir a ave"
              >
                {/* Passarinho desenhado no galho (Ave Raiz) */}
                <div className="flex items-center justify-center text-slate-800 group-hover:text-emerald-600 transition-colors">
                  <PassarinhoIcon sex="UNKNOWN" className="w-8 h-8" />
                </div>

                {/* Node Label */}
                <span className="text-[11px] font-bold text-slate-800 block mt-1">
                  Ave
                </span>

                {/* Placeholder or Bird Details */}
                <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">
                  {mainBird.name 
                    ? `${mainBird.name} ${mainBird.ringNumber ? `(${mainBird.ringNumber})` : ''}` 
                    : '....'}
                </span>
              </div>

              {/* Vertical line descending from Ave */}
              <div className="w-[1.5px] h-8 sm:h-10 bg-gray-300" />

            </div>

            {/* 2. HORIZONTAL BRANCH BAR */}
            <div className="w-72 sm:w-[420px] relative">
              
              {/* Horizontal Crossbar connecting center of Macho to center of Fêmea */}
              <div className="absolute left-14 sm:left-16 right-14 sm:right-16 top-0 h-[1.5px] bg-gray-300" />

              {/* Left Vertical Drop entering top center of Macho */}
              <div className="absolute left-14 sm:left-16 top-0 w-[1.5px] h-8 sm:h-10 bg-gray-300" />

              {/* Right Vertical Drop entering top center of Fêmea */}
              <div className="absolute right-14 sm:right-16 top-0 w-[1.5px] h-8 sm:h-10 bg-gray-300" />

            </div>

            {/* 3. LEVEL 1 NODES: MACHO ♂ (LEFT) & FÊMEA ♀ (RIGHT) */}
            <div className="w-72 sm:w-[420px] flex items-start justify-between pt-8 sm:pt-10 relative z-10">
              
              {/* --- MACHO ♂ (LEFT) --- */}
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => handleOpenSelector('father')}
                  className={`w-28 sm:w-32 bg-white border rounded-md p-2.5 text-center shadow-xs cursor-pointer hover:border-sky-500 hover:shadow-sm transition-all relative group ${
                    father.name ? 'border-sky-500 bg-sky-50/20' : 'border-gray-300'
                  }`}
                  title="Clique para definir o Pai (Macho)"
                >
                  {/* Male Symbol in corner */}
                  <span className="absolute top-1.5 right-2 text-xs font-bold text-slate-500 group-hover:text-sky-600">
                    ♂
                  </span>

                  {/* Passarinho desenhado no galho (Macho) */}
                  <div className="flex items-center justify-center text-slate-800 group-hover:text-sky-600 transition-colors">
                    <PassarinhoIcon sex="MALE" className="w-8 h-8" />
                  </div>

                  {/* Label */}
                  <span className="text-[11px] font-bold text-slate-800 block mt-1">
                    Macho
                  </span>

                  {/* Placeholder / Ring */}
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">
                    {father.name 
                      ? `${father.name} ${father.ringNumber ? `(${father.ringNumber})` : ''}` 
                      : 'INDEFINIDO'}
                  </span>
                </div>

                {/* Sub-tree lines if expanded to 3 generations */}
                {generations >= 3 && (
                  <div className="flex flex-col items-center mt-0 w-44">
                    <div className="w-[1.5px] h-7 bg-gray-300" />
                    
                    {/* Crossbar for paternal grandparents */}
                    <div className="w-40 relative">
                      <div className="absolute left-9 right-9 top-0 h-[1.5px] bg-gray-300" />
                      <div className="absolute left-9 top-0 w-[1.5px] h-7 bg-gray-300" />
                      <div className="absolute right-9 top-0 w-[1.5px] h-7 bg-gray-300" />
                    </div>

                    {/* Avós Paternos */}
                    <div className="w-40 flex justify-between pt-7">
                      {/* Avô Paterno */}
                      <div
                        onClick={() => handleOpenSelector('patGF')}
                        className="w-18 bg-white border border-gray-300 rounded p-1.5 text-center shadow-sm hover:border-sky-500 cursor-pointer relative"
                        title="Avô Paterno ♂"
                      >
                        <span className="absolute top-0.5 right-1 text-[9px] text-sky-600 font-bold">♂</span>
                        <PassarinhoIcon sex="MALE" className="w-5 h-5 mx-auto text-slate-700" />
                        <span className="text-[8px] font-bold block mt-0.5">Avô P.</span>
                        <span className="text-[7.5px] text-slate-500 truncate block font-mono">
                          {patGrandfather.name || 'INDEFINIDO'}
                        </span>
                      </div>

                      {/* Avó Paterna */}
                      <div
                        onClick={() => handleOpenSelector('patGM')}
                        className="w-18 bg-white border border-gray-300 rounded p-1.5 text-center shadow-sm hover:border-rose-500 cursor-pointer relative"
                        title="Avó Paterna ♀"
                      >
                        <span className="absolute top-0.5 right-1 text-[9px] text-rose-500 font-bold">♀</span>
                        <PassarinhoIcon sex="FEMALE" className="w-5 h-5 mx-auto text-slate-700" />
                        <span className="text-[8px] font-bold block mt-0.5">Avó P.</span>
                        <span className="text-[7.5px] text-slate-500 truncate block font-mono">
                          {patGrandmother.name || 'INDEFINIDA'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* --- FÊMEA ♀ (RIGHT) --- */}
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => handleOpenSelector('mother')}
                  className={`w-28 sm:w-32 bg-white border rounded-md p-2.5 text-center shadow-xs cursor-pointer hover:border-rose-500 hover:shadow-sm transition-all relative group ${
                    mother.name ? 'border-rose-500 bg-rose-50/20' : 'border-gray-300'
                  }`}
                  title="Clique para definir a Mãe (Fêmea)"
                >
                  {/* Female Symbol in corner */}
                  <span className="absolute top-1.5 right-2 text-xs font-bold text-slate-500 group-hover:text-rose-600">
                    ♀
                  </span>

                  {/* Passarinho desenhado no galho (Fêmea) */}
                  <div className="flex items-center justify-center text-slate-800 group-hover:text-rose-600 transition-colors">
                    <PassarinhoIcon sex="FEMALE" className="w-8 h-8" />
                  </div>

                  {/* Label */}
                  <span className="text-[11px] font-bold text-slate-800 block mt-1">
                    Fêmea
                  </span>

                  {/* Placeholder / Ring */}
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">
                    {mother.name 
                      ? `${mother.name} ${mother.ringNumber ? `(${mother.ringNumber})` : ''}` 
                      : 'INDEFINIDA'}
                  </span>
                </div>

                {/* Sub-tree lines if expanded to 3 generations */}
                {generations >= 3 && (
                  <div className="flex flex-col items-center mt-0 w-44">
                    <div className="w-[1.5px] h-7 bg-gray-300" />
                    
                    {/* Crossbar for maternal grandparents */}
                    <div className="w-40 relative">
                      <div className="absolute left-9 right-9 top-0 h-[1.5px] bg-gray-300" />
                      <div className="absolute left-9 top-0 w-[1.5px] h-7 bg-gray-300" />
                      <div className="absolute right-9 top-0 w-[1.5px] h-7 bg-gray-300" />
                    </div>

                    {/* Avós Maternos */}
                    <div className="w-40 flex justify-between pt-7">
                      {/* Avô Materno */}
                      <div
                        onClick={() => handleOpenSelector('matGF')}
                        className="w-18 bg-white border border-gray-300 rounded p-1.5 text-center shadow-sm hover:border-sky-500 cursor-pointer relative"
                        title="Avô Materno ♂"
                      >
                        <span className="absolute top-0.5 right-1 text-[9px] text-sky-600 font-bold">♂</span>
                        <PassarinhoIcon sex="MALE" className="w-5 h-5 mx-auto text-slate-700" />
                        <span className="text-[8px] font-bold block mt-0.5">Avô M.</span>
                        <span className="text-[7.5px] text-slate-500 truncate block font-mono">
                          {matGrandfather.name || 'INDEFINIDO'}
                        </span>
                      </div>

                      {/* Avó Materna */}
                      <div
                        onClick={() => handleOpenSelector('matGM')}
                        className="w-18 bg-white border border-gray-300 rounded p-1.5 text-center shadow-sm hover:border-rose-500 cursor-pointer relative"
                        title="Avó Materna ♀"
                      >
                        <span className="absolute top-0.5 right-1 text-[9px] text-rose-500 font-bold">♀</span>
                        <PassarinhoIcon sex="FEMALE" className="w-5 h-5 mx-auto text-slate-700" />
                        <span className="text-[8px] font-bold block mt-0.5">Avó M.</span>
                        <span className="text-[7.5px] text-slate-500 truncate block font-mono">
                          {matGrandmother.name || 'INDEFINIDA'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* BOTTOM BAR / FOOTER (Matching Screenshot: [< Voltar] ........ [✔ Salvar])*/}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-[#f8fafc] border-t border-gray-200 px-4 py-3 flex items-center justify-between select-none">
          
          {/* Voltar Button */}
          {showBackButton ? (
            onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-1.5 border border-gray-300 bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-[#94a3b8] text-slate-700 font-semibold text-xs rounded shadow-sm flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Voltar</span>
              </button>
            ) : (
              <Link href="/dashboard/genealogia">
                <button
                  type="button"
                  className="px-4 py-1.5 border border-gray-300 bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-[#94a3b8] text-slate-700 font-semibold text-xs rounded shadow-sm flex items-center gap-1 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Voltar</span>
                </button>
              </Link>
            )
          ) : (
            <div />
          )}

          {/* Salvar Button (Cyan/Cerulean Blue matching screenshot) */}
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 bg-[#009fe3] hover:bg-[#008ac7] active:bg-[#007cb3] text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Salvar</span>
          </button>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SELECTION MODAL (POPUP WHEN CLICKING ON ANY NODE)                         */}
      {/* ========================================================================= */}
      {modalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  {modalTarget === 'main' && 'Selecionar Ave Principal'}
                  {modalTarget === 'father' && 'Selecionar Pai (Macho ♂)'}
                  {modalTarget === 'mother' && 'Selecionar Mãe (Fêmea ♀)'}
                  {modalTarget === 'patGF' && 'Selecionar Avô Paterno ♂'}
                  {modalTarget === 'patGM' && 'Selecionar Avó Paterna ♀'}
                  {modalTarget === 'matGF' && 'Selecionar Avô Materno ♂'}
                  {modalTarget === 'matGM' && 'Selecionar Avó Materna ♀'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Escolha uma ave cadastrada no criatório ou preencha manualmente
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, anilha ou espécie..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#009fe3]"
              />
            </div>

            {/* List of Birds in Plantel */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Aves no Plantel ({filteredBirds.length})
              </span>
              
              {filteredBirds.slice(0, 15).map(b => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBird(b)}
                  className="p-2.5 rounded-lg border border-gray-200 hover:border-[#009fe3] hover:bg-sky-50/40 transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 group-hover:bg-white transition-colors">
                      <PassarinhoIcon sex={b.sex} className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#009fe3] transition-colors block">
                        {b.name || 'Sem Nome'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
                        Anilha: {b.ringNumber || 'S/A'} • {b.species ? String(b.species).split('(')[0].trim() : 'Espécie não informada'}
                      </span>
                    </div>
                  </div>
                  <button type="button" className="text-[11px] font-bold text-[#009fe3] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    Vincular →
                  </button>
                </div>
              ))}

              {filteredBirds.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Nenhuma ave encontrada com esse termo de busca.
                </p>
              )}
            </div>

            {/* Manual Assignment Accordion / Section */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ou Digite Manualmente (Ancestral Externo)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="Nome do Pássaro"
                  className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#009fe3]"
                />
                <input
                  type="text"
                  value={manualRing}
                  onChange={e => setManualRing(e.target.value)}
                  placeholder="Anilha / Registro"
                  className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#009fe3]"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyManual}
                disabled={!manualName && !manualRing}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition cursor-pointer"
              >
                Aplicar Dados Manuais
              </button>
            </div>

            {/* Clear option */}
            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleClearNode}
                className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Limpar / Desvincular Este Pássaro
              </button>
              <button
                type="button"
                onClick={() => setModalTarget(null)}
                className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Impressão de Genealogia A4 */}
      {isPedigreeOpen && selectedFullBird && (
        <PrintPedigreeModal
          bird={selectedFullBird}
          isOpen={isPedigreeOpen}
          onClose={() => setIsPedigreeOpen(false)}
        />
      )}

      {/* Modal de Impressão de Etiqueta da Gaiola */}
      {isBadgeOpen && selectedFullBird && (
        <PrintBadgeModal
          bird={selectedFullBird}
          isOpen={isBadgeOpen}
          onClose={() => setIsBadgeOpen(false)}
        />
      )}

    </div>
  )
}
