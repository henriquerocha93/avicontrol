'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Bird, 
  Plus, 
  Search, 
  Filter, 
  QrCode, 
  Printer, 
  FileText, 
  Edit, 
  Trash2, 
  Download, 
  Grid, 
  List, 
  Eye,
  X,
  Check,
  Award,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Bird as BirdType, BirdSex, BirdStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SexBadge, StatusBadge } from '@/components/ui/badge';
import { QRModal } from '@/components/modals/qr-modal';
import { PrintBadgeModal } from '@/components/modals/print-badge-modal';
import { PrintPedigreeModal } from '@/components/modals/print-pedigree-modal';
import { SpeciesCombobox } from '@/components/ui/species-combobox';
import { DateManualInput } from '@/components/ui/date-manual-input';
import { inheritFullAncestryFromCouple, resolvePedigreeTree } from '@/lib/pedigree';
import { formatDate, calculateAge, exportToExcel, exportToCsv } from '@/lib/utils';

function BirdsContent() {
  const { tenant } = useAuth();
  const searchParams = useSearchParams();

  const [birds, setBirds] = useState<BirdType[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedSex, setSelectedSex] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBird, setEditingBird] = useState<BirdType | null>(null);
  
  const [qrModalBird, setQrModalBird] = useState<BirdType | null>(null);
  const [badgeModalBird, setBadgeModalBird] = useState<BirdType | null>(null);
  const [pedigreeModalBird, setPedigreeModalBird] = useState<BirdType | null>(null);

  // Couple / Ancestry inheritance state
  const [selectedFatherId, setSelectedFatherId] = useState('');
  const [selectedMotherId, setSelectedMotherId] = useState('');
  const [ancestryMessage, setAncestryMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    ringNumber: '',
    species: 'Canário da Terra (Sicalis flaveola)',
    subspecies: '',
    sex: 'MALE' as BirdSex,
    birthDate: '',
    breed: '',
    mutation: '',
    color: '',
    features: '',
    origin: 'BRED_HERE' as BirdType['origin'],
    breederOrigin: '',
    fatherId: '',
    fatherName: '',
    fatherRing: '',
    motherId: '',
    motherName: '',
    motherRing: '',
    paternalGrandfatherId: '',
    paternalGrandmotherId: '',
    maternalGrandfatherId: '',
    maternalGrandmotherId: '',
    cageId: '',
    status: 'ACTIVE' as BirdStatus,
    notes: '',
    entryDate: new Date().toISOString().split('T')[0],
    isPublic: true,
    photoUrl: '',
    ancestry: {} as Record<string, { id?: string; name: string; ringNumber: string }>
  });

  const loadBirds = () => {
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadBirds();
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
    }
  }, [tenant?.id, searchParams]);

  const cages = db.getCages(tenant?.id);

  // Filter birds
  const filteredBirds = birds.filter((b) => {
    const matchesSearch = 
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.ringNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.nickname && b.nickname.toLowerCase().includes(search.toLowerCase())) ||
      (b.species && b.species.toLowerCase().includes(search.toLowerCase())) ||
      (b.mutation && b.mutation.toLowerCase().includes(search.toLowerCase()));

    const matchesSpecies = !selectedSpecies || b.species.includes(selectedSpecies);
    const matchesSex = !selectedSex || b.sex === selectedSex;
    const matchesStatus = !selectedStatus || b.status === selectedStatus;

    return matchesSearch && matchesSpecies && matchesSex && matchesStatus;
  });

  // Species unique list
  const uniqueSpecies = Array.from(new Set(birds.map(b => b.species.split('(')[0].trim())));

  const handleSelectFather = (fId: string) => {
    setSelectedFatherId(fId);
    if (!fId) {
      setFormData(prev => ({
        ...prev,
        fatherId: '',
        fatherName: '',
        fatherRing: ''
      }));
      return;
    }
    const father = birds.find(b => b.id === fId);
    if (!father) return;

    const currentMother = selectedMotherId ? birds.find(b => b.id === selectedMotherId) : null;
    const fullAncestry = inheritFullAncestryFromCouple(father, currentMother, birds);

    setFormData(prev => ({
      ...prev,
      fatherId: father.id,
      fatherName: father.name,
      fatherRing: father.ringNumber || '',
      paternalGrandfatherId: father.fatherName || father.ancestry?.['F']?.name || prev.paternalGrandfatherId,
      paternalGrandmotherId: father.motherName || father.ancestry?.['M']?.name || prev.paternalGrandmotherId,
      ancestry: {
        ...(prev.ancestry || {}),
        ...fullAncestry
      }
    }));

    setAncestryMessage(`✓ Linhagem ancestral completa de ${father.name} herdada com sucesso (todas as gerações)!`);
    setTimeout(() => setAncestryMessage(null), 5000);
  };

  const handleSelectMother = (mId: string) => {
    setSelectedMotherId(mId);
    if (!mId) {
      setFormData(prev => ({
        ...prev,
        motherId: '',
        motherName: '',
        motherRing: ''
      }));
      return;
    }
    const mother = birds.find(b => b.id === mId);
    if (!mother) return;

    const currentFather = selectedFatherId ? birds.find(b => b.id === selectedFatherId) : null;
    const fullAncestry = inheritFullAncestryFromCouple(currentFather, mother, birds);

    setFormData(prev => ({
      ...prev,
      motherId: mother.id,
      motherName: mother.name,
      motherRing: mother.ringNumber || '',
      maternalGrandfatherId: mother.fatherName || mother.ancestry?.['F']?.name || prev.maternalGrandfatherId,
      maternalGrandmotherId: mother.motherName || mother.ancestry?.['M']?.name || prev.maternalGrandmotherId,
      ancestry: {
        ...(prev.ancestry || {}),
        ...fullAncestry
      }
    }));

    setAncestryMessage(`✓ Linhagem ancestral completa de ${mother.name} herdada com sucesso (todas as gerações)!`);
    setTimeout(() => setAncestryMessage(null), 5000);
  };

  const handleOpenCreate = () => {
    setEditingBird(null);
    setSelectedFatherId('');
    setSelectedMotherId('');
    setAncestryMessage(null);
    setFormData({
      name: '',
      nickname: '',
      ringNumber: `FOB-2026-BR-${Math.floor(1000 + Math.random() * 9000)}`,
      species: 'Canário da Terra (Sicalis flaveola)',
      subspecies: '',
      sex: 'MALE',
      birthDate: new Date().toISOString().split('T')[0],
      breed: '',
      mutation: '',
      color: '',
      features: '',
      origin: 'BRED_HERE',
      breederOrigin: '',
      fatherId: '',
      fatherName: '',
      fatherRing: '',
      motherId: '',
      motherName: '',
      motherRing: '',
      paternalGrandfatherId: '',
      paternalGrandmotherId: '',
      maternalGrandfatherId: '',
      maternalGrandmotherId: '',
      cageId: cages[0]?.code || '',
      status: 'ACTIVE',
      notes: '',
      entryDate: new Date().toISOString().split('T')[0],
      isPublic: true,
      photoUrl: '',
      ancestry: {}
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (bird: BirdType) => {
    setEditingBird(bird);
    setSelectedFatherId(bird.fatherId || '');
    setSelectedMotherId(bird.motherId || '');
    setAncestryMessage(null);
    setFormData({
      name: bird.name,
      nickname: bird.nickname || '',
      ringNumber: bird.ringNumber,
      species: bird.species,
      subspecies: bird.subspecies || '',
      sex: bird.sex,
      birthDate: bird.birthDate || '',
      breed: bird.breed || '',
      mutation: bird.mutation || '',
      color: bird.color || '',
      features: bird.features || '',
      origin: bird.origin || 'BRED_HERE',
      breederOrigin: bird.breederOrigin || '',
      fatherId: bird.fatherId || '',
      fatherName: bird.fatherName || '',
      fatherRing: bird.fatherRing || '',
      motherId: bird.motherId || '',
      motherName: bird.motherName || '',
      motherRing: bird.motherRing || '',
      paternalGrandfatherId: bird.paternalGrandfatherId || '',
      paternalGrandmotherId: bird.paternalGrandmotherId || '',
      maternalGrandfatherId: bird.maternalGrandfatherId || '',
      maternalGrandmotherId: bird.maternalGrandmotherId || '',
      cageId: bird.cageId || '',
      status: bird.status,
      notes: bird.notes || '',
      entryDate: bird.entryDate,
      isPublic: bird.isPublic,
      photoUrl: bird.photoUrl || '',
      ancestry: bird.ancestry || {}
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ringNumber) {
      alert('Por favor, informe ao menos o Nome e o Número da Anilha.');
      return;
    }

    const currentFather = selectedFatherId ? birds.find(b => b.id === selectedFatherId) : (formData.fatherRing ? birds.find(b => b.ringNumber === formData.fatherRing) : (formData.fatherName ? birds.find(b => b.name === formData.fatherName) : null));
    const currentMother = selectedMotherId ? birds.find(b => b.id === selectedMotherId) : (formData.motherRing ? birds.find(b => b.ringNumber === formData.motherRing) : (formData.motherName ? birds.find(b => b.name === formData.motherName) : null));
    
    let finalAncestry = { ...(formData.ancestry || {}) };
    if ((currentFather || currentMother) && Object.keys(finalAncestry).length <= 2) {
      const inherited = inheritFullAncestryFromCouple(currentFather, currentMother, birds);
      finalAncestry = { ...finalAncestry, ...inherited };
    }

    if (editingBird) {
      db.updateBird(editingBird.id, { ...formData, ancestry: finalAncestry });
    } else {
      db.addBird({
        tenantId: tenant?.id || 'tenant-demo-01',
        ...formData,
        ancestry: finalAncestry
      });
    }

    loadBirds();
    setIsFormModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover a ave "${name}" do plantel?`)) {
      db.deleteBird(id);
      loadBirds();
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredBirds.map(b => ({
      Nome: b.name,
      Apelido: b.nickname || '',
      Anilha: b.ringNumber,
      Espécie: b.species,
      Sexo: b.sex === 'MALE' ? 'Macho' : b.sex === 'FEMALE' ? 'Fêmea' : 'Indefinido',
      Status: b.status,
      Nascimento: b.birthDate || '',
      Gaiola: b.cageId || '',
      Mutação: b.mutation || '',
      Pai: b.fatherName || '',
      Mãe: b.motherName || '',
      Entrada: b.entryDate || ''
    }));
    exportToExcel(exportData, `Plantel_${tenant?.slug || 'birdpro'}_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportCsv = () => {
    const exportData = filteredBirds.map(b => ({
      Nome: b.name,
      Anilha: b.ringNumber,
      Especie: b.species,
      Sexo: b.sex,
      Status: b.status,
      Gaiola: b.cageId || ''
    }));
    exportToCsv(exportData, `Plantel_${tenant?.slug || 'birdpro'}`);
  };

  return (
    <div className="space-y-3 pb-16 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Pássaro</span>
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-md border border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-slate-700 text-xs font-semibold">
          <span className="text-sm">≡</span>
          <span>Painel de Pássaro ({birds.length} cadastrados)</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Dropdown */}
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded border border-slate-300 flex items-center space-x-1 transition"
            title="Exportar Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Excel</span>
          </button>

          {/* New Bird Button */}
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-semibold rounded flex items-center space-x-1 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Cadastrar Pássaro</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-md border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center space-x-0">
          {/* Dropdown Field */}
          <div className="relative">
            <select
              value={selectedSpecies ? 'especie' : selectedSex ? 'sexo' : 'ave'}
              onChange={(e) => {
                if (e.target.value === 'todos') {
                  setSearch('');
                  setSelectedSpecies('');
                  setSelectedSex('');
                }
              }}
              className="h-9 px-3 bg-slate-50 border border-slate-300 rounded-l text-xs text-slate-700 focus:outline-none focus:border-[#00c853] border-r-0 cursor-pointer"
            >
              <option value="ave">Ave / Nome</option>
              <option value="anilha">Anilha</option>
              <option value="especie">Espécie</option>
              <option value="sexo">Sexo</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisa"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c853]"
            />
          </div>

          {/* Clear Button (Red/Coral) */}
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedSpecies('');
              setSelectedSex('');
              setSelectedStatus('');
            }}
            className="h-9 px-3 bg-[#e57373] hover:bg-[#ef5350] text-white flex items-center justify-center transition"
            title="Limpar filtros"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          {/* Submit Search Button (Blue) */}
          <button
            type="button"
            className="h-9 px-4 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-semibold rounded-r flex items-center space-x-1.5 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSelectedStatus('')}
          className={`py-2 px-4 border-b-2 transition ${
            !selectedStatus
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Plantel
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('BREEDING')}
          className={`py-2 px-4 border-b-2 transition ${
            selectedStatus === 'BREEDING'
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Em Reprodução
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('FOR_SALE')}
          className={`py-2 px-4 border-b-2 transition ${
            selectedStatus === 'FOR_SALE'
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          À Venda
        </button>
      </div>

      {/* Bird Cards List (Standard MyBirds Design) */}
      <div className="space-y-3 pt-2">
        {filteredBirds.length === 0 ? (
          <div className="bg-white rounded-md border border-slate-200 p-8 text-center text-xs text-slate-400">
            Nenhuma ave encontrada no plantel com os critérios de busca selecionados.
          </div>
        ) : (
          filteredBirds.map((bird) => (
            <div 
              key={bird.id}
              className="bg-white rounded-md border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition"
            >
              {/* Header: Icon + Name + Anilha */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="text-slate-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <path d="M3 15l4-8 5 4 7-7 2 5-6 6-5-2-4 2z" />
                  </svg>
                </div>
                <Link href={`/dashboard/aves/${bird.id}`} className="text-xs font-bold text-slate-900 hover:text-[#00c853] tracking-wide uppercase">
                  {bird.name}
                </Link>
                <span className="text-xs text-slate-500">
                  - Anilha: {bird.ringNumber || 'Sem Anilha'}
                </span>
              </div>

              {/* Grid 3 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-y-1.5 text-xs text-slate-600 items-center">
                {/* Col 1 */}
                <div className="md:col-span-4 space-y-0.5">
                  <p>
                    <span className="text-slate-500">Ave Pai: </span>
                    <span className="font-semibold text-slate-800">{bird.fatherName || 'Não Informado'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Situação: </span>
                    <span className="font-medium text-slate-700">{bird.status === 'BREEDING' ? 'Em Reprodução' : bird.status === 'FOR_SALE' ? 'À Venda' : 'Plantel'}</span>
                  </p>
                </div>

                {/* Col 2 */}
                <div className="md:col-span-4 space-y-0.5">
                  <p>
                    <span className="text-slate-500">Ave Mãe: </span>
                    <span className="font-semibold text-slate-800">{bird.motherName || 'Não Informado'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Sexo: </span>
                    <span className="font-medium text-slate-700">
                      {bird.sex === 'MALE' ? 'Macho' : bird.sex === 'FEMALE' ? 'Fêmea' : 'Indefinido'}
                    </span>
                  </p>
                </div>

                {/* Col 3: Espécie */}
                <div className="md:col-span-2 space-y-0.5">
                  <p>
                    <span className="text-slate-500">Espécie: </span>
                    <span className="font-medium text-slate-800">{bird.species}</span>
                  </p>
                </div>

                {/* Action Buttons (Right Aligned) */}
                <div className="md:col-span-2 flex items-center justify-end space-x-1.5 pt-2 md:pt-0">
                  {/* 1. Imprimir Árvore Genealógica (Certificado A4) */}
                  <button
                    type="button"
                    onClick={() => setPedigreeModalBird(bird)}
                    className="w-7 h-7 bg-[#212830] hover:bg-slate-800 text-white rounded flex items-center justify-center transition shadow-xs"
                    title="Imprimir Árvore Genealógica (Certificado A4)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  {/* 2. Imprimir Etiqueta da Gaiola (Tooltip: Etiqueta da Gaiola) */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setBadgeModalBird(bird)}
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
                    title="Editar Ave"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* 4. Excluir */}
                  <button
                    type="button"
                    onClick={() => handleDelete(bird.id, bird.name)}
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

      {/* Form Modal (Create / Edit Bird) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingBird ? `Editar Ave: ${editingBird.name}` : 'Cadastrar Nova Ave no Plantel'}
        description="Preencha os dados cadastrais, anilha, linhagem e localização da ave."
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Section 1: Identificação Básica */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-100 pb-1">
              1. Identificação Principal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Ave *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Soberano Real"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Apelido (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: O Campeão"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Número da Anilha *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: FOB-2026-BR-0891"
                  value={formData.ringNumber}
                  onChange={(e) => setFormData({ ...formData, ringNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <SpeciesCombobox
                  label="Espécie"
                  required
                  value={formData.species}
                  onChange={(sp) => setFormData({ ...formData, species: sp })}
                  plantelBirds={birds}
                  inputClassName="rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sexo *</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value as BirdSex })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="MALE">♂ Macho</option>
                  <option value="FEMALE">♀ Fêmea</option>
                  <option value="UNKNOWN">? Indefinido / Em sexagem</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Data de Nascimento (Manual DD/MM/AAAA)
                </label>
                <DateManualInput
                  value={formData.birthDate}
                  onChange={(val) => setFormData({ ...formData, birthDate: val })}
                  placeholder="DD/MM/AAAA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Genética & Características */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-100 pb-1">
              2. Mutação, Cor & Características
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mutação / Fator</label>
                <input
                  type="text"
                  placeholder="Ex: Amarelo Nevado, Albino, Pastel"
                  value={formData.mutation}
                  onChange={(e) => setFormData({ ...formData, mutation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cor Predominante</label>
                <input
                  type="text"
                  placeholder="Ex: Amarelo Ouro com peito suave"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Foto da Ave</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL ou arquivo da foto..."
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <label className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-[11px] cursor-pointer whitespace-nowrap flex items-center gap-1 transition shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setFormData({ ...formData, photoUrl: ev.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Genealogia / Pais */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                3. Ascendência (Genealogia Completa)
              </h4>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                🌱 Puxa toda a árvore cadastrada (Pais, Avós, Bisavós e Trisavós)
              </span>
            </div>

            {ancestryMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{ancestryMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                <span className="font-bold text-blue-900 block text-[11px]">♂ Informações do Pai</span>
                <div>
                  <label className="block text-[10px] font-bold text-blue-700 mb-1">
                    Puxar Pai do Plantel com Árvore Completa
                  </label>
                  <select
                    value={selectedFatherId}
                    onChange={(e) => handleSelectFather(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="">-- Selecionar Pai cadastrado --</option>
                    {birds.filter(b => b.sex !== 'FEMALE' && (!editingBird || b.id !== editingBird.id)).map(b => (
                      <option key={b.id} value={b.id}>
                        ♂ {b.name} {b.ringNumber ? `(${b.ringNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Nome do Pai</label>
                  <input
                    type="text"
                    placeholder="Nome do Pai (Ex: Trovão Negro)"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Anilha do Pai</label>
                  <input
                    type="text"
                    placeholder="Anilha do Pai (Ex: FOB-2022-BR-0112)"
                    value={formData.fatherRing}
                    onChange={(e) => setFormData({ ...formData, fatherRing: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 space-y-2">
                <span className="font-bold text-rose-900 block text-[11px]">♀ Informações da Mãe</span>
                <div>
                  <label className="block text-[10px] font-bold text-rose-700 mb-1">
                    Puxar Mãe do Plantel com Árvore Completa
                  </label>
                  <select
                    value={selectedMotherId}
                    onChange={(e) => handleSelectMother(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="">-- Selecionar Mãe cadastrada --</option>
                    {birds.filter(b => b.sex !== 'MALE' && (!editingBird || b.id !== editingBird.id)).map(b => (
                      <option key={b.id} value={b.id}>
                        ♀ {b.name} {b.ringNumber ? `(${b.ringNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Nome da Mãe</label>
                  <input
                    type="text"
                    placeholder="Nome da Mãe (Ex: Rainha do Ouro)"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Anilha da Mãe</label>
                  <input
                    type="text"
                    placeholder="Anilha da Mãe (Ex: FOB-2023-BR-0445)"
                    value={formData.motherRing}
                    onChange={(e) => setFormData({ ...formData, motherRing: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Situação, Gaiola e Status */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-100 pb-1">
              4. Acomodação & Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gaiola / Viveiro</label>
                <select
                  value={formData.cageId}
                  onChange={(e) => setFormData({ ...formData, cageId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="">Sem Gaiola Definida</option>
                  {cages.map(c => (
                    <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Atual *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as BirdStatus })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="ACTIVE">Ativa</option>
                  <option value="BREEDING">Em Reprodução</option>
                  <option value="FOR_SALE">À Venda</option>
                  <option value="IN_TREATMENT">Em Tratamento Clínico</option>
                  <option value="QUARANTINE">Quarentena</option>
                  <option value="TRANSFERRED">Transferida</option>
                  <option value="DECEASED">Falecida</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Origem</label>
                <select
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="BRED_HERE">Nascida no Criatório</option>
                  <option value="PURCHASED">Adquirida / Comprada</option>
                  <option value="EXCHANGED">Troca / Permuta</option>
                  <option value="GIFT">Doação / Presente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Observações Gerais</label>
              <textarea
                rows={2}
                placeholder="Detalhes adicionais de comportamento, histórico sanitário ou torneios..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingBird ? 'Salvar Alterações' : 'Cadastrar Ave no Plantel'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Modal */}
      {qrModalBird && (
        <QRModal
          isOpen={!!qrModalBird}
          onClose={() => setQrModalBird(null)}
          title={qrModalBird.name}
          subtitle={`${qrModalBird.species} • ${qrModalBird.mutation || 'Ancestral'}`}
          value={typeof window !== 'undefined' ? `${window.location.origin}/ave/${qrModalBird.id}` : `https://birdpro.com/ave/${qrModalBird.id}`}
          type="BIRD"
          identifier={qrModalBird.ringNumber}
        />
      )}

      {/* Print Badge Modal */}
      {badgeModalBird && tenant && (
        <PrintBadgeModal
          isOpen={!!badgeModalBird}
          onClose={() => setBadgeModalBird(null)}
          bird={badgeModalBird}
          tenant={tenant}
        />
      )}

      {/* Print Pedigree Modal */}
      {pedigreeModalBird && tenant && (
        <PrintPedigreeModal
          isOpen={!!pedigreeModalBird}
          onClose={() => setPedigreeModalBird(null)}
          bird={pedigreeModalBird}
          tenant={tenant}
        />
      )}
    </div>
  );
}

export default function BirdsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Carregando plantel...</div>}>
      <BirdsContent />
    </Suspense>
  );
}


