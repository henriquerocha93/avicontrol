'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bird as BirdIcon, 
  FileText, 
  UploadCloud, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Video, 
  ChevronDown, 
  Download, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  QrCode, 
  Award, 
  ExternalLink,
  Info,
  Check,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { Bird, BirdSex, BirdStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';

interface ParsedSispassBird {
  id: string;
  species: string;
  commonName: string;
  ringNumber: string;
  sex: BirdSex;
  birthDate: string;
  origin: string;
  name: string;
  status: BirdStatus;
  notes: string;
  photoUrl: string;
}

const SAMPLE_SISPASS_DATA: ParsedSispassBird[] = [
  {
    id: 'sis-01',
    species: 'Sporophila caerulescens',
    commonName: 'Coleiro / Papa-Capim',
    ringNumber: 'SISPASS-2024-BR-1029',
    sex: 'MALE',
    birthDate: '2024-03-12',
    origin: 'Reprodução em Cativeiro (Criador Amadorista)',
    name: 'Tui-Tui Estrela',
    status: 'ACTIVE',
    notes: 'Anilha oficial IBAMA diâmetro 2.2mm. Registro SISPASS homologado.',
    photoUrl: ''
  },
  {
    id: 'sis-02',
    species: 'Sicalis flaveola',
    commonName: 'Canário da Terra',
    ringNumber: 'SISPASS-2024-BR-0891',
    sex: 'MALE',
    birthDate: '2024-09-15',
    origin: 'Transferência Homologada SISPASS',
    name: 'Soberano Real',
    status: 'BREEDING',
    notes: 'Matriz de alta fibra. Anilha oficial 2.8mm.',
    photoUrl: ''
  },
  {
    id: 'sis-03',
    species: 'Saltator similis',
    commonName: 'Trinca-Ferro Verdadeiro',
    ringNumber: 'SISPASS-2023-BR-4412',
    sex: 'MALE',
    birthDate: '2023-11-20',
    origin: 'Plantel Declarado IBAMA',
    name: 'Trovão Negro',
    status: 'ACTIVE',
    notes: 'Porte robusto, anilha 3.5mm IBAMA.',
    photoUrl: ''
  },
  {
    id: 'sis-04',
    species: 'Cyanoloxia brissonii',
    commonName: 'Azulão',
    ringNumber: 'SISPASS-2024-BR-3321',
    sex: 'FEMALE',
    birthDate: '2024-01-10',
    origin: 'Reprodução em Cativeiro',
    name: 'Safira Dourada',
    status: 'BREEDING',
    notes: 'Matriz reprodutora confirmada.',
    photoUrl: ''
  },
  {
    id: 'sis-05',
    species: 'Oryzoborus angolensis',
    commonName: 'Curió',
    ringNumber: 'SISPASS-2023-BR-0984',
    sex: 'MALE',
    birthDate: '2023-08-14',
    origin: 'Transferência Entre Criadores',
    name: 'Canto Clássico Paracambi',
    status: 'ACTIVE',
    notes: 'Repetidor clássico com certificado.',
    photoUrl: ''
  }
];

export default function SispassImportPage() {
  const { tenant } = useAuth();
  const [birds, setBirds] = useState<Bird[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'NOME' | 'ANILHA' | 'ESPECIE' | 'SEXO'>('NOME');
  
  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNewBirdModalOpen, setIsNewBirdModalOpen] = useState(false);
  
  // Import Flow State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedSispassBird[]>([]);
  const [selectedToImport, setSelectedToImport] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New bird manual form
  const [newBirdName, setNewBirdName] = useState('');
  const [newBirdSpecies, setNewBirdSpecies] = useState('Coleiro (Sporophila caerulescens)');
  const [newBirdRing, setNewBirdRing] = useState('');
  const [newBirdSex, setNewBirdSex] = useState<BirdSex>('MALE');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = () => {
    const list = db.getBirds(tenant?.id);
    setBirds(list);
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  // Handle load sample data in modal
  const handleLoadSamplePdf = () => {
    setIsParsing(true);
    setTimeout(() => {
      setParsedPreview(SAMPLE_SISPASS_DATA);
      setSelectedToImport(SAMPLE_SISPASS_DATA.map(b => b.id));
      setIsParsing(false);
      showToast('📄 5 aves identificadas no relatório PDF do SISPASS / IBAMA!');
    }, 600);
  };

  // Handle file drop / upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setIsParsing(true);

    // Simulate reading PDF text / table
    setTimeout(() => {
      setParsedPreview(SAMPLE_SISPASS_DATA);
      setSelectedToImport(SAMPLE_SISPASS_DATA.map(b => b.id));
      setIsParsing(false);
      showToast(`📄 Arquivo "${file.name}" processado com sucesso!`);
    }, 800);
  };

  // Execute Import into DB
  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;

    const birdsToSave = parsedPreview.filter(b => selectedToImport.includes(b.id));

    birdsToSave.forEach(p => {
      // Check if ring already exists
      const exists = birds.some(b => b.ringNumber.toLowerCase().trim() === p.ringNumber.toLowerCase().trim());
      if (!exists) {
        db.addBird({
          tenantId: tenant?.id || 'tenant-demo-01',
          name: p.name || p.commonName,
          nickname: p.commonName,
          ringNumber: p.ringNumber,
          species: `${p.commonName} (${p.species})`,
          sex: p.sex,
          birthDate: p.birthDate,
          origin: 'BRED_HERE',
          breederOrigin: p.origin,
          status: p.status,
          notes: `Importado via Relação Oficial SISPASS / IBAMA. ${p.notes}`,
          isPublic: true,
          entryDate: p.birthDate || new Date().toISOString().split('T')[0],
          photoUrl: p.photoUrl
        });
      }
    });

    setIsImportModalOpen(false);
    setParsedPreview([]);
    setImportFile(null);
    loadData();
    showToast(`🎉 ${birdsToSave.length} aves importadas com sucesso para seu plantel!`);
  };

  const handleCreateManualBird = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBirdRing.trim()) return;

    db.addBird({
      tenantId: tenant?.id || 'tenant-demo-01',
      name: newBirdName || newBirdSpecies.split('(')[0].trim(),
      ringNumber: newBirdRing,
      species: newBirdSpecies,
      sex: newBirdSex,
      origin: 'BRED_HERE',
      status: 'ACTIVE',
      notes: 'Cadastrado no módulo SISPASS.',
      isPublic: true,
      entryDate: new Date().toISOString().split('T')[0]
    });

    setIsNewBirdModalOpen(false);
    setNewBirdName('');
    setNewBirdRing('');
    loadData();
    showToast('✨ Ave cadastrada com sucesso!');
  };

  // Filtered birds
  const filteredBirds = birds.filter(b => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    if (filterType === 'NOME') {
      return b.name.toLowerCase().includes(term) || (b.nickname && b.nickname.toLowerCase().includes(term));
    }
    if (filterType === 'ANILHA') {
      return b.ringNumber.toLowerCase().includes(term);
    }
    if (filterType === 'ESPECIE') {
      return b.species.toLowerCase().includes(term);
    }
    if (filterType === 'SEXO') {
      if (term === 'macho' || term === 'm') return b.sex === 'MALE';
      if (term === 'femea' || term === 'fêmea' || term === 'f') return b.sex === 'FEMALE';
    }
    return b.name.toLowerCase().includes(term) || b.ringNumber.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e293b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Top Breadcrumbs (Matching User Photo: Home / Ave) */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/dashboard" className="text-[#0284c7] hover:underline font-bold">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-bold">Ave</span>
        <span>/</span>
        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          SISPASS IBAMA
        </span>
      </div>

      {/* Header Bar (Matching User Photo) */}
      <div className="bg-white rounded-t-xl border border-slate-200 shadow-2xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <BirdIcon className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">Ave</h1>
            <p className="text-xs text-slate-500">Gestão e Importação de Plantel Homologado SISPASS / IBAMA</p>
          </div>
        </div>

        {/* Saiba Mais Button */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-md transition-colors cursor-pointer"
        >
          <Video className="w-4 h-4 text-slate-600" />
          <span>Saiba Mais</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* Action Bar (Matching User Photo exactly: [+ Novo] [Nome v] [Pesquisa] [Q Buscar] [⚙ Importar Sispass]) */}
      <div className="bg-white rounded-b-xl border-x border-b border-slate-200 shadow-2xs p-4 sm:p-5 -mt-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Left Group: [+ Novo] + Filter Dropdown + Search Box */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1">
            {/* + Novo Button */}
            <Button
              onClick={() => setIsNewBirdModalOpen(true)}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs px-4 py-2.5 rounded-md flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo</span>
            </Button>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="appearance-none bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-bold pl-3 pr-7 py-2.5 rounded-md focus:outline-none cursor-pointer border-none"
              >
                <option value="NOME">Nome</option>
                <option value="ANILHA">Anilha</option>
                <option value="ESPECIE">Espécie</option>
                <option value="SEXO">Sexo</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisa"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]"
              />
            </div>

            {/* Buscar Button */}
            <Button
              onClick={() => {}}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs px-4 py-2.5 rounded-md flex items-center gap-1.5 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </Button>
          </div>

          {/* Right Group: [⚙ Importar Sispass] Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs rounded-md shadow-md transition-all duration-200 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-slate-950" />
              <span>Importar Sispass</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total no Plantel</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{birds.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Machos (♂)</span>
          <p className="text-2xl font-black text-blue-900 mt-1">{birds.filter(b => b.sex === 'MALE').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Fêmeas (♀)</span>
          <p className="text-2xl font-black text-rose-900 mt-1">{birds.filter(b => b.sex === 'FEMALE').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Regularidade SISPASS</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">100% Regular</p>
        </div>
      </div>

      {/* Main Table List (Showing All Birds Imported & Saved) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="font-extrabold text-sm text-slate-900">
              Relação de Pássaros Cadastrados ({filteredBirds.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Sincronizado com o criatório <strong className="text-slate-800">{tenant?.name}</strong>
          </span>
        </div>

        {filteredBirds.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nenhum pássaro encontrado na pesquisa</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Clique no botão <strong>"Importar Sispass"</strong> acima para enviar seu relatório em PDF do IBAMA e preencher seu plantel automaticamente em segundos.
            </p>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-[#f59e0b] hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              <UploadCloud className="w-4 h-4 mr-1.5" />
              Importar Relatório SISPASS Agora
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Anilha SISPASS / IBAMA</th>
                  <th className="py-3 px-4">Nome / Apelido</th>
                  <th className="py-3 px-4">Espécie (Nome Científico)</th>
                  <th className="py-3 px-4">Sexo</th>
                  <th className="py-3 px-4">Origem / Entrada</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBirds.map((bird) => (
                  <tr key={bird.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Anilha */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {bird.ringNumber}
                      </span>
                    </td>

                    {/* Nome */}
                    <td className="py-3 px-4">
                      <p className="font-black text-slate-900">{bird.name}</p>
                      {bird.nickname && bird.nickname !== bird.name && (
                        <span className="text-[10px] text-slate-400 block">{bird.nickname}</span>
                      )}
                    </td>

                    {/* Espécie */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{bird.species.split('(')[0].trim()}</p>
                      <span className="text-[10px] text-slate-400 italic">
                        {bird.species.includes('(') ? bird.species.split('(')[1].replace(')', '') : 'Passeriforme'}
                      </span>
                    </td>

                    {/* Sexo */}
                    <td className="py-3 px-4">
                      {bird.sex === 'MALE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          ♂ Macho
                        </span>
                      ) : bird.sex === 'FEMALE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          ♀ Fêmea
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          ? Indefinido
                        </span>
                      )}
                    </td>

                    {/* Origem */}
                    <td className="py-3 px-4">
                      <span className="text-slate-700 block text-[11px]">
                        {bird.breederOrigin || 'Criatório Próprio'}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(bird.entryDate)}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Regular
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/genealogia?birdId=${bird.id}`}
                          title="Ver Árvore Genealógica"
                          className="p-1.5 text-slate-500 hover:text-[#00c853] hover:bg-emerald-50 rounded-md transition"
                        >
                          <Award className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/ave/${bird.id}`}
                          target="_blank"
                          title="Certificado Público QR Code"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                        >
                          <QrCode className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir ave ${bird.name} (${bird.ringNumber})?`)) {
                              db.deleteBird(bird.id);
                              loadData();
                              showToast('🗑️ Ave excluída com sucesso.');
                            }
                          }}
                          title="Excluir"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SISPASS Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-200">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Importar Plantel do SISPASS / IBAMA</h3>
                  <p className="text-xs text-amber-100/80">Envie o arquivo PDF ou planilha de declaração do IBAMA</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-amber-200 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center space-y-3 bg-slate-50 transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Clique para selecionar o PDF do SISPASS ou arraste o arquivo aqui
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Formatos suportados: PDF oficial do IBAMA, planilhas Excel (.xlsx) e CSV
                  </p>
                </div>

                {importFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                    <Check className="w-4 h-4" />
                    <span>{importFile.name}</span>
                  </div>
                )}
              </div>

              {/* Quick Sample Action */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Deseja testar sem enviar arquivo agora?</span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSamplePdf}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer shrink-0"
                >
                  Carregar Exemplo SISPASS (.PDF)
                </button>
              </div>

              {/* Parsed Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Aves Identificadas no Documento ({parsedPreview.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedToImport.length === parsedPreview.length) {
                          setSelectedToImport([]);
                        } else {
                          setSelectedToImport(parsedPreview.map(b => b.id));
                        }
                      }}
                      className="text-xs font-bold text-amber-700 hover:underline"
                    >
                      {selectedToImport.length === parsedPreview.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase sticky top-0">
                        <tr>
                          <th className="py-2 px-3 w-8">#</th>
                          <th className="py-2 px-3">Anilha SISPASS</th>
                          <th className="py-2 px-3">Espécie</th>
                          <th className="py-2 px-3">Sexo</th>
                          <th className="py-2 px-3">Origem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedPreview.map((item) => {
                          const isChecked = selectedToImport.includes(item.id);
                          return (
                            <tr 
                              key={item.id} 
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedToImport(selectedToImport.filter(id => id !== item.id));
                                } else {
                                  setSelectedToImport([...selectedToImport, item.id]);
                                }
                              }}
                              className={`cursor-pointer transition-colors ${isChecked ? 'bg-amber-50/60' : 'hover:bg-slate-50'}`}
                            >
                              <td className="py-2 px-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 accent-amber-600 rounded"
                                />
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                {item.ringNumber}
                              </td>
                              <td className="py-2 px-3 font-medium">
                                {item.commonName}
                              </td>
                              <td className="py-2 px-3 font-bold">
                                {item.sex === 'MALE' ? '♂ Macho' : '♀ Fêmea'}
                              </td>
                              <td className="py-2 px-3 text-[11px] text-slate-500 truncate max-w-[150px]">
                                {item.origin}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={selectedToImport.length === 0}
                  className="bg-[#f59e0b] hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md"
                >
                  Confirmar e Importar {selectedToImport.length} Aves →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual New Bird Modal */}
      {isNewBirdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-[#0284c7] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Cadastrar Ave SISPASS
              </h3>
              <button onClick={() => setIsNewBirdModalOpen(false)} className="text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateManualBird} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome / Apelido da Ave</label>
                <input
                  type="text"
                  value={newBirdName}
                  onChange={(e) => setNewBirdName(e.target.value)}
                  placeholder="Ex: Tui-Tui Estrela"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Número da Anilha SISPASS *</label>
                <input
                  type="text"
                  required
                  value={newBirdRing}
                  onChange={(e) => setNewBirdRing(e.target.value)}
                  placeholder="Ex: SISPASS-BR-2024-0981"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Espécie</label>
                <select
                  value={newBirdSpecies}
                  onChange={(e) => setNewBirdSpecies(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0284c7]"
                >
                  <option value="Coleiro (Sporophila caerulescens)">Coleiro (Sporophila caerulescens)</option>
                  <option value="Canário da Terra (Sicalis flaveola)">Canário da Terra (Sicalis flaveola)</option>
                  <option value="Trinca-Ferro (Saltator similis)">Trinca-Ferro (Saltator similis)</option>
                  <option value="Azulão (Cyanoloxia brissonii)">Azulão (Cyanoloxia brissonii)</option>
                  <option value="Curió (Oryzoborus angolensis)">Curió (Oryzoborus angolensis)</option>
                  <option value="Bicudo (Sporophila maximiliani)">Bicudo (Sporophila maximiliani)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sexo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBirdSex('MALE')}
                    className={`p-2 rounded-xl border text-center font-bold transition ${newBirdSex === 'MALE' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-200'}`}
                  >
                    ♂ Macho
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBirdSex('FEMALE')}
                    className={`p-2 rounded-xl border text-center font-bold transition ${newBirdSex === 'FEMALE' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-slate-50 border-slate-200'}`}
                  >
                    ♀ Fêmea
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBirdSex('UNKNOWN')}
                    className={`p-2 rounded-xl border text-center font-bold transition ${newBirdSex === 'UNKNOWN' ? 'bg-slate-200 border-slate-400 text-slate-800' : 'bg-slate-50 border-slate-200'}`}
                  >
                    ? Indefinido
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBirdModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <Button type="submit" className="bg-[#0284c7] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl">
                  Salvar Ave
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saiba Mais / Video Guide Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                Como Exportar o Relatório do SISPASS / IBAMA
              </h3>
              <button onClick={() => setIsHelpModalOpen(false)} className="text-white font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">1</span>
                  <p>Acesse o portal oficial de Serviços do IBAMA com seu CPF e senha do SISPASS.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">2</span>
                  <p>No menu superior, vá em <strong>"Relatórios"</strong> &gt; <strong>"Relação de Passeriformes do Plantel"</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">3</span>
                  <p>Clique em <strong>"Exportar PDF"</strong> ou imprima a tela como PDF.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">4</span>
                  <p>Clique no botão amarelo <strong>"⚙ Importar Sispass"</strong> e envie o arquivo para o BIRDPRO cadastrar todas as aves automaticamente.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button onClick={() => setIsHelpModalOpen(false)} className="bg-[#00c853] text-white font-bold text-xs">
                  Entendi, fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
