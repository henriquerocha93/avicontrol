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

// Limite prático de gerações (cada geração dobra o número de cards na tela)
const MAX_LEVELS = 12

// Caminho a partir da ave principal: 'F' = pai, 'M' = mãe ('FM' = mãe do pai, ...)
function pathGender(path: string): 'MALE' | 'FEMALE' {
  return path.endsWith('F') ? 'MALE' : 'FEMALE'
}

function ancestorLabel(path: string): string {
  const male = path.endsWith('F')
  const level = path.length
  if (level === 1) return male ? 'Macho' : 'Fêmea'
  if (level === 2) return male ? 'Avô' : 'Avó'
  if (level === 3) return male ? 'Bisavô' : 'Bisavó'
  if (level === 4) return male ? 'Trisavô' : 'Trisavó'
  if (level === 5) return male ? 'Tataravô' : 'Tataravó'
  return `Ger. ${level} ${male ? '♂' : '♀'}`
}

// Ex.: 'FM' -> "Mãe do pai"
function ancestorDescription(path: string): string {
  const rev = path.split('').reverse()
  return rev
    .map((c, i) => {
      const base = c === 'F' ? 'pai' : 'mãe'
      if (i === 0) return c === 'F' ? 'Pai' : 'Mãe'
      return c === 'F' ? 'do pai' : 'da mãe'
    })
    .join(' ')
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

  // Quantidade de gerações de parentes exibidas (controlada pelos botões + e -)
  const [levels, setLevels] = useState<number>(1)

  // Nodes State
  const [mainBird, setMainBird] = useState<NodeData>({ name: '', ringNumber: '', sex: 'UNKNOWN' })
  // Ancestrais indexados por caminho ('F', 'M', 'FF', 'FM', 'MF', 'MM', 'FFF', ...)
  const [nodes, setNodes] = useState<Record<string, NodeData>>({})

  // Full Active Bird Object for actions / modals
  const [selectedFullBird, setSelectedFullBird] = useState<Bird | null>(null)
  const [isPedigreeOpen, setIsPedigreeOpen] = useState(false)
  const [isBadgeOpen, setIsBadgeOpen] = useState(false)

  // Ring Number Quick Search State
  const [ringSearchQuery, setRingSearchQuery] = useState('')
  const [showRingSuggestions, setShowRingSuggestions] = useState(false)
  const [ringNotFound, setRingNotFound] = useState<string | null>(null)

  // Selection Modal State
  const [modalTarget, setModalTarget] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [manualName, setManualName] = useState('')
  const [manualRing, setManualRing] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Open modal to select bird
  const handleOpenSelector = (target: string) => {
    setModalTarget(target)
    setSearchTerm('')
    setManualName('')
    setManualRing('')
  }

  const findBird = (id?: string, ring?: string, name?: string): Bird | undefined => {
    const r = (ring || '').toLowerCase().trim()
    const n = (name || '').toLowerCase().trim()
    return allBirds.find(b =>
      (id && b.id === id) ||
      (r && b.ringNumber && b.ringNumber.toLowerCase().trim() === r) ||
      (n && b.name && b.name.toLowerCase().trim() === n)
    )
  }

  // Resolve recursivamente os ancestrais de uma ave a partir do plantel
  const resolveAncestors = (
    bird: Bird,
    basePath: string,
    acc: Record<string, NodeData>,
    onlyEmpty: boolean,
    visited: Set<string>
  ) => {
    if (basePath.length >= MAX_LEVELS) return
    visited.add(bird.id)
    const parents: Array<['F' | 'M', string | undefined, string | undefined, string | undefined]> = [
      ['F', bird.fatherId, bird.fatherRing, bird.fatherName],
      ['M', bird.motherId, bird.motherRing, bird.motherName]
    ]
    for (const [letter, pid, pring, pname] of parents) {
      const path = basePath + letter
      const found = findBird(pid, pring, pname)
      const name = found?.name || pname || ''
      if (!name && !found) continue
      if (!onlyEmpty || !acc[path]?.name) {
        acc[path] = {
          id: found?.id,
          name,
          ringNumber: found?.ringNumber || pring || '',
          sex: pathGender(path)
        }
      }
      if (found && !visited.has(found.id)) {
        resolveAncestors(found, path, acc, onlyEmpty, new Set(visited))
      }
    }
  }

  const deepestLevel = (map: Record<string, NodeData>) =>
    Object.keys(map).reduce((m, k) => (map[k]?.name ? Math.max(m, k.length) : m), 0)

  // Handle bird selection from database with full recursive genealogy ancestry resolution
  const handleSelectBird = (bird: Bird, targetOverride?: string) => {
    if (!bird) return
    const target = targetOverride || modalTarget
    if (!target) return
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

      const acc: Record<string, NodeData> = {}
      resolveAncestors(bird, '', acc, false, new Set())

      // Campos legados de avós (guardam o nome)
      const legacy: Array<[string, string | undefined]> = [
        ['FF', bird.paternalGrandfatherId],
        ['FM', bird.paternalGrandmotherId],
        ['MF', bird.maternalGrandfatherId],
        ['MM', bird.maternalGrandmotherId]
      ]
      for (const [p, nm] of legacy) {
        if (nm && !acc[p]?.name) {
          const f = findBird(undefined, undefined, nm)
          acc[p] = { id: f?.id, name: f?.name || nm, ringNumber: f?.ringNumber || '', sex: pathGender(p) }
        }
      }

      // Árvore completa salva anteriormente
      if (bird.ancestry) {
        for (const [p, n] of Object.entries(bird.ancestry)) {
          if (n && n.name) acc[p] = { id: n.id, name: n.name, ringNumber: n.ringNumber || '', sex: pathGender(p) }
        }
      }

      setNodes(acc)
      setLevels(Math.max(1, deepestLevel(acc)))
    } else {
      const acc: Record<string, NodeData> = { ...nodes }
      acc[target] = { ...data, sex: pathGender(target) }
      // Preenche gerações mais antigas vazias com os ancestrais da ave escolhida
      resolveAncestors(bird, target, acc, true, new Set())
      setNodes(acc)
      setLevels(l => Math.max(l, deepestLevel(acc)))
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
    if (!modalTarget) return

    if (modalTarget === 'main') {
      setMainBird({ name: manualName || 'Sem Nome', ringNumber: manualRing || '', sex: 'UNKNOWN' })
    } else {
      const target = modalTarget
      setNodes(prev => ({
        ...prev,
        [target]: { name: manualName || 'Sem Nome', ringNumber: manualRing || '', sex: pathGender(target) }
      }))
    }

    setModalTarget(null)
  }

  // Clear specific node
  const handleClearNode = () => {
    if (modalTarget === 'main') {
      setMainBird({ name: '', ringNumber: '', sex: 'UNKNOWN' })
    } else if (modalTarget) {
      const target = modalTarget
      setNodes(prev => {
        const next = { ...prev }
        delete next[target]
        return next
      })
    }
    setModalTarget(null)
  }

  // Save genealogy relationship safely
  const handleSave = () => {
    try {
      if (mainBird && mainBird.id) {
        const ancestry: Record<string, { id?: string; name: string; ringNumber: string }> = {}
        for (const [p, n] of Object.entries(nodes)) {
          if (n && n.name) {
            ancestry[p] = { ...(n.id ? { id: n.id } : {}), name: n.name, ringNumber: n.ringNumber || '' }
          }
        }
        db.updateBird(mainBird.id, {
          fatherName: nodes.F?.name || undefined,
          fatherRing: nodes.F?.ringNumber || undefined,
          fatherId: nodes.F?.id || undefined,
          motherName: nodes.M?.name || undefined,
          motherRing: nodes.M?.ringNumber || undefined,
          motherId: nodes.M?.id || undefined,
          paternalGrandfatherId: nodes.FF?.name || undefined,
          paternalGrandmotherId: nodes.FM?.name || undefined,
          maternalGrandfatherId: nodes.MF?.name || undefined,
          maternalGrandmotherId: nodes.MM?.name || undefined,
          ancestry,
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

  // Botões + e -: adicionam / removem uma geração de parentes
  const handleAddLevel = () => setLevels(l => Math.min(l + 1, MAX_LEVELS))
  const handleRemoveLevel = () => setLevels(l => Math.max(1, l - 1))

  // Renderiza recursivamente um card e seus ancestrais
  const renderCard = (path: string) => {
    if (path === '') {
      return (
        <div
          onClick={() => handleOpenSelector('main')}
          className={`w-28 sm:w-32 bg-white border rounded-md p-2.5 text-center shadow-xs cursor-pointer hover:border-emerald-500 hover:shadow-sm transition-all group ${
            mainBird.name ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-300'
          }`}
          title="Clique para selecionar ou definir a ave"
        >
          <div className="flex items-center justify-center text-slate-800 group-hover:text-emerald-600 transition-colors">
            <PassarinhoIcon sex="UNKNOWN" className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 block mt-1">Ave</span>
          <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">
            {mainBird.name
              ? `${mainBird.name} ${mainBird.ringNumber ? `(${mainBird.ringNumber})` : ''}`
              : '....'}
          </span>
        </div>
      )
    }

    const node = nodes[path]
    const male = path.endsWith('F')
    const label = ancestorLabel(path)
    const full = node?.name ? `${node.name}${node.ringNumber ? ` (${node.ringNumber})` : ''}` : (male ? 'INDEFINIDO' : 'INDEFINIDA')

    if (path.length === 1) {
      return (
        <div
          onClick={() => handleOpenSelector(path)}
          className={`w-28 sm:w-32 bg-white border rounded-md p-2.5 text-center shadow-xs cursor-pointer hover:shadow-sm transition-all relative group ${
            male ? 'hover:border-sky-500' : 'hover:border-rose-500'
          } ${
            node?.name ? (male ? 'border-sky-500 bg-sky-50/20' : 'border-rose-500 bg-rose-50/20') : 'border-gray-300'
          }`}
          title={male ? 'Clique para definir o Pai (Macho)' : 'Clique para definir a Mãe (Fêmea)'}
        >
          <span className={`absolute top-1.5 right-2 text-xs font-bold text-slate-500 ${male ? 'group-hover:text-sky-600' : 'group-hover:text-rose-600'}`}>
            {male ? '♂' : '♀'}
          </span>
          <div className={`flex items-center justify-center text-slate-800 transition-colors ${male ? 'group-hover:text-sky-600' : 'group-hover:text-rose-600'}`}>
            <PassarinhoIcon sex={male ? 'MALE' : 'FEMALE'} className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 block mt-1">{label}</span>
          <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">{full}</span>
        </div>
      )
    }

    return (
      <div
        onClick={() => handleOpenSelector(path)}
        className={`w-20 bg-white border rounded p-1.5 text-center shadow-sm cursor-pointer relative ${
          male ? 'hover:border-sky-500' : 'hover:border-rose-500'
        } ${node?.name ? (male ? 'border-sky-400' : 'border-rose-400') : 'border-gray-300'}`}
        title={`${ancestorDescription(path)} ${male ? '♂' : '♀'}: ${full}`}
      >
        <span className={`absolute top-0.5 right-1 text-[9px] font-bold ${male ? 'text-sky-600' : 'text-rose-500'}`}>
          {male ? '♂' : '♀'}
        </span>
        <PassarinhoIcon sex={male ? 'MALE' : 'FEMALE'} className="w-5 h-5 mx-auto text-slate-700" />
        <span className="text-[8px] font-bold block mt-0.5 truncate">{label}</span>
        <span className="text-[7.5px] text-slate-500 truncate block font-mono">{node?.name || (male ? 'INDEFINIDO' : 'INDEFINIDA')}</span>
      </div>
    )
  }

  const renderBranch = (path: string): React.ReactNode => {
    const hasChildren = path.length < levels
    return (
      <div className="flex flex-col items-center">
        {renderCard(path)}
        {hasChildren && (
          <>
            <div className="w-[1.5px] h-6 bg-gray-300" />
            <div className="flex items-start">
              {(['F', 'M'] as const).map(letter => (
                <div key={letter} className="relative flex flex-col items-center pt-6 px-1">
                  <div className="absolute top-0 left-1/2 w-[1.5px] h-6 bg-gray-300" />
                  <div className={`absolute top-0 h-[1.5px] bg-gray-300 ${letter === 'F' ? 'left-1/2 right-0' : 'left-0 right-1/2'}`} />
                  {renderBranch(path + letter)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
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

          {/* Right Controls: [ + ] adiciona geração de parentes, [ - ] remove */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 tabular-nums">
              {levels} {levels === 1 ? 'geração' : 'gerações'}
            </span>
            <button
              type="button"
              onClick={handleAddLevel}
              disabled={levels >= MAX_LEVELS}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#94a3b8] hover:bg-[#64748b] active:bg-[#475569] disabled:opacity-40 text-white rounded flex items-center justify-center shadow-sm transition cursor-pointer"
              title="Adicionar mais uma geração de parentes"
              aria-label="Adicionar geração de parentes"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleRemoveLevel}
              disabled={levels <= 1}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#94a3b8] hover:bg-[#64748b] active:bg-[#475569] disabled:opacity-40 text-white rounded flex items-center justify-center shadow-sm transition cursor-pointer"
              title="Remover a última geração exibida"
              aria-label="Remover última geração"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* MAIN CANVAS / TREE DIAGRAM AREA                                         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white min-h-[460px] sm:min-h-[520px] p-6 sm:p-12 relative overflow-x-auto select-none">
          <div className="mx-auto w-max">
            {renderBranch('')}
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
                  {modalTarget === 'main'
                    ? 'Selecionar Ave Principal'
                    : `Selecionar ${ancestorDescription(modalTarget)} ${modalTarget.endsWith('F') ? '♂' : '♀'}`}
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
