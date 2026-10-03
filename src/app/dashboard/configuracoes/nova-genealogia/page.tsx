'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Edit3, 
  Plus, 
  Minus, 
  ChevronLeft, 
  Check, 
  Search, 
  X, 
  CheckCircle2, 
  Info
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/db'
import { Bird } from '@/types'

// Authentic perched bird on a branch matching the user's screenshot
function PerchedBirdIcon({ className = "w-7 h-7 text-slate-800" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 36 36" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Branch */}
      <path d="M4 27 C12 26 22 27 32 25" />
      <path d="M24 26 Q27 23 30 23" />
      {/* Feet */}
      <path d="M15 23 L15 26.5" />
      <path d="M19 23 L19 26.5" />
      {/* Tail feathers */}
      <path d="M11 22 L5 28 L9 24.5 L6 26.5 L11 21" />
      {/* Body & head outline */}
      <path d="M12 21 C10 17 12 11.5 17 9 C19.5 7.5 23.5 7.5 26 9.5 C28 11.5 28.5 14.5 27.5 17.5 C26.5 20.5 24 23 19 23.5 C15.5 23.5 13 23 12 21 Z" />
      {/* Eye */}
      <circle cx="23.5" cy="11.5" r="0.9" fill="currentColor" />
      {/* Beak */}
      <path d="M27.5 11.5 L31.5 13 L27.5 14" />
      {/* Wing arc */}
      <path d="M16 17 C18.5 15.5 22 16.5 21 20.5" />
    </svg>
  )
}

interface NodeData {
  id?: string
  name: string
  ringNumber: string
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN'
}

export interface NovaGenealogiaProps {
  initialBirdId?: string
  showBackButton?: boolean
  onBack?: () => void
}

export default function NovaGenealogiaPage({
  initialBirdId,
  showBackButton = true,
  onBack
}: NovaGenealogiaProps = {}) {
  const router = useRouter()
  const { tenant } = useAuth()
  const [allBirds, setAllBirds] = useState<Bird[]>([])

  useEffect(() => {
    setAllBirds(db.getBirds(tenant?.id))
  }, [tenant?.id])

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

  // Handle bird selection from database
  const handleSelectBird = (bird: Bird, targetOverride?: 'main' | 'father' | 'mother' | 'patGF' | 'patGM' | 'matGF' | 'matGM') => {
    const target = targetOverride || modalTarget
    const data: NodeData = {
      id: bird.id,
      name: bird.name,
      ringNumber: bird.ringNumber,
      sex: bird.sex as 'MALE' | 'FEMALE' | 'UNKNOWN'
    }

    if (target === 'main') {
      setMainBird(data)
      // Auto-populate parents if available in DB
      if (bird.fatherName) {
        setFather({
          name: bird.fatherName,
          ringNumber: '',
          sex: 'MALE'
        })
      }
      if (bird.motherName) {
        setMother({
          name: bird.motherName,
          ringNumber: '',
          sex: 'FEMALE'
        })
      }
      if (bird.paternalGrandfatherId) {
        setPatGrandfather({
          name: bird.paternalGrandfatherId,
          ringNumber: '',
          sex: 'MALE'
        })
      }
      if (bird.paternalGrandmotherId) {
        setPatGrandmother({
          name: bird.paternalGrandmotherId,
          ringNumber: '',
          sex: 'FEMALE'
        })
      }
      if (bird.maternalGrandfatherId) {
        setMatGrandfather({
          name: bird.maternalGrandfatherId,
          ringNumber: '',
          sex: 'MALE'
        })
      }
      if (bird.maternalGrandmotherId) {
        setMatGrandmother({
          name: bird.maternalGrandmotherId,
          ringNumber: '',
          sex: 'FEMALE'
        })
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

  // When initialBirdId is provided, auto-select
  useEffect(() => {
    if (initialBirdId && allBirds.length > 0) {
      const bird = allBirds.find(b => b.id === initialBirdId)
      if (bird) {
        handleSelectBird(bird, 'main')
      }
    }
  }, [initialBirdId, allBirds])

  // Handle manual bird assignment
  const handleApplyManual = () => {
    if (!manualName && !manualRing) return

    const data: NodeData = {
      name: manualName || 'Sem Nome',
      ringNumber: manualRing,
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

  // Save genealogy relationship
  const handleSave = () => {
    if (mainBird.id) {
      db.updateBird(mainBird.id, {
        fatherName: father.name || undefined,
        motherName: mother.name || undefined,
        paternalGrandfatherId: patGrandfather.name || undefined,
        paternalGrandmotherId: patGrandmother.name || undefined,
        maternalGrandfatherId: matGrandfather.name || undefined,
        maternalGrandmotherId: matGrandmother.name || undefined,
      })
    }

    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
    }, 3500)
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

  // Filter birds for modal
  const filteredBirds = allBirds.filter(b => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      b.name.toLowerCase().includes(term) ||
      b.ringNumber.toLowerCase().includes(term) ||
      b.species.toLowerCase().includes(term)
    )
  })

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
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#94a3b8] hover:bg-[#64748b] active:bg-[#475569] text-white rounded flex items-center justify-center shadow-2xs transition cursor-pointer"
              title="Expandir gerações ou aumentar zoom"
              aria-label="Aumentar zoom ou gerações"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#94a3b8] hover:bg-[#64748b] active:bg-[#475569] text-white rounded flex items-center justify-center shadow-2xs transition cursor-pointer"
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
                {/* Perched Bird Icon on Branch */}
                <div className="flex items-center justify-center text-slate-800 group-hover:text-emerald-600 transition-colors">
                  <PerchedBirdIcon className="w-7 h-7" />
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

                  {/* Perched Bird Icon */}
                  <div className="flex items-center justify-center text-slate-800 group-hover:text-sky-600 transition-colors">
                    <PerchedBirdIcon className="w-7 h-7" />
                  </div>

                  {/* Label */}
                  <span className="text-[11px] font-bold text-slate-800 block mt-1">
                    Macho
                  </span>

                  {/* Placeholder / Ring */}
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">
                    {father.name 
                      ? `${father.name} ${father.ringNumber ? `(${father.ringNumber})` : ''}` 
                      : '....'}
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
                        className="w-18 bg-white border border-gray-300 rounded p-1.5 text-center shadow-2xs hover:border-sky-500 cursor-pointer relative"
                        title="Avô Paterno ♂"
                      >
                        <span className="absolute top-0.5 right-1 text-[9px] text-sky-600 font-bold">♂</span>
                        <PerchedBirdIcon className="w-5 h-5 mx-auto text-slate-700" />
                        <span className="text-[8px] font-bold block mt-0.5">Avô P.</span>
                        <span className="text-[7.5px] text-slate-500 truncate block font-mono">
                          {patGrandfather.name || '....'}
                        </span>
                      </div>

                      {/* Avó Paterna */}
                      <div
                        onClick={() => handleOpenSelector('patGM')}
                        className="w-18 bg-white border border-gray-300 rounded p-1.5 text-center shadow-2xs hover:border-rose-500 cursor-pointer relative"
                        title="Avó Paterna ♀"
                      >
                        <span className="absolute top-0.5 right-1 text-[9px] text-rose-500 font-bold">♀</span>
                        <PerchedBirdIcon className="w-5 h-5 mx-auto text-slate-700" />
                        <span className="text-[8px] font-bold block mt-0.5">Avó P.</span>
                        <span className="text-[7.5px] text-slate-500 truncate block font-mono">
                          {patGrandmother.name || '....'}
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

                  {/* Perched Bird Icon */}
                  <div className="flex items-center justify-center text-slate-800 group-hover:text-rose-600 transition-colors">
                    <PerchedBirdIcon className="w-7 h-7" />
                  </div>

                  {/* Label */}
                  <span className="text-[11px] font-bold text-slate-800 block mt-1">
                    Fêmea
                  </span>

                  {/* Placeholder / Ring */}
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">
                    {mother.name 
                      ? `${mother.name} ${mother.ringNumber ? `(${mother.ringNumber})` : ''}` 
                      : '....'}
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
                        className="w-18 bg-white border border-gray-300 rounded p-1.5 text-center shadow-2xs hover:border-sky-500 cursor-pointer relative"
                        title="Avô Materno ♂"
                      >
                        <span className="absolute top-0.5 right-1 text-[9px] text-sky-600 font-bold">♂</span>
                        <PerchedBirdIcon className="w-5 h-5 mx-auto text-slate-700" />
                        <span className="text-[8px] font-bold block mt-0.5">Avô M.</span>
                        <span className="text-[7.5px] text-slate-500 truncate block font-mono">
                          {matGrandfather.name || '....'}
                        </span>
                      </div>

                      {/* Avó Materna */}
                      <div
                        onClick={() => handleOpenSelector('matGM')}
                        className="w-18 bg-white border border-gray-300 rounded p-1.5 text-center shadow-2xs hover:border-rose-500 cursor-pointer relative"
                        title="Avó Materna ♀"
                      >
                        <span className="absolute top-0.5 right-1 text-[9px] text-rose-500 font-bold">♀</span>
                        <PerchedBirdIcon className="w-5 h-5 mx-auto text-slate-700" />
                        <span className="text-[8px] font-bold block mt-0.5">Avó M.</span>
                        <span className="text-[7.5px] text-slate-500 truncate block font-mono">
                          {matGrandmother.name || '....'}
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
                className="px-4 py-1.5 border border-gray-300 bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-[#94a3b8] text-slate-700 font-semibold text-xs rounded shadow-2xs flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Voltar</span>
              </button>
            ) : (
              <Link href="/dashboard/genealogia">
                <button
                  type="button"
                  className="px-4 py-1.5 border border-gray-300 bg-[#e2e8f0] hover:bg-[#cbd5e1] active:bg-[#94a3b8] text-slate-700 font-semibold text-xs rounded shadow-2xs flex items-center gap-1 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
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
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                      {b.sex === 'MALE' ? '♂' : b.sex === 'FEMALE' ? '♀' : '•'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#009fe3] transition-colors block">
                        {b.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Anilha: {b.ringNumber || 'S/A'} • {b.species.split('(')[0].trim()}
                      </span>
                    </div>
                  </div>
                  <button className="text-[11px] font-bold text-[#009fe3] opacity-0 group-hover:opacity-100 transition-opacity">
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

    </div>
  )
}
