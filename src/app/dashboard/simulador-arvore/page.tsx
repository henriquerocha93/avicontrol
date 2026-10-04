'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Printer, Plus, Minus, Search, X, Image as ImageIcon } from 'lucide-react'
import { db } from '@/lib/db'
import { Bird, Tenant } from '@/types'
import { PrintPedigreeModal } from '@/components/modals/print-pedigree-modal'

function normalizeSpecies(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\(\)\-_\/\"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchSpecies(birdSpecies: string, targetSpecies: string): boolean {
  if (!targetSpecies) return true
  const b = normalizeSpecies(birdSpecies)
  const t = normalizeSpecies(targetSpecies)
  if (b.includes(t) || t.includes(b)) return true

  // Check matching keywords (e.g. 'canario', 'terra', 'coleiro', 'trinca', 'curio', 'azulao')
  const bTokens = b.split(' ').filter(w => w.length > 2)
  const tTokens = t.split(' ').filter(w => w.length > 2)
  return tTokens.some(tk => bTokens.includes(tk))
}

export default function TreeSimulatorPage() {
  const [tenant, setTenant] = useState<Tenant>(db.getTenant())
  const [birds, setBirds] = useState<Bird[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string>('Canário-da-terra')
  const [hasCoefficient, setHasCoefficient] = useState<boolean>(true)
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  const [selectedFather, setSelectedFather] = useState<Bird | null>(null)
  const [selectedMother, setSelectedMother] = useState<Bird | null>(null)
  const [previewBird, setPreviewBird] = useState<Bird | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false)
  const [targetSlot, setTargetSlot] = useState<'pai' | 'mae' | null>(null)
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    const t = db.getTenant()
    setTenant(t)
    const list = db.getBirds()
    setBirds(list)
    
    // Auto-select first species present in database if available
    if (list.length > 0) {
      const firstSpecies = list[0].species.split('(')[0].trim()
      if (firstSpecies) {
        setSelectedSpecies(firstSpecies)
      }
    }
  }, [])

  const handleSpeciesChange = (newSpecies: string) => {
    setSelectedSpecies(newSpecies)
    // Clear parents if they do not match the newly selected species
    if (selectedFather && !matchSpecies(selectedFather.species, newSpecies)) {
      setSelectedFather(null)
    }
    if (selectedMother && !matchSpecies(selectedMother.species, newSpecies)) {
      setSelectedMother(null)
    }
  }

  const handleOpenSelect = (slot: 'pai' | 'mae') => {
    setTargetSlot(slot)
    setSearchFilter('')
    setIsSelectModalOpen(true)
  }

  const handleSelectBird = (bird: Bird) => {
    if (targetSlot === 'pai') setSelectedFather(bird)
    else if (targetSlot === 'mae') setSelectedMother(bird)
    setIsSelectModalOpen(false)
  }

  const handleRemoveParent = (e: React.MouseEvent, slot: 'pai' | 'mae') => {
    e.stopPropagation()
    if (slot === 'pai') setSelectedFather(null)
    else if (slot === 'mae') setSelectedMother(null)
  }

  const handleGeneratePreview = () => {
    const simulatedChild: Bird = {
      id: `sim-${Date.now()}`,
      tenantId: tenant.id,
      name: `FILHOTE (${selectedFather?.name?.slice(0, 8) || 'PAI'} x ${selectedMother?.name?.slice(0, 8) || 'MÃE'})`,
      ringNumber: 'SIMULAÇÃO 2026',
      species: selectedSpecies,
      sex: 'MALE',
      birthDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      origin: 'OTHER',
      entryDate: new Date().toISOString().split('T')[0],
      isPublic: false,
      fatherId: selectedFather?.id,
      fatherName: selectedFather?.name || 'PAI SIMULADO',
      fatherRing: selectedFather?.ringNumber || 'SISPASS 0001',
      motherId: selectedMother?.id,
      motherName: selectedMother?.name || 'MÃE SIMULADA',
      motherRing: selectedMother?.ringNumber || 'SISPASS 0002',
      paternalGrandfatherId: selectedFather?.fatherName || 'CARCAÇA',
      paternalGrandmotherId: selectedFather?.motherName || 'FELICIA',
      maternalGrandfatherId: selectedMother?.fatherName || 'ZEUS CMA',
      maternalGrandmotherId: selectedMother?.motherName || 'LADY GAGA CM999',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('birdpro_simulated_bird', JSON.stringify(simulatedChild))
    }
    setPreviewBird(simulatedChild)
    setIsPrintModalOpen(true)
  }

  const speciesList = [
    'Canário-da-terra',
    'Azulão-verdadeiro',
    'Coleiro-papa-capim',
    'Trinca-ferro "similis"',
    'Rosela elegante',
    'Periquito Hooded',
    'Rosella do Norte',
    'Rosella de Cabeça Pálida',
    'Mariquita',
    'Rolinha Fogo Apagou',
    'Canário doméstico',
    'Grou coroado',
    'Ema',
    'Emu',
    'Ararinha da patagonia',
    'Arara juba',
    'Arara canga',
    'Arara vermelha',
    'Papagaio timeh',
    'Papagaio do caribe',
    'Papagaio de cauda curta ou vasa',
    'Cacatua red tail',
    'Cacatua sanguínea',
    'Cacatua moluca',
    'Cacatua inca',
    'Pato de Crista',
    'Bavete cauda longa',
    'Diamante Degolado',
    'Diamante Sparrow',
    'Diamante Bichenov',
    'Pitiguari',
    'Flamingo Americano',
    'Canário de Porte',
    'Canário de Canto',
    'Canário de Cor',
    'Periquito-regente',
    'Galah',
    'Periquito de Asa Vermelha',
    'Tauraco livingstonii',
    'Tauraco leucotis',
    'Papagaio ecletus',
    'Loris striato',
    'Loris dusky',
    'Loris bailarino',
    'Loris molucano',
    'Periquito moustache',
    'Cabeça de ameixa',
    'Rosela eximius',
    'Ring neck',
    'Periquito Inglês',
    'Periquito-australiano',
    'Diamante Mandarim',
    'Diamante de Gould',
    'Manon',
    'Calafate Java Finch',
    'Pintassilgo',
    'Pintassilgo-baiano',
    'Iraúna',
    'Vira-bosta',
    'Vira-bosta-picumã',
    'Asa-de-telha',
    'Paraguaio',
    'Graúna. chopim',
    'Dragão',
    'Chopim-do-brejo',
    'Polícia-inglesa-do-sul',
    'Polícia-inglesa-do-norte',
    'Garibaldi',
    'Carretão',
    'Iratauá-pequeno',
    'Sargento',
    'Corrupião. joão-pinto. sofrê',
    'Rouxinol-do-Rio-Negro',
    'Inhapim',
    'Iraúna-do-bico-branco',
    'Tecelão',
    'Guaxe',
    'Xexéu',
    'Japu-de-bico-encarnado',
    'João-congo',
    'Japu-verde',
    'Japuguaçu',
    'Rei-do-bosque',
    'Azulão-do-cerrado',
    'Azulão',
    'Azulinho',
    'Batuqueiro',
    'Bico-duro',
    'Bico-grosso',
    'Trinca-ferro-cinza',
    'Trinca-ferro "maximus"',
    'Bico-de-pimenta',
    'Furriel',
    'Galo-da-campina-pantaneiro',
    'Tangará',
    'Galo-da-campina',
    'Cardeal',
    'Tico-tico-rei',
    'Cravina',
    'Cardeal-amarelo',
    'Tico-tico-da-mata',
    'Tico-tico-do-Amazonas',
    'Cigarra-do-coqueiro',
    'Negrinho-do-mato',
    'Curió',
    'Bicudo-pataneiro-grandão',
    'Bicudo-do-bico-preto',
    'Bicudo-pantaneiro',
    'Bicudo-verdadeiro',
    'Bicudinho-belenzinho',
    'Caboclinho-de-barriga-preta',
    'Caboclinho-de-chapéu-cinzento',
    'Caboclinho-do-Amazonas',
    'Caboclinho-papo-branco',
    'Caboclinho',
    'Caboclinho-de-barriga-vermelha',
    'Caboclinho-de-cabeça-marrom',
    'Cigarra-rainha',
    'Brejal',
    'Coleiro-baiano',
    'Bigodinho',
    'Coleira-do-brejo',
    'Gola',
    'Patativa',
    'Cigarra-papa-arroz',
    'Cigarra-verdadeira',
    'Pichochó',
    'Tiziu',
    'Rabo-mole-da-serra',
    'Sabiá-do-banhado',
    'Canário-do-campo',
    'Canário-rasteiro',
    'Tipiu',
    'Canário-chapinha',
    'Canário-do-Amazonas',
    'Diuca',
    'Cigarra-bambu',
    'Tico-tico-do-campo',
    'Tico-tico',
    'Saí-andorinha',
    'Tem-tem-do-Espírito-Santo',
    'Saí-beija-flor',
    'Saí-tucano',
    'Saí-azul',
    'Saí-de-pernas-pretas',
    'Saíra',
    'Saíra-diamente',
    'Saíguaçu',
    'Saíra-preciosa',
    'Saíra-amarelo',
    'Negaça',
    'Douradinha',
    'Saíra-verde',
    'Saíra-lenço',
    'Saíra-sete-cores',
    'Pintor-verdadeiro',
    'Sete-cores',
    'Saíra-louça',
    'Bonito-do-campo',
    'Tem-tem-curicaca',
    'Gaturamo serrador',
    'Tom-tom',
    'Gaturamo-rei',
    'Cais-cais',
    'Gaturamo',
    'Gaturamo-verdadeiro',
    'Fim-fim',
    'Saíra-viúva',
    'Sanhaço-frade',
    'Sanhaço-papa-laranja',
    'Sanhaço-do-coqueiro',
    'Sanhaço-de-encontro-amarelo',
    'Sanhaço-de-encontro-azul',
    'Sanhaço-do-mamoeiro',
    'Sanhaço-azul',
    'Tié-sangue',
    'Pipira',
    'Bico-de-prata',
    'Sanhaço-de-fogo',
    'Tié-do-Mato-Grosso',
    'Tié-de-topete',
    'Pipira-preta',
    'Tié-preto',
    'Pipira-da-guiana',
    'Tié-galo',
    'Catirumbava',
    'Tié-tinga',
    'Bico-de-veludo',
    'Cambacica',
    'Sabiá-do-campo',
    'Sabiá-da-praia',
    'Sabiá-coleira',
    'Sabiá-da-mata',
    'Carachué',
    'Sabiá-branco',
    'Sabiá-barranco',
    'Sabiá-laranjeira',
    'Sabiá-ferreiro',
    'Sabiá-una',
    'Sabiá-castanha',
  ]

  const filteredModalBirds = birds.filter(b => {
    // 1. Strict Species Filter: must match the selectedSpecies
    if (!matchSpecies(b.species, selectedSpecies)) return false

    // 2. Gender Slot Filter
    if (targetSlot === 'pai' && b.sex === 'FEMALE') return false
    if (targetSlot === 'mae' && b.sex === 'MALE') return false

    // 3. Search text filter
    if (!searchFilter) return true
    const q = searchFilter.toLowerCase()
    return (
      b.name.toLowerCase().includes(q) ||
      (b.ringNumber && b.ringNumber.toLowerCase().includes(q)) ||
      (b.nickname && b.nickname.toLowerCase().includes(q))
    )
  })

  // Bird on branch SVG icon
  const BirdIcon = () => (
    <svg viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-8">
      <path d="M18 8C20.5 8 23 9.5 24 12L26.5 13L24 14C23.5 18 20 22 14 23L11 23.5L7.5 28L11 25C14 25 20 24 22.5 19" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20.5" cy="11" r="1" fill="#444"/>
      <path d="M16 13C18.5 13 20 15.5 18.5 18.5C17 20.5 14 19.5 14 17C14 15 15 13 16 13Z" stroke="#444" strokeWidth="1.3"/>
      <path d="M16 23L16 26M18.5 22.5L18.5 26" stroke="#444" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 26C14 25.5 25 26 35 24.5M26 26L30 22M27 25.5L31 28" stroke="#444" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )

  return (
    <div className="space-y-0 pb-0 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Simulador Árvore</span>
      </div>

      {/* Main White Container */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden w-full">
        
        {/* Tab Header */}
        <div className="px-4 pt-2.5 pb-0 border-b border-slate-200 bg-white">
          <div className="inline-flex items-center space-x-1.5 border-b-2 border-[#00c853] pb-2 px-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-slate-600">
              <path d="M12 3v6m0 0l-4 4m4-4l4 4m-4 8v-4m-6 4h12" />
            </svg>
            <span className="text-[11px] font-semibold text-slate-700">Simulador Árvore</span>
          </div>
        </div>

        {/* Controls Row: Espécie, Coeficiente, Zoom */}
        <div className="px-4 py-3 bg-white flex flex-wrap items-end justify-between gap-4 border-b border-slate-100">
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-500 block">Espécie<span className="text-red-500">*</span></label>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                  Filtro Ativo
                </span>
              </div>
              <select
                value={selectedSpecies}
                onChange={(e) => handleSpeciesChange(e.target.value)}
                className="w-64 h-7 px-2.5 text-[11px] bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853]"
              >
                {speciesList.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>
            <div className="space-y-0.5">
              <label className="text-[11px] font-medium text-slate-500 block">Coeficiente</label>
              <button
                type="button"
                onClick={() => setHasCoefficient(!hasCoefficient)}
                className={`px-2.5 py-0.5 text-[10px] font-black rounded-full transition cursor-pointer ${
                  hasCoefficient ? 'bg-[#00c853] text-white' : 'bg-slate-300 text-slate-600'
                }`}
              >
                {hasCoefficient ? 'SIM' : 'NÃO'}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(prev + 10, 140))}
              className="w-7 h-7 bg-slate-600 hover:bg-slate-700 text-white rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(prev - 10, 60))}
              className="w-7 h-7 bg-slate-600 hover:bg-slate-700 text-white rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TREE CANVAS — WHITE BACKGROUND, CENTERED                         */}
        {/* ================================================================ */}
        <div className="bg-white w-full px-8 pt-10 pb-6 flex flex-col items-center" style={{ minHeight: '380px' }}>
          <div 
            className="flex flex-col items-center select-none transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* AVE (TOP CENTER) */}
            <div className="flex flex-col items-center">
              <div className="w-[62px] h-[78px] bg-white border border-slate-300 rounded flex flex-col items-center justify-between py-2 px-1 shadow-xs">
                <BirdIcon />
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-700 block leading-tight">Ave</span>
                  <span className="text-[9px] text-slate-400 block tracking-widest">- - - -</span>
                </div>
              </div>
              <div className="w-px h-6 bg-slate-300" />
            </div>

            {/* HORIZONTAL BAR connecting to Macho and Fêmea */}
            <div className="relative" style={{ width: '580px' }}>
              <div className="w-full h-px bg-slate-300" />
              <div className="absolute left-0 top-0 w-px h-6 bg-slate-300" />
              <div className="absolute right-0 top-0 w-px h-6 bg-slate-300" />
            </div>

            {/* MACHO & FÊMEA (wide apart) */}
            <div className="flex items-start justify-between pt-6" style={{ width: '580px' }}>
              {/* MACHO */}
              <div 
                onClick={() => handleOpenSelect('pai')}
                className="w-[62px] h-[78px] bg-white border border-slate-300 rounded flex flex-col items-center justify-between py-2 px-1 shadow-xs hover:border-[#00c853] transition cursor-pointer relative group"
              >
                <span className="absolute -top-1 -right-1 text-[10px] text-blue-600 font-bold">♂</span>
                {selectedFather && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveParent(e, 'pai')}
                    className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold hover:bg-red-600 shadow-xs z-10"
                    title="Remover Macho"
                  >
                    ×
                  </button>
                )}
                <BirdIcon />
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-700 block leading-tight group-hover:text-[#00c853]">Macho</span>
                  <span className="text-[9px] text-slate-400 block tracking-widest truncate max-w-[54px]" title={selectedFather?.name}>
                    {selectedFather ? selectedFather.name : '- - - -'}
                  </span>
                </div>
              </div>

              {/* FÊMEA */}
              <div 
                onClick={() => handleOpenSelect('mae')}
                className="w-[62px] h-[78px] bg-white border border-slate-300 rounded flex flex-col items-center justify-between py-2 px-1 shadow-xs hover:border-[#00c853] transition cursor-pointer relative group"
              >
                <span className="absolute -top-1 -right-1 text-[10px] text-rose-600 font-bold">♀</span>
                {selectedMother && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveParent(e, 'mae')}
                    className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold hover:bg-red-600 shadow-xs z-10"
                    title="Remover Fêmea"
                  >
                    ×
                  </button>
                )}
                <BirdIcon />
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-700 block leading-tight group-hover:text-[#00c853]">Fêmea</span>
                  <span className="text-[9px] text-slate-400 block tracking-widest truncate max-w-[54px]" title={selectedMother?.name}>
                    {selectedMother ? selectedMother.name : '- - - -'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons Row: Visualizar & Imprimir */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={handleGeneratePreview}
            className="px-3.5 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-[11px] font-bold rounded flex items-center space-x-1 transition shadow-xs cursor-pointer"
          >
            <ImageIcon className="w-3 h-3" />
            <span>Visualizar</span>
          </button>
          <button
            type="button"
            onClick={handleGeneratePreview}
            className="px-3.5 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-[11px] font-bold rounded flex items-center space-x-1 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3 h-3" />
            <span>Imprimir</span>
          </button>
        </div>

      </div>

      {/* Bird Selection Modal com Filtro Estrito por Espécie */}
      {isSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="px-5 py-3.5 bg-slate-800 text-white flex items-center justify-between">
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block">
                  Selecionar {targetSlot === 'pai' ? 'Macho (Pai)' : 'Fêmea (Mãe)'}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Espécie: {selectedSpecies}
                </span>
              </div>
              <button onClick={() => setIsSelectModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Buscar ${targetSlot === 'pai' ? 'macho' : 'fêmea'} de ${selectedSpecies}...`}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredModalBirds.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-2 bg-slate-50 rounded-lg m-2 border border-dashed border-slate-200">
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <BirdIcon />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Nenhum {targetSlot === 'pai' ? 'macho' : 'fêmea'} cadastrado da espécie "{selectedSpecies}"
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Apenas pássaros da espécie selecionada podem ser incluídos nesta árvore. Selecione outra espécie no topo ou cadastre novas matrizes no plantel.
                  </p>
                </div>
              ) : (
                filteredModalBirds.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBird(b)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-[#00c853] hover:bg-emerald-50/30 flex items-center justify-between cursor-pointer transition text-xs group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <BirdIcon />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block uppercase group-hover:text-emerald-700">
                          {b.name}
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                          <span>{b.ringNumber}</span>
                          <span>•</span>
                          <span className="font-sans text-[10px] text-slate-600">{b.species}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      b.sex === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {b.sex === 'MALE' ? '♂ Macho' : '♀ Fêmea'}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {filteredModalBirds.length} {filteredModalBirds.length === 1 ? 'ave disponível' : 'aves disponíveis'}
              </span>
              <button onClick={() => setIsSelectModalOpen(false)} className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer rounded hover:bg-slate-200 transition">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {isPrintModalOpen && previewBird && (
        <PrintPedigreeModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          bird={previewBird}
          tenant={tenant}
        />
      )}
    </div>
  )
}

