'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Bird as BirdIcon
} from 'lucide-react'
import { db } from '@/lib/db'
import { firebaseSync } from '@/lib/firebase-service'
import { Bird } from '@/types'
import { PrintPedigreeModal } from '@/components/modals/print-pedigree-modal'
import { PrintBadgeModal } from '@/components/modals/print-badge-modal'
import { resolvePedigreeTree, inheritFullAncestryFromCouple } from '@/lib/pedigree'

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
    const loadBirds = () => {
      try {
        let list = db.getBirds()
        if (!list || list.length === 0) {
          list = db.getAllBirds()
        }
        if (Array.isArray(list)) {
          setAllBirds(list)
        }
      } catch (e) {
        console.warn('Erro ao carregar aves para genealogia:', e)
      }
    }
    loadBirds()
    if (typeof window !== 'undefined') {
      window.addEventListener('birdpro_db_updated', loadBirds)
      return () => window.removeEventListener('birdpro_db_updated', loadBirds)
    }
  }, [])

  // Quantidade de gerações de parentes exibidas (controlada pelos botões + e -)
  const [levels, setLevels] = useState<number>(1)

  // Auto-fit / Enquadramento automático para caber 100% na tela sem rolagem
  const containerRef = useRef<HTMLDivElement>(null)
  const treeRef = useRef<HTMLDivElement>(null)
  const [autoFit, setAutoFit] = useState<boolean>(true)
  const [scale, setScale] = useState<number>(1)
  const [treeDimensions, setTreeDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  // Estados da Ferramenta de Lupa e Zoom no Ponto Clicado
  const [isMagnifierActive, setIsMagnifierActive] = useState<boolean>(false)
  const [hoveredNode, setHoveredNode] = useState<{
    path: string
    name: string
    ringNumber: string
    sex: 'MALE' | 'FEMALE' | 'UNKNOWN'
    label: string
    description: string
    x: number
    y: number
  } | null>(null)

  // Drag-to-Pan (Arrastar tela quando com zoom)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

  const updateScale = useCallback(() => {
    if (!containerRef.current || !treeRef.current) return
    const containerWidth = containerRef.current.clientWidth - 24 // margem de respiro
    const treeWidth = treeRef.current.scrollWidth
    const treeHeight = treeRef.current.scrollHeight

    setTreeDimensions({ width: treeWidth, height: treeHeight })

    if (autoFit && treeWidth > 0 && containerWidth > 0) {
      if (treeWidth > containerWidth) {
        const calculatedScale = Math.max(0.18, containerWidth / treeWidth)
        setScale(Number(calculatedScale.toFixed(3)))
      } else {
        setScale(1)
      }
    } else if (!autoFit) {
      setScale(1)
    }
  }, [autoFit])

  // Função central: Dá zoom exatamente no ponto clicado e centraliza a visualização
  const zoomAtPoint = useCallback((targetTreeX: number, targetTreeY: number, customScale?: number) => {
    setAutoFit(false)
    const nextScale = customScale || (scale < 0.5 ? 1.0 : Math.min(2.5, Number((scale * 1.8).toFixed(2))))
    setScale(nextScale)

    setTimeout(() => {
      if (containerRef.current) {
        const cWidth = containerRef.current.clientWidth
        const cHeight = containerRef.current.clientHeight
        const scrollLeft = targetTreeX * nextScale - cWidth / 2
        const scrollTop = targetTreeY * nextScale - cHeight / 2
        containerRef.current.scrollTo({
          left: Math.max(0, scrollLeft),
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        })
      }
    }, 60)
  }, [scale])

  const handleZoomIn = () => {
    setAutoFit(false)
    setScale(s => Math.min(2.5, Number((s + 0.25).toFixed(2))))
  }

  const handleZoomOut = () => {
    setAutoFit(false)
    setScale(s => Math.max(0.18, Number((s - 0.25).toFixed(2))))
  }

  const handleResetFit = () => {
    setAutoFit(true)
    setIsMagnifierActive(false)
    updateScale()
  }

  const handleToggleMagnifier = () => {
    setIsMagnifierActive(prev => !prev)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if (containerRef.current && (!autoFit || scale > 0.4)) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    containerRef.current.scrollLeft = dragStart.scrollLeft - dx
    containerRef.current.scrollTop = dragStart.scrollTop - dy
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Recalcula a escala automaticamente ao mudar níveis, redimensionar tela ou alterar nós
  useEffect(() => {
    updateScale()
    const t1 = setTimeout(updateScale, 40)
    const t2 = setTimeout(updateScale, 180)

    const handleResize = () => updateScale()
    window.addEventListener('resize', handleResize)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => updateScale())
      ro.observe(containerRef.current)
    }

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', handleResize)
      if (ro) ro.disconnect()
    }
  }, [levels, autoFit, updateScale])

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

  // Couple Selection Modal (Criar filhote herdando pai e mãe)
  const [isCoupleModalOpen, setIsCoupleModalOpen] = useState(false)
  const [coupleFatherId, setCoupleFatherId] = useState('')
  const [coupleMotherId, setCoupleMotherId] = useState('')
  const [filhoteName, setFilhoteName] = useState('')
  const [filhoteRing, setFilhoteRing] = useState('')
  const [filhoteSex, setFilhoteSex] = useState<'MALE' | 'FEMALE' | 'UNKNOWN'>('UNKNOWN')
  const [coupleSuccessMsg, setCoupleSuccessMsg] = useState<string | null>(null)

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

  // Resolve recursivamente os ancestrais de uma ave a partir do plantel herdando árvores completas
  const resolveAncestors = (
    bird: Bird,
    basePath: string,
    acc: Record<string, NodeData>,
    onlyEmpty: boolean,
    visited: Set<string>
  ) => {
    if (basePath.length >= MAX_LEVELS) return
    visited.add(bird.id)

    // 0. Resolve árvore profunda usando o motor centralizado (avós, bisavós, trisavós e tataravós)
    try {
      const resolvedTree = resolvePedigreeTree(bird, allBirds)
      if (resolvedTree && resolvedTree.nodesByPath) {
        for (const [subPath, node] of Object.entries(resolvedTree.nodesByPath)) {
          const fullPath = basePath + subPath
          if (fullPath.length <= MAX_LEVELS && node && node.isRegistered && node.name && node.name !== 'INDEFINIDO' && node.name !== 'INDEFINIDA') {
            if (!onlyEmpty || !acc[fullPath]?.name) {
              acc[fullPath] = {
                id: node.id.startsWith('empty-') || node.id.startsWith('gen') || node.id.startsWith('anc-') ? undefined : node.id,
                name: node.name,
                ringNumber: node.ringNumber && node.ringNumber !== '—' ? node.ringNumber : '',
                sex: pathGender(fullPath)
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao resolver pedigree:', e)
    }

    // 1. Herda diretamente o mapa de linhagem salvo (bird.ancestry) com prefixo do caminho
    if (bird.ancestry) {
      for (const [subPath, n] of Object.entries(bird.ancestry)) {
        const fullPath = basePath + subPath
        if (fullPath.length <= MAX_LEVELS && n && n.name && n.name !== 'INDEFINIDO' && n.name !== 'INDEFINIDA') {
          if (!onlyEmpty || !acc[fullPath]?.name) {
            acc[fullPath] = {
              id: n.id,
              name: n.name,
              ringNumber: n.ringNumber || '',
              sex: pathGender(fullPath)
            }
          }
        }
      }
    }

    // 2. Herda campos legados de avós
    const legacy: Array<[string, string | undefined]> = [
      ['FF', bird.paternalGrandfatherId],
      ['FM', bird.paternalGrandmotherId],
      ['MF', bird.maternalGrandfatherId],
      ['MM', bird.maternalGrandmotherId]
    ]
    for (const [p, nm] of legacy) {
      const fullPath = basePath + p
      if (fullPath.length <= MAX_LEVELS && nm && nm !== 'INDEFINIDO' && nm !== 'INDEFINIDA' && (!onlyEmpty || !acc[fullPath]?.name)) {
        const f = findBird(undefined, undefined, nm)
        acc[fullPath] = { id: f?.id, name: f?.name || nm, ringNumber: f?.ringNumber || '', sex: pathGender(fullPath) }
      }
    }

    // 3. Continua recursão para pais no plantel
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
      // Herda automaticamente toda a linhagem ancestral do pássaro selecionado
      resolveAncestors(bird, target, acc, false, new Set())
      setNodes(acc)
      setLevels(l => Math.max(l, deepestLevel(acc)))
      
      setCoupleSuccessMsg(`Linhagem de ${bird.name} herdada com sucesso para o nó ${ancestorLabel(target)}!`)
      setTimeout(() => setCoupleSuccessMsg(null), 4000)
    }

    setModalTarget(null)
  }

  // Gera árvore de filhote a partir de um casal do plantel
  const handleApplyCouple = () => {
    if (!coupleFatherId && !coupleMotherId) return

    const fatherBird = allBirds.find(b => b.id === coupleFatherId)
    const motherBird = allBirds.find(b => b.id === coupleMotherId)

    const childName = filhoteName.trim() || `Filhote (${fatherBird?.name?.split(' ')[0] || 'Pai'} x ${motherBird?.name?.split(' ')[0] || 'Mãe'})`
    const childData: NodeData = {
      name: childName,
      ringNumber: filhoteRing.trim() || '',
      sex: filhoteSex
    }

    setMainBird(childData)
    setSelectedFullBird(null) // Novo filhote a ser salvo no plantel

    const acc: Record<string, NodeData> = {}

    // 1. Puxa árvore ancestral completa do Pai para 'F', 'FF', 'FM', 'FFF', etc.
    if (fatherBird) {
      acc['F'] = {
        id: fatherBird.id,
        name: fatherBird.name,
        ringNumber: fatherBird.ringNumber || '',
        sex: 'MALE'
      }
      resolveAncestors(fatherBird, 'F', acc, false, new Set())
    }

    // 2. Puxa árvore ancestral completa da Mãe para 'M', 'MF', 'MM', 'MFF', etc.
    if (motherBird) {
      acc['M'] = {
        id: motherBird.id,
        name: motherBird.name,
        ringNumber: motherBird.ringNumber || '',
        sex: 'FEMALE'
      }
      resolveAncestors(motherBird, 'M', acc, false, new Set())
    }

    // 3. Herança profunda direta via inheritFullAncestryFromCouple (garante todas as 5 gerações)
    const fullAncestry = inheritFullAncestryFromCouple(fatherBird, motherBird, allBirds)
    for (const [p, n] of Object.entries(fullAncestry)) {
      if (p.length <= MAX_LEVELS && n && n.name && n.name !== 'INDEFINIDO' && n.name !== 'INDEFINIDA') {
        if (!acc[p]?.name) {
          acc[p] = {
            id: n.id,
            name: n.name,
            ringNumber: n.ringNumber || '',
            sex: pathGender(p)
          }
        }
      }
    }

    setNodes(acc)
    const maxGen = Math.max(1, deepestLevel(acc))
    setLevels(maxGen)
    setIsCoupleModalOpen(false)

    setCoupleSuccessMsg(
      `Árvore do filhote "${childName}" gerada com sucesso! ${maxGen} gerações herdadas do casal (${fatherBird?.name || 'Pai'} & ${motherBird?.name || 'Mãe'}). Clique em "Salvar Genealogia" para gravar no plantel.`
    )
    setTimeout(() => setCoupleSuccessMsg(null), 8000)
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
      const ancestry: Record<string, { id?: string; name: string; ringNumber: string }> = {}
      for (const [p, n] of Object.entries(nodes)) {
        if (n && n.name && n.name !== 'INDEFINIDO' && n.name !== 'INDEFINIDA') {
          ancestry[p] = { ...(n.id ? { id: n.id } : {}), name: n.name, ringNumber: n.ringNumber || '' }
        }
      }

      let currentBirdId = mainBird?.id
      const tenant = db.getTenant()
      const tenantId = tenant?.id || 'demo-tenant'

      if (!currentBirdId) {
        // Ave não existia no banco: cria ave oficial no plantel com toda a genealogia
        const newBird = db.addBird({
          tenantId,
          name: mainBird?.name && mainBird.name !== 'Ave' ? mainBird.name : `Ave Genealógica (${nodes.F?.name || 'Linhagem'})`,
          ringNumber: mainBird?.ringNumber || `ANILHA-${Date.now().toString().slice(-4)}`,
          species: 'Canário-da-terra (Sicalis flaveola)',
          sex: mainBird?.sex === 'FEMALE' ? 'FEMALE' : 'MALE',
          status: 'ACTIVE',
          origin: 'BRED_HERE',
          birthDate: new Date().toISOString().split('T')[0],
          entryDate: new Date().toISOString().split('T')[0],
          isPublic: true,
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
        currentBirdId = newBird.id
        setMainBird({
          id: newBird.id,
          name: newBird.name,
          ringNumber: newBird.ringNumber,
          sex: newBird.sex as any
        })
        setSelectedFullBird(newBird)
      } else {
        // Ave já existia: atualiza com todos os novos parentescos e genealogia
        db.updateBird(currentBirdId, {
          name: mainBird?.name && mainBird.name !== 'Ave' ? mainBird.name : undefined,
          ringNumber: mainBird?.ringNumber || undefined,
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
        const updated = db.getBirdById(currentBirdId)
        if (updated) setSelectedFullBird(updated)
        setAllBirds(db.getBirds())
      }

      // Sincroniza na nuvem
      if (currentBirdId && firebaseSync.isAvailable()) {
        const full = db.getBirdById(currentBirdId)
        if (full) {
          firebaseSync.saveDocument('birds', currentBirdId, full).catch(() => {})
        }
      }

      // Notifica todos os componentes para atualizar listas e árvore
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('birdpro_db_updated'))
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

  const handleCardClick = (e: React.MouseEvent, path: string) => {
    if (isMagnifierActive) {
      e.stopPropagation()
      const target = e.currentTarget as HTMLElement
      if (treeRef.current) {
        const treeRect = treeRef.current.getBoundingClientRect()
        const cardRect = target.getBoundingClientRect()
        const cardCenterX = (cardRect.left + cardRect.width / 2 - treeRect.left) / scale
        const cardCenterY = (cardRect.top + cardRect.height / 2 - treeRect.top) / scale
        zoomAtPoint(cardCenterX, cardCenterY, scale < 0.5 ? 1.0 : Math.min(2.5, scale * 1.8))
      }
      return
    }
    handleOpenSelector(path)
  }

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    if (treeRef.current) {
      const treeRect = treeRef.current.getBoundingClientRect()
      const cardRect = target.getBoundingClientRect()
      const cardCenterX = (cardRect.left + cardRect.width / 2 - treeRect.left) / scale
      const cardCenterY = (cardRect.top + cardRect.height / 2 - treeRect.top) / scale
      zoomAtPoint(cardCenterX, cardCenterY, scale < 0.5 ? 1.0 : Math.min(2.5, scale * 1.8))
    }
  }

  const handleCardHover = (e: React.MouseEvent, path: string) => {
    const node = path === '' ? mainBird : nodes[path]
    const male = path === '' ? mainBird.sex === 'MALE' : path.endsWith('F')
    const label = path === '' ? 'Ave Principal' : ancestorLabel(path)
    const desc = path === '' ? 'Ave em Destaque' : ancestorDescription(path)
    setHoveredNode({
      path,
      name: node?.name || (male ? 'INDEFINIDO' : 'INDEFINIDA'),
      ringNumber: node?.ringNumber || '',
      sex: node?.sex || (male ? 'MALE' : 'FEMALE'),
      label,
      description: desc,
      x: e.clientX,
      y: e.clientY
    })
  }

  // Renderiza recursivamente um card e seus ancestrais com dimensionamento adaptativo
  const renderCard = (path: string) => {
    const isHighGen = levels >= 4
    const isMedGen = levels === 3
    const cardCursor = isMagnifierActive ? 'cursor-zoom-in' : 'cursor-pointer'

    if (path === '') {
      const cardWidth = isHighGen ? 'w-24 sm:w-28 p-2' : isMedGen ? 'w-26 sm:w-30 p-2' : 'w-28 sm:w-32 p-2.5'
      return (
        <div
          onClick={(e) => handleCardClick(e, 'main')}
          onDoubleClick={handleCardDoubleClick}
          onMouseEnter={(e) => handleCardHover(e, '')}
          onMouseLeave={() => setHoveredNode(null)}
          className={`${cardWidth} bg-white border rounded-md text-center shadow-xs ${cardCursor} hover:border-emerald-500 hover:shadow-sm transition-all group ${
            mainBird.name ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-300'
          }`}
          title={isMagnifierActive ? 'Clique para dar Zoom na Ave' : 'Clique para selecionar ou definir a ave'}
        >
          <div className="flex items-center justify-center text-slate-800 group-hover:text-emerald-600 transition-colors">
            <PassarinhoIcon sex="UNKNOWN" className={isHighGen ? 'w-6 h-6' : 'w-8 h-8'} />
          </div>
          <span className="text-[11px] font-bold text-slate-800 block mt-0.5">Ave</span>
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
      const cardWidth = isHighGen ? 'w-24 sm:w-28 p-2' : isMedGen ? 'w-26 sm:w-30 p-2' : 'w-28 sm:w-32 p-2.5'
      return (
        <div
          onClick={(e) => handleCardClick(e, path)}
          onDoubleClick={handleCardDoubleClick}
          onMouseEnter={(e) => handleCardHover(e, path)}
          onMouseLeave={() => setHoveredNode(null)}
          className={`${cardWidth} bg-white border rounded-md text-center shadow-xs ${cardCursor} hover:shadow-sm transition-all relative group ${
            male ? 'hover:border-sky-500' : 'hover:border-rose-500'
          } ${
            node?.name ? (male ? 'border-sky-500 bg-sky-50/20' : 'border-rose-500 bg-rose-50/20') : 'border-gray-300'
          }`}
          title={isMagnifierActive ? `Clique para dar Zoom em ${label}` : (male ? 'Clique para definir o Pai (Macho)' : 'Clique para definir a Mãe (Fêmea)')}
        >
          <span className={`absolute top-1 right-1.5 text-xs font-bold text-slate-500 ${male ? 'group-hover:text-sky-600' : 'group-hover:text-rose-600'}`}>
            {male ? '♂' : '♀'}
          </span>
          <div className={`flex items-center justify-center text-slate-800 transition-colors ${male ? 'group-hover:text-sky-600' : 'group-hover:text-rose-600'}`}>
            <PassarinhoIcon sex={male ? 'MALE' : 'FEMALE'} className={isHighGen ? 'w-6 h-6' : 'w-8 h-8'} />
          </div>
          <span className="text-[11px] font-bold text-slate-800 block mt-0.5">{label}</span>
          <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">{full}</span>
        </div>
      )
    }

    // Nível 2 (Avós)
    if (path.length === 2) {
      const cardWidth = isHighGen ? 'w-18 sm:w-20 p-1 sm:p-1.5' : isMedGen ? 'w-20 p-1.5' : 'w-22 p-2'
      return (
        <div
          onClick={(e) => handleCardClick(e, path)}
          onDoubleClick={handleCardDoubleClick}
          onMouseEnter={(e) => handleCardHover(e, path)}
          onMouseLeave={() => setHoveredNode(null)}
          className={`${cardWidth} bg-white border rounded text-center shadow-xs ${cardCursor} hover:shadow-sm transition-all relative ${
            male ? 'hover:border-sky-500' : 'hover:border-rose-500'
          } ${node?.name ? (male ? 'border-sky-400 bg-sky-50/15' : 'border-rose-400 bg-rose-50/15') : 'border-gray-300'}`}
          title={isMagnifierActive ? `Clique para dar Zoom em ${label}` : `${ancestorDescription(path)} ${male ? '♂' : '♀'}: ${full}`}
        >
          <span className={`absolute top-0.5 right-1 text-[9px] font-bold ${male ? 'text-sky-600' : 'text-rose-500'}`}>
            {male ? '♂' : '♀'}
          </span>
          <PassarinhoIcon sex={male ? 'MALE' : 'FEMALE'} className="w-5 h-5 mx-auto text-slate-700" />
          <span className="text-[8.5px] font-bold block mt-0.5 truncate">{label}</span>
          <span className="text-[7.5px] text-slate-500 truncate block font-mono">{node?.name || (male ? 'INDEFINIDO' : 'INDEFINIDA')}</span>
        </div>
      )
    }

    // Nível 3+ (Bisavós, Trisavós, ...)
    const isVeryDeep = path.length >= 4
    const cardWidth = isVeryDeep ? 'w-13 sm:w-15 p-1' : 'w-16 sm:w-18 p-1.5'
    return (
      <div
        onClick={(e) => handleCardClick(e, path)}
        onDoubleClick={handleCardDoubleClick}
        onMouseEnter={(e) => handleCardHover(e, path)}
        onMouseLeave={() => setHoveredNode(null)}
        className={`${cardWidth} bg-white border rounded text-center shadow-2xs ${cardCursor} hover:shadow-sm transition-all relative ${
          male ? 'hover:border-sky-500' : 'hover:border-rose-500'
        } ${node?.name ? (male ? 'border-sky-400 bg-sky-50/15' : 'border-rose-400 bg-rose-50/15') : 'border-gray-300'}`}
        title={isMagnifierActive ? `Clique para dar Zoom em ${label}` : `${ancestorDescription(path)} ${male ? '♂' : '♀'}: ${full}`}
      >
        <span className={`absolute top-0.5 right-0.5 text-[8px] font-bold ${male ? 'text-sky-600' : 'text-rose-500'}`}>
          {male ? '♂' : '♀'}
        </span>
        <PassarinhoIcon sex={male ? 'MALE' : 'FEMALE'} className={`${isVeryDeep ? 'w-3.5 h-3.5' : 'w-4 h-4'} mx-auto text-slate-700`} />
        <span className={`${isVeryDeep ? 'text-[7px]' : 'text-[7.5px]'} font-bold block mt-0.5 truncate`}>{label}</span>
        <span className={`${isVeryDeep ? 'text-[6.5px]' : 'text-[7px]'} text-slate-500 truncate block font-mono`}>{node?.name || (male ? 'INDEF.' : 'INDEF.')}</span>
      </div>
    )
  }

  const renderBranch = (path: string): React.ReactNode => {
    const hasChildren = path.length < levels
    const depth = path.length
    const isDeepTree = levels >= 4
    const verticalLineHeight = isDeepTree ? 'h-4' : levels === 3 ? 'h-5' : 'h-6'
    const verticalPadding = isDeepTree ? 'pt-4' : levels === 3 ? 'pt-5' : 'pt-6'
    const branchPadding = isDeepTree ? 'px-0.5' : levels === 3 ? 'px-0.5 sm:px-1' : 'px-1 sm:px-1.5'

    return (
      <div className="flex flex-col items-center">
        {renderCard(path)}
        {hasChildren && (
          <>
            <div className={`w-[1.5px] ${verticalLineHeight} bg-gray-300`} />
            <div className="flex items-start">
              {(['F', 'M'] as const).map(letter => (
                <div key={letter} className={`relative flex flex-col items-center ${verticalPadding} ${branchPadding}`}>
                  <div className={`absolute top-0 left-1/2 w-[1.5px] ${verticalLineHeight} bg-gray-300`} />
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

          {/* Couple Inheritance Button */}
          <button
            type="button"
            onClick={() => setIsCoupleModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Selecione um pai e mãe do plantel para herdar automaticamente as árvores ancestrais de ambos para um filhote"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Puxar de Casal do Plantel</span>
          </button>
        </div>

        {/* Couple Success Feedback Alert */}
        {coupleSuccessMsg && (
          <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{coupleSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setCoupleSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
        <div className="bg-[#f8fafc] border-b border-gray-200 px-3 sm:px-4 py-2 flex items-center justify-between select-none gap-2 flex-wrap">
          
          {/* Left Title with Edit Icon */}
          <div className="flex items-center gap-2 text-slate-800">
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-800">
              Genealogia
            </span>
            {scale < 0.99 && autoFit && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Enquadrado {Math.round(scale * 100)}%
              </span>
            )}
            {!autoFit && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Zoom {Math.round(scale * 100)}%
              </span>
            )}
          </div>

          {/* Right Controls: Lupa + Zoom + Auto-Fit + Gerações */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Botão de LUPA (Onde clica ele dá zoom focado no ponto) */}
            <button
              type="button"
              onClick={handleToggleMagnifier}
              className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1.5 border transition cursor-pointer shadow-2xs ${
                isMagnifierActive 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-400' 
                  : 'bg-white border-gray-300 text-slate-700 hover:bg-gray-50'
              }`}
              title={isMagnifierActive ? 'Modo Lupa Ativo: clique em qualquer ponto da árvore para dar zoom' : 'Ativar Lupa (clique onde quiser dar zoom)'}
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isMagnifierActive ? 'Lupa Ativa 🔍' : 'Lupa'}</span>
            </button>

            {/* Controles Rápidos de Zoom In / Zoom Out */}
            <div className="flex items-center bg-white border border-gray-200 rounded p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 2.5}
                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-gray-100 disabled:opacity-30 rounded transition cursor-pointer"
                title="Aumentar Zoom (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.18}
                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-gray-100 disabled:opacity-30 rounded transition cursor-pointer"
                title="Diminuir Zoom (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle de Enquadramento Inteligente na Tela */}
            <button
              type="button"
              onClick={autoFit ? () => setAutoFit(false) : handleResetFit}
              className={`px-2 py-1 text-xs font-semibold rounded flex items-center gap-1.5 border transition cursor-pointer ${
                autoFit 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' 
                  : 'bg-white border-gray-300 text-slate-600 hover:bg-gray-50'
              }`}
              title={autoFit ? 'Desativar enquadramento (ver em tamanho real com rolagem)' : 'Enquadrar tudo na tela sem precisar rolar'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {autoFit ? 'Enquadrado' : 'Ajustar tela'}
              </span>
            </button>

            <div className="h-4 w-[1px] bg-gray-300 hidden sm:block" />

            {/* Quantidade de gerações e botões + / - */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-600 mr-1 tabular-nums whitespace-nowrap">
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

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* MAIN CANVAS / TREE DIAGRAM AREA COM SUPORTE A LUPA, ZOOM E ARRASTAR      */}
        {/* ----------------------------------------------------------------------- */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: isMagnifierActive 
              ? 'zoom-in' 
              : isDragging 
              ? 'grabbing' 
              : (!autoFit || scale > 0.4) 
              ? 'grab' 
              : 'default'
          }}
          className={`bg-white min-h-[460px] sm:min-h-[520px] p-3 sm:p-8 relative select-none flex flex-col items-center justify-start ${
            autoFit ? 'overflow-hidden' : 'overflow-auto'
          }`}
        >
          {/* Mensagem Flutuante Discreta Quando Modo Lupa Está Ativo */}
          {isMagnifierActive && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-emerald-700/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-emerald-400 backdrop-blur-xs flex items-center gap-1.5 animate-fadeIn">
              <Search className="w-3.5 h-3.5 text-emerald-200" />
              <span>Modo Lupa Ativo: Clique em qualquer ponto da árvore para aproximar</span>
            </div>
          )}

          {/* Painel Flutuante de Zoom & Lupa no Canto Inferior Direito do Canvas */}
          <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg shadow-md p-1">
            <button
              type="button"
              onClick={handleToggleMagnifier}
              className={`p-1.5 rounded transition cursor-pointer ${
                isMagnifierActive ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-gray-100'
              }`}
              title="Lupa: clique na árvore para dar zoom no ponto desejado"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 2.5}
              className="p-1.5 text-slate-600 hover:bg-gray-100 disabled:opacity-30 rounded transition cursor-pointer"
              title="Aumentar Zoom (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.18}
              className="p-1.5 text-slate-600 hover:bg-gray-100 disabled:opacity-30 rounded transition cursor-pointer"
              title="Diminuir Zoom (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetFit}
              className="p-1.5 text-slate-600 hover:bg-gray-100 rounded transition cursor-pointer"
              title="Enquadrar árvore inteira na tela"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-600 px-1 tabular-nums border-l border-gray-200">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Mini Lente de Aumento Flutuante (Card Ampliado ao Passar o Mouse quando em Escala Reduzida) */}
          {hoveredNode && scale < 0.6 && (
            <div 
              className="fixed pointer-events-none z-50 bg-slate-900/95 text-white p-3 rounded-xl shadow-2xl border border-emerald-500/50 backdrop-blur-xs max-w-xs transition-all duration-75"
              style={{
                left: `${Math.min(typeof window !== 'undefined' ? window.innerWidth - 240 : 500, hoveredNode.x + 16)}px`,
                top: `${Math.min(typeof window !== 'undefined' ? window.innerHeight - 160 : 300, hoveredNode.y + 16)}px`,
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <PassarinhoIcon sex={hoveredNode.sex} className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase text-emerald-400">
                      {hoveredNode.label}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {hoveredNode.sex === 'MALE' ? '♂ Macho' : hoveredNode.sex === 'FEMALE' ? '♀ Fêmea' : 'Indefinido'}
                    </span>
                  </div>
                  <p className="text-xs font-black text-white truncate">{hoveredNode.name}</p>
                </div>
              </div>
              {hoveredNode.ringNumber && (
                <p className="text-[10px] font-mono text-emerald-300 mt-1 bg-black/40 px-1.5 py-0.5 rounded">
                  Anilha: {hoveredNode.ringNumber}
                </p>
              )}
              <p className="text-[9px] text-slate-400 mt-1 italic flex items-center gap-1">
                <Search className="w-2.5 h-2.5 text-emerald-400" />
                Clique para dar zoom neste ponto
              </p>
            </div>
          )}

          <div
            style={{
              width: scale < 1 && treeDimensions.width > 0 ? `${Math.ceil(treeDimensions.width * scale)}px` : 'auto',
              height: scale < 1 && treeDimensions.height > 0 ? `${Math.ceil(treeDimensions.height * scale)}px` : 'auto',
              minHeight: '360px',
              transition: isDragging ? 'none' : 'width 0.15s ease-out, height 0.15s ease-out',
            }}
            className="flex items-start justify-center relative mx-auto"
          >
            <div
              ref={treeRef}
              style={{
                transform: scale < 1 || !autoFit ? `scale(${scale})` : undefined,
                transformOrigin: 'top center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              className="w-max mx-auto shrink-0"
            >
              {renderBranch('')}
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

      {/* Modal: Puxar Árvore de Casal do Plantel */}
      {isCoupleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  🐣
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Puxar Genealogia de Casal do Plantel
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Selecione o pai e a mãe cadastrados para herdar automaticamente todas as gerações da árvore deles para o novo filhote.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCoupleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Seleção do Pai */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">♂ Pai (Macho):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Herdará toda a linhagem paterna (avós, bisavós, trisavós...)</span>
                </label>
                <select
                  value={coupleFatherId}
                  onChange={(e) => setCoupleFatherId(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
                >
                  <option value="">-- Selecione o Pai do Plantel --</option>
                  {allBirds
                    .filter(b => b.sex !== 'FEMALE')
                    .map(b => {
                      const hasAncestry = !!(b.ancestry && Object.keys(b.ancestry).length > 0) || !!(b.fatherName || b.motherName)
                      return (
                        <option key={b.id} value={b.id}>
                          ♂ {b.name || 'Sem Nome'} {b.ringNumber ? `(${b.ringNumber})` : ''} {hasAncestry ? '★ (com árvore)' : ''}
                        </option>
                      )
                    })}
                </select>
              </div>

              {/* Seleção da Mãe */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <span className="text-rose-600 font-bold">♀ Mãe (Fêmea):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Herdará toda a linhagem materna (avós, bisavós, trisavós...)</span>
                </label>
                <select
                  value={coupleMotherId}
                  onChange={(e) => setCoupleMotherId(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
                >
                  <option value="">-- Selecione a Mãe do Plantel --</option>
                  {allBirds
                    .filter(b => b.sex !== 'MALE')
                    .map(b => {
                      const hasAncestry = !!(b.ancestry && Object.keys(b.ancestry).length > 0) || !!(b.fatherName || b.motherName)
                      return (
                        <option key={b.id} value={b.id}>
                          ♀ {b.name || 'Sem Nome'} {b.ringNumber ? `(${b.ringNumber})` : ''} {hasAncestry ? '★ (com árvore)' : ''}
                        </option>
                      )
                    })}
                </select>
              </div>

              {/* Dados do Filhote */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Dados do Novo Filhote (Opcional ou preencha agora)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Nome do Filhote</label>
                    <input
                      type="text"
                      value={filhoteName}
                      onChange={e => setFilhoteName(e.target.value)}
                      placeholder="Ex: Trovão Jr, Princesa..."
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Anilha do Filhote</label>
                    <input
                      type="text"
                      value={filhoteRing}
                      onChange={e => setFilhoteRing(e.target.value)}
                      placeholder="Ex: 2026-001..."
                      className="w-full text-xs p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Sexo do Filhote</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFilhoteSex('MALE')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        filhoteSex === 'MALE'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-gray-300 hover:bg-slate-50'
                      }`}
                    >
                      ♂ Macho
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilhoteSex('FEMALE')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        filhoteSex === 'FEMALE'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-gray-300 hover:bg-slate-50'
                      }`}
                    >
                      ♀ Fêmea
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilhoteSex('UNKNOWN')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        filhoteSex === 'UNKNOWN'
                          ? 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-700 border-gray-300 hover:bg-slate-50'
                      }`}
                    >
                      ? A Definir
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCoupleModalOpen(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyCouple}
                disabled={!coupleFatherId && !coupleMotherId}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Puxar Árvores e Gerar Genealogia</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
