'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  Printer, 
  Edit3, 
  Trash2, 
  Video, 
  ChevronDown, 
  X, 
  Bird as BirdIcon,
  Check,
  Tag,
  FileText
} from 'lucide-react'
import { db } from '@/lib/db'
import { firebaseSync } from '@/lib/firebase-service'
import { Bird, Tenant } from '@/types'
import { PrintPedigreeModal } from '@/components/modals/print-pedigree-modal'
import { PrintBadgeModal } from '@/components/modals/print-badge-modal'
import { NovaGenealogiaEnvironment } from '@/components/genealogy/nova-genealogia-environment'

function GenealogiaContent() {
  const searchParams = useSearchParams()
  const ringParam = searchParams.get('anilha') || undefined
  const birdIdParam = searchParams.get('birdId') || undefined
  const tabParam = searchParams.get('tab')

  const [birds, setBirds] = useState<Bird[]>(() => db.getBirds())
  const [tenant, setTenant] = useState<Tenant | null>(() => db.getTenant())

  // Sincronização reativa instantânea para listar todos os pássaros e árvores criadas
  useEffect(() => {
    const sync = () => {
      setBirds(db.getBirds())
      setTenant(db.getTenant())
    }
    sync()
    if (typeof window !== 'undefined') {
      window.addEventListener('birdpro_db_updated', sync)
      return () => window.removeEventListener('birdpro_db_updated', sync)
    }
  }, [])

  // State
  const [viewMode, setViewMode] = useState<'TREE' | 'LIST'>('TREE')
  const [selectedTreeBirdId, setSelectedTreeBirdId] = useState<string | undefined>(birdIdParam)
  const [selectedRingNumber, setSelectedRingNumber] = useState<string | undefined>(ringParam)
  const [activeTab, setActiveTab] = useState<'PLANTEL' | 'TODOS'>('PLANTEL')

  useEffect(() => {
    if (ringParam) {
      setSelectedRingNumber(ringParam)
      setViewMode('TREE')
    }
    if (birdIdParam) {
      setSelectedTreeBirdId(birdIdParam)
      setViewMode('TREE')
    }
    if (tabParam === 'list') {
      setViewMode('LIST')
    }
  }, [ringParam, birdIdParam, tabParam])

  const [searchField, setSearchField] = useState('ave')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  
  // Modals
  const [selectedPedigreeBird, setSelectedPedigreeBird] = useState<Bird | null>(null)
  const [selectedBadgeBird, setSelectedBadgeBird] = useState<Bird | null>(null)
  const [editingBird, setEditingBird] = useState<Bird | null>(null)
  const [editModalTab, setEditModalTab] = useState<'GERAL' | 'AVOS' | 'BISAVOS'>('GERAL')
  const [isTrainingOpen, setIsTrainingOpen] = useState(false)

  // Edit Form State com suporte a Árvore e Todos os Parentescos
  const [editForm, setEditForm] = useState({
    name: '',
    ringNumber: '',
    species: '',
    sex: 'MALE',
    status: 'ACTIVE',
    birthDate: '',
    // Pais (1ª Geração)
    fatherName: '',
    fatherRing: '',
    motherName: '',
    motherRing: '',
    // Avós (2ª Geração)
    paternalGrandfather: '',
    paternalGrandmother: '',
    maternalGrandfather: '',
    maternalGrandmother: '',
    // Bisavós (3ª Geração - 8 Parentescos)
    bisavos: {
      FFF: '',
      FFM: '',
      FMF: '',
      FMM: '',
      MFF: '',
      MFM: '',
      MMF: '',
      MMM: ''
    }
  })

  // Filter birds: exibe todas as aves ativas ou em reprodução no criatório
  const filteredBirds = birds.filter(b => {
    if (activeTab === 'PLANTEL' && (b.status === 'DECEASED' || b.status === 'TRANSFERRED' || b.status === 'LOST')) {
      return false
    }

    if (!appliedSearch) return true

    const query = appliedSearch.toLowerCase()
    if (searchField === 'ave') {
      return String(b.name || '').toLowerCase().includes(query)
    } else if (searchField === 'anilha') {
      return String(b.ringNumber || '').toLowerCase().includes(query)
    } else if (searchField === 'pai') {
      return String(b.fatherName || '').toLowerCase().includes(query)
    } else if (searchField === 'mae') {
      return String(b.motherName || '').toLowerCase().includes(query)
    } else if (searchField === 'especie') {
      return String(b.species || '').toLowerCase().includes(query)
    }
    return true
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedSearch(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setAppliedSearch('')
  }

  const handleOpenEdit = (bird: Bird) => {
    setEditingBird(bird)
    setEditModalTab('GERAL')
    setEditForm({
      name: bird.name || '',
      ringNumber: bird.ringNumber || '',
      species: bird.species || '',
      sex: bird.sex || 'MALE',
      status: bird.status || 'ACTIVE',
      birthDate: bird.birthDate || '',
      // Pais
      fatherName: bird.fatherName || bird.ancestry?.['F']?.name || '',
      fatherRing: bird.fatherRing || bird.ancestry?.['F']?.ringNumber || '',
      motherName: bird.motherName || bird.ancestry?.['M']?.name || '',
      motherRing: bird.motherRing || bird.ancestry?.['M']?.ringNumber || '',
      // Avós
      paternalGrandfather: bird.paternalGrandfatherId || bird.ancestry?.['FF']?.name || '',
      paternalGrandmother: bird.paternalGrandmotherId || bird.ancestry?.['FM']?.name || '',
      maternalGrandfather: bird.maternalGrandfatherId || bird.ancestry?.['MF']?.name || '',
      maternalGrandmother: bird.maternalGrandmotherId || bird.ancestry?.['MM']?.name || '',
      // Bisavós
      bisavos: {
        FFF: bird.ancestry?.['FFF']?.name || '',
        FFM: bird.ancestry?.['FFM']?.name || '',
        FMF: bird.ancestry?.['FMF']?.name || '',
        FMM: bird.ancestry?.['FMM']?.name || '',
        MFF: bird.ancestry?.['MFF']?.name || '',
        MFM: bird.ancestry?.['MFM']?.name || '',
        MMF: bird.ancestry?.['MMF']?.name || '',
        MMM: bird.ancestry?.['MMM']?.name || ''
      }
    })
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBird) return

    // Monta mapa de ancestrais completo
    const ancestry: Record<string, { id?: string; name: string; ringNumber: string }> = { 
      ...(editingBird.ancestry || {}) 
    }

    if (editForm.fatherName) {
      ancestry['F'] = { name: editForm.fatherName, ringNumber: editForm.fatherRing || '' }
    }
    if (editForm.motherName) {
      ancestry['M'] = { name: editForm.motherName, ringNumber: editForm.motherRing || '' }
    }
    if (editForm.paternalGrandfather) {
      ancestry['FF'] = { name: editForm.paternalGrandfather, ringNumber: '' }
    }
    if (editForm.paternalGrandmother) {
      ancestry['FM'] = { name: editForm.paternalGrandmother, ringNumber: '' }
    }
    if (editForm.maternalGrandfather) {
      ancestry['MF'] = { name: editForm.maternalGrandfather, ringNumber: '' }
    }
    if (editForm.maternalGrandmother) {
      ancestry['MM'] = { name: editForm.maternalGrandmother, ringNumber: '' }
    }

    Object.entries(editForm.bisavos).forEach(([k, val]) => {
      if (val && val.trim()) {
        ancestry[k] = { name: val.trim(), ringNumber: '' }
      }
    })

    const updated = db.updateBird(editingBird.id, {
      name: editForm.name,
      ringNumber: editForm.ringNumber,
      species: editForm.species,
      sex: editForm.sex as any,
      status: editForm.status as any,
      birthDate: editForm.birthDate || undefined,
      fatherName: editForm.fatherName || undefined,
      fatherRing: editForm.fatherRing || undefined,
      motherName: editForm.motherName || undefined,
      motherRing: editForm.motherRing || undefined,
      paternalGrandfatherId: editForm.paternalGrandfather || undefined,
      paternalGrandmotherId: editForm.paternalGrandmother || undefined,
      maternalGrandfatherId: editForm.maternalGrandfather || undefined,
      maternalGrandmotherId: editForm.maternalGrandmother || undefined,
      ancestry
    })

    // Sincroniza na nuvem
    if (updated && firebaseSync.isAvailable()) {
      firebaseSync.saveDocument('birds', updated.id, updated).catch(() => {})
    }

    // Atualiza estado local e dispara evento
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('birdpro_db_updated'))
    }
    setBirds(db.getBirds())
    setEditingBird(null)
  }

  const handleDeleteBird = (bird: Bird) => {
    if (confirm(`Deseja realmente remover a ave "${bird.name}" (${bird.ringNumber}) da Árvore Genealógica?`)) {
      db.deleteBird(bird.id)
      if (firebaseSync.isAvailable()) {
        firebaseSync.removeDocument('birds', bird.id).catch(() => {})
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('birdpro_db_updated'))
      }
      setBirds(db.getBirds())
    }
  }

  return (
    <div className="space-y-3 pb-16 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Árvore Genealógica</span>
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-md border border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-slate-700 text-xs font-semibold mr-2">
            <BirdIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Árvore Genealógica</span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('TREE')}
              className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'TREE'
                  ? 'bg-[#009fe3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BirdIcon className="w-3.5 h-3.5" />
              <span>Nova Genealogia (Árvore)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-[#00c853] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Lista de Pássaros &amp; Pedigrees</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTrainingOpen(!isTrainingOpen)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded border border-slate-300 flex items-center space-x-1.5 transition"
            >
              <Video className="w-3.5 h-3.5 text-slate-600" />
              <span>Treinamento</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

          {isTrainingOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded shadow-lg border border-slate-200 py-1 z-20 text-xs">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                📹 Como gerar Árvore Genealógica
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                🖨️ Impressão de Etiquetas de Gaiola
              </a>
            </div>
          )}
        </div>
      </div>
    </div>

      {viewMode === 'TREE' ? (
        <NovaGenealogiaEnvironment 
          initialBirdId={selectedTreeBirdId} 
          initialRingNumber={selectedRingNumber}
          showBackButton={false} 
        />
      ) : (
        <>
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-md border border-slate-200 p-2 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-0">
          {/* Dropdown Field */}
          <div className="relative">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-300 rounded-l text-xs text-slate-700 focus:outline-none focus:border-[#00c853] border-r-0 cursor-pointer font-medium"
            >
              <option value="ave">Ave</option>
              <option value="anilha">Anilha</option>
              <option value="pai">Pai</option>
              <option value="mae">Mãe</option>
              <option value="especie">Espécie</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisa"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c853]"
            />
          </div>

          {/* Clear Button (Red/Coral) */}
          <button
            type="button"
            onClick={handleClearSearch}
            className="h-9 px-3 bg-[#e57373] hover:bg-[#ef5350] text-white flex items-center justify-center transition"
            title="Limpar pesquisa"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Submit Search Button (Blue) */}
          <button
            type="submit"
            className="h-9 px-4 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-semibold rounded-r flex items-center space-x-1.5 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('PLANTEL')}
          className={`py-2 px-4 border-b-2 transition ${
            activeTab === 'PLANTEL'
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Plantel
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TODOS')}
          className={`py-2 px-4 border-b-2 transition ${
            activeTab === 'TODOS'
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Bird Cards List - Full Width */}
      <div className="space-y-3 pt-2">
        {filteredBirds.length === 0 ? (
          <div className="bg-white rounded-md border border-slate-200 p-8 text-center text-xs text-slate-400">
            Nenhuma ave encontrada com os critérios de busca selecionados.
          </div>
        ) : (
          filteredBirds.map((bird) => (
            <div 
              key={bird.id}
              className="bg-white rounded-md border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition w-full"
            >
              {/* Header: Icon + Name + Anilha */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="text-slate-700">
                  {/* Origami / Bird Silhouette Icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <path d="M3 15l4-8 5 4 7-7 2 5-6 6-5-2-4 2z" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                  {bird.name}
                </h3>
                <span className="text-xs text-slate-500">
                  - Anilha: {bird.ringNumber || 'Sem Anilha'}
                </span>
              </div>

              {/* Grid 3 Columns - Full Width Proportions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-2 lg:gap-y-0 text-xs text-slate-600 items-center">
                {/* Col 1: Pai e Situação (35%) */}
                <div className="lg:col-span-4 space-y-1">
                  <p>
                    <span className="text-slate-500 font-normal">Ave Pai: </span>
                    <span className="font-bold text-slate-800">{bird.fatherName || 'Não Informado'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500 font-normal">Situação: </span>
                    <span className="font-semibold text-slate-700">Plantel</span>
                  </p>
                </div>

                {/* Col 2: Mãe e Sexo (35%) */}
                <div className="lg:col-span-4 space-y-1">
                  <p>
                    <span className="text-slate-500 font-normal">Ave Mãe: </span>
                    <span className="font-bold text-slate-800">{bird.motherName || 'Não Informado'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500 font-normal">Sexo: </span>
                    <span className="font-semibold text-slate-700">
                      {bird.sex === 'MALE' ? 'Macho' : bird.sex === 'FEMALE' ? 'Fêmea' : 'Indefinido'}
                    </span>
                  </p>
                </div>

                {/* Col 3: Espécie (20%) */}
                <div className="lg:col-span-2 space-y-1">
                  <p>
                    <span className="text-slate-500 font-normal">Espécie: </span>
                    <span className="font-bold text-slate-800">{bird.species}</span>
                  </p>
                </div>

                {/* Action Buttons (10% - Right Aligned) */}
                <div className="lg:col-span-2 flex items-center justify-end space-x-1.5 pt-2 lg:pt-0">
                  {/* 0. Ver Árvore Genealógica Interativa */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTreeBirdId(bird.id)
                      setSelectedRingNumber(bird.ringNumber)
                      setViewMode('TREE')
                    }}
                    className="w-7 h-7 bg-[#009fe3] hover:bg-[#008ac7] text-white rounded flex items-center justify-center transition shadow-xs cursor-pointer"
                    title="Ver Toda a Árvore Genealógica Desta Ave"
                  >
                    <BirdIcon className="w-3.5 h-3.5" />
                  </button>

                  {/* 1. Imprimir Árvore Genealógica (Certificado A4) */}
                  <button
                    type="button"
                    onClick={() => setSelectedPedigreeBird(bird)}
                    className="w-7 h-7 bg-[#212830] hover:bg-slate-800 text-white rounded flex items-center justify-center transition shadow-xs"
                    title="Imprimir Árvore Genealógica (Certificado A4)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  {/* 2. Imprimir Etiqueta da Gaiola (Tooltip: Etiqueta da Gaiola) */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedBadgeBird(bird)}
                      className="w-7 h-7 bg-[#00c853] hover:bg-[#00b84a] text-white rounded flex items-center justify-center transition shadow-xs"
                      title="Etiqueta da Gaiola"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-10 shadow">
                      Etiqueta da Gaiola
                    </div>
                  </div>

                  {/* 3. Editar */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(bird)}
                    className="w-7 h-7 bg-[#4bbad8] hover:bg-[#38a3bf] text-white rounded flex items-center justify-center transition shadow-xs"
                    title="Editar Ave / Genealogia"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* 4. Excluir */}
                  <button
                    type="button"
                    onClick={() => handleDeleteBird(bird)}
                    className="w-7 h-7 bg-[#e57373] hover:bg-[#ef5350] text-white rounded flex items-center justify-center transition shadow-xs"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </>
      )}

      {/* Modal de Impressão de Genealogia A4 */}
      {selectedPedigreeBird && (
        <PrintPedigreeModal
          bird={selectedPedigreeBird}
          tenant={tenant}
          isOpen={!!selectedPedigreeBird}
          onClose={() => setSelectedPedigreeBird(null)}
        />
      )}

      {/* Modal de Impressão de Etiqueta da Gaiola */}
      {selectedBadgeBird && (
        <PrintBadgeModal
          bird={selectedBadgeBird}
          tenant={tenant}
          isOpen={!!selectedBadgeBird}
          onClose={() => setSelectedBadgeBird(null)}
        />
      )}

      {/* Modal de Edição de Ave / Genealogia Completa */}
      {editingBird && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden animate-scale-in flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  <BirdIcon className="w-4 h-4 text-[#00c853]" />
                  <span>Editar Ave &amp; Parentescos da Genealogia</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {editingBird.name} ({editingBird.ringNumber || 'Sem anilha'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBird(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setEditModalTab('GERAL')}
                className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                  editModalTab === 'GERAL'
                    ? 'border-[#00c853] text-[#00c853] bg-white rounded-t'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Ave Principal &amp; Pais
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('AVOS')}
                className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                  editModalTab === 'AVOS'
                    ? 'border-[#00c853] text-[#00c853] bg-white rounded-t'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Avós (2ª Geração)
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('BISAVOS')}
                className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                  editModalTab === 'BISAVOS'
                    ? 'border-[#00c853] text-[#00c853] bg-white rounded-t'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Bisavós (3ª Geração - 8 Parentes)
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* ABA 1: AVE PRINCIPAL & PAIS */}
              {editModalTab === 'GERAL' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                    <span className="text-[11px] font-black uppercase text-slate-700 block">
                      Dados da Ave Principal
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Ave *</label>
                        <input
                          type="text"
                          required
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-bold focus:outline-none focus:border-[#00c853]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Número da Anilha Oficial</label>
                        <input
                          type="text"
                          value={editForm.ringNumber}
                          onChange={(e) => setEditForm({ ...editForm, ringNumber: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-mono font-bold focus:outline-none focus:border-[#00c853]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Espécie</label>
                        <input
                          type="text"
                          value={editForm.species}
                          onChange={(e) => setEditForm({ ...editForm, species: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-[#00c853]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Sexo</label>
                        <select
                          value={editForm.sex}
                          onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-[#00c853]"
                        >
                          <option value="MALE">Macho (♂)</option>
                          <option value="FEMALE">Fêmea (♀)</option>
                          <option value="UNKNOWN">Indefinido (?)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Nascimento</label>
                        <input
                          type="date"
                          value={editForm.birthDate}
                          onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:border-[#00c853]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PAIS (1ª GERAÇÃO) */}
                  <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-200 space-y-3">
                    <span className="text-[11px] font-black uppercase text-sky-800 block">
                      Pais (1ª Geração)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-2.5 rounded border border-sky-100 space-y-2">
                        <span className="text-[10px] font-bold text-sky-700 uppercase block">Ave Pai ♂</span>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Nome do Pai</label>
                          <input
                            type="text"
                            placeholder="Nome do Pai"
                            value={editForm.fatherName}
                            onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 font-semibold focus:outline-none focus:border-[#00c853]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Anilha do Pai</label>
                          <input
                            type="text"
                            placeholder="Anilha do Pai"
                            value={editForm.fatherRing}
                            onChange={(e) => setEditForm({ ...editForm, fatherRing: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 font-mono text-[11px] focus:outline-none focus:border-[#00c853]"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded border border-rose-100 space-y-2">
                        <span className="text-[10px] font-bold text-rose-700 uppercase block">Ave Mãe ♀</span>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Nome da Mãe</label>
                          <input
                            type="text"
                            placeholder="Nome da Mãe"
                            value={editForm.motherName}
                            onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 font-semibold focus:outline-none focus:border-[#00c853]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Anilha da Mãe</label>
                          <input
                            type="text"
                            placeholder="Anilha da Mãe"
                            value={editForm.motherRing}
                            onChange={(e) => setEditForm({ ...editForm, motherRing: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 font-mono text-[11px] focus:outline-none focus:border-[#00c853]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: AVÓS (2ª GERAÇÃO) */}
              {editModalTab === 'AVOS' && (
                <div className="space-y-4">
                  {/* Linha Paterna */}
                  <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-200 space-y-3">
                    <span className="text-[11px] font-black uppercase text-sky-800 block">
                      Avós Paternos (Pais do Pai)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Avô Paterno (Pai do Pai) ♂
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Soberano da Fibra"
                          value={editForm.paternalGrandfather}
                          onChange={(e) => setEditForm({ ...editForm, paternalGrandfather: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-medium focus:outline-none focus:border-[#00c853]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Avó Paterna (Mãe do Pai) ♀
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Felícia Matriz"
                          value={editForm.paternalGrandmother}
                          onChange={(e) => setEditForm({ ...editForm, paternalGrandmother: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-medium focus:outline-none focus:border-[#00c853]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Linha Materna */}
                  <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200 space-y-3">
                    <span className="text-[11px] font-black uppercase text-rose-800 block">
                      Avós Maternos (Pais da Mãe)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Avô Materno (Pai da Mãe) ♂
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Zeus Campeão"
                          value={editForm.maternalGrandfather}
                          onChange={(e) => setEditForm({ ...editForm, maternalGrandfather: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-medium focus:outline-none focus:border-[#00c853]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Avó Materna (Mãe da Mãe) ♀
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Lady Gaga Ouro"
                          value={editForm.maternalGrandmother}
                          onChange={(e) => setEditForm({ ...editForm, maternalGrandmother: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-medium focus:outline-none focus:border-[#00c853]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 3: BISAVÓS (3ª GERAÇÃO) */}
              {editModalTab === 'BISAVOS' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Preencha os bisavós da ave. Se não souber algum, pode deixar em branco (o sistema preenche automaticamente com Indefinido).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Bisavós Linha Paterna */}
                    <div className="p-3 bg-sky-50/40 rounded-lg border border-sky-100 space-y-2">
                      <span className="text-[10px] font-black uppercase text-sky-800 block">Bisavós do Lado Paterno</span>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bisavô FFF (Pai do Avô Paterno) ♂</label>
                        <input
                          type="text"
                          value={editForm.bisavos.FFF}
                          onChange={(e) => setEditForm({ ...editForm, bisavos: { ...editForm.bisavos, FFF: e.target.value } })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bisavó FFM (Mãe do Avô Paterno) ♀</label>
                        <input
                          type="text"
                          value={editForm.bisavos.FFM}
                          onChange={(e) => setEditForm({ ...editForm, bisavos: { ...editForm.bisavos, FFM: e.target.value } })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bisavô FMF (Pai da Avó Paterna) ♂</label>
                        <input
                          type="text"
                          value={editForm.bisavos.FMF}
                          onChange={(e) => setEditForm({ ...editForm, bisavos: { ...editForm.bisavos, FMF: e.target.value } })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bisavó FMM (Mãe da Avó Paterna) ♀</label>
                        <input
                          type="text"
                          value={editForm.bisavos.FMM}
                          onChange={(e) => setEditForm({ ...editForm, bisavos: { ...editForm.bisavos, FMM: e.target.value } })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Bisavós Linha Materna */}
                    <div className="p-3 bg-rose-50/40 rounded-lg border border-rose-100 space-y-2">
                      <span className="text-[10px] font-black uppercase text-rose-800 block">Bisavós do Lado Materno</span>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bisavô MFF (Pai do Avô Materno) ♂</label>
                        <input
                          type="text"
                          value={editForm.bisavos.MFF}
                          onChange={(e) => setEditForm({ ...editForm, bisavos: { ...editForm.bisavos, MFF: e.target.value } })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bisavó MFM (Mãe do Avô Materno) ♀</label>
                        <input
                          type="text"
                          value={editForm.bisavos.MFM}
                          onChange={(e) => setEditForm({ ...editForm, bisavos: { ...editForm.bisavos, MFM: e.target.value } })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bisavô MMF (Pai da Avó Materna) ♂</label>
                        <input
                          type="text"
                          value={editForm.bisavos.MMF}
                          onChange={(e) => setEditForm({ ...editForm, bisavos: { ...editForm.bisavos, MMF: e.target.value } })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Bisavó MMM (Mãe da Avó Materna) ♀</label>
                        <input
                          type="text"
                          value={editForm.bisavos.MMM}
                          onChange={(e) => setEditForm({ ...editForm, bisavos: { ...editForm.bisavos, MMM: e.target.value } })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingBird) {
                      setSelectedTreeBirdId(editingBird.id)
                      setSelectedRingNumber(editingBird.ringNumber)
                      setViewMode('TREE')
                      setEditingBird(null)
                    }
                  }}
                  className="px-3 py-2 bg-[#009fe3] hover:bg-[#008ac7] text-white text-xs font-bold rounded shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <BirdIcon className="w-3.5 h-3.5" />
                  <span>Abrir na Árvore Visual Interativa</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingBird(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GenealogiaPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-md border border-slate-200 p-12 text-center text-xs text-slate-400">
        Carregando árvore genealógica...
      </div>
    }>
      <GenealogiaContent />
    </Suspense>
  )
}

