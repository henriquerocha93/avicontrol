'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Bird, 
  ArrowLeft, 
  QrCode, 
  Printer, 
  Award, 
  Edit, 
  Calendar, 
  MapPin, 
  Clock, 
  Heart, 
  Activity, 
  Pill, 
  FileText, 
  Camera, 
  Sparkles, 
  Dna, 
  BrainCircuit, 
  ShieldCheck, 
  Share2, 
  Plus, 
  Trash2,
  ExternalLink,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { 
  Bird as BirdType, 
  BirdTimelineEvent, 
  SexingRecord, 
  GenotypingRecord, 
  Treatment, 
  DiseaseRecord, 
  BirdDocument, 
  BirdPhoto, 
  BreedingPair,
  BehaviorRecord
} from '@/types';
import { Button } from '@/components/ui/button';
import { SexBadge, StatusBadge, Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { QRModal } from '@/components/modals/qr-modal';
import { PrintBadgeModal } from '@/components/modals/print-badge-modal';
import { PrintPedigreeModal } from '@/components/modals/print-pedigree-modal';
import { formatDate, calculateAge, calculateInbreedingRisk } from '@/lib/utils';

export default function BirdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const birdId = params.id as string;
  const { tenant } = useAuth();

  const [bird, setBird] = useState<BirdType | null>(null);
  const [activeTab, setActiveTab] = useState('geral');

  // Modals
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const [isPedigreeOpen, setIsPedigreeOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);

  // New Event Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState<any>('NOTE');

  // Potential partner for inbreeding check
  const [compareBirdId, setCompareBirdId] = useState('');

  const loadBird = () => {
    const found = db.getBirdById(birdId);
    if (found) {
      setBird({ ...found });
    }
  };

  useEffect(() => {
    loadBird();
  }, [birdId]);

  if (!bird) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
        <Bird className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Ave não encontrada</h2>
        <p className="text-xs text-slate-500">O registro da ave solicitada não existe ou foi removido.</p>
        <Link href="/dashboard/aves">
          <Button variant="outline">Voltar para o Plantel</Button>
        </Link>
      </div>
    );
  }

  const allBirds = db.getBirds(tenant?.id);
  const timeline = db.getTimeline(bird.id, tenant?.id);
  const sexings = db.getSexings(tenant?.id).filter(s => s.birdId === bird.id);
  const genotyping = db.getGenotyping(tenant?.id).filter(g => g.birdId === bird.id);
  const treatments = db.getTreatments(tenant?.id).filter(t => t.birdId === bird.id);
  const diseases = db.getDiseases(tenant?.id).filter(d => d.birdId === bird.id);
  const documents = db.getDocuments(tenant?.id).filter(d => d.birdId === bird.id);
  const pairs = db.getPairs(tenant?.id).filter(p => p.maleId === bird.id || p.femaleId === bird.id);
  const cages = db.getCages(tenant?.id);
  const currentCage = cages.find(c => c.code === bird.cageId || c.id === bird.cageId);

  // Inbreeding risk check
  const compareBird = allBirds.find(b => b.id === compareBirdId);
  const inbreedingResult = calculateInbreedingRisk(bird, compareBird);

  const tabs = [
    { id: 'geral', label: 'Dados Gerais', icon: Bird },
    { id: 'timeline', label: 'Histórico & Timeline', icon: Clock, count: timeline.length },
    { id: 'genealogia', label: 'Genealogia Visual', icon: Award },
    { id: 'reproducao', label: 'Reprodução & Ninhadas', icon: Heart, count: pairs.length },
    { id: 'saude', label: 'Saúde & Prontuário', icon: Activity, count: diseases.length },
    { id: 'medicamentos', label: 'Medicamentos', icon: Pill, count: treatments.length },
    { id: 'sexagem', label: 'Sexagem DNA', icon: Sparkles, count: sexings.length },
    { id: 'genotipagem', label: 'Genotipagem', icon: Dna, count: genotyping.length },
    { id: 'documentos', label: 'Documentos & Laudos', icon: FileText, count: documents.length },
    { id: 'fotos', label: 'Galeria de Fotos', icon: Camera },
    { id: 'comportamento', label: 'Comportamento', icon: BrainCircuit },
  ];

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;
    db.addTimelineEvent({
      tenantId: tenant?.id || 'tenant-demo-01',
      birdId: bird.id,
      date: new Date().toISOString().split('T')[0],
      title: eventTitle,
      description: eventDesc,
      eventType: eventType,
      userName: 'Dr. Roberto Silveira'
    });
    setEventTitle('');
    setEventDesc('');
    setIsNewEventModalOpen(false);
    loadBird();
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/aves" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista do Plantel</span>
        </Link>

        <div className="flex items-center gap-2">
          {bird.isPublic && (
            <Link 
              href={`/ave/${bird.id}`} 
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
            >
              <span>Ver Perfil Público</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Bird Master Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Photo Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 shadow-md relative group">
              {bird.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bird.photoUrl} alt={bird.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Bird className="w-12 h-12" />
                  <span className="text-[10px] mt-1">Sem foto</span>
                </div>
              )}
            </div>

            {/* Bird Title & Key Attributes */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{bird.name}</h1>
                {bird.nickname && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    &quot;{bird.nickname}&quot;
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-900 text-emerald-400 rounded-lg">
                  {bird.ringNumber}
                </span>
                <SexBadge sex={bird.sex} />
                <StatusBadge status={bird.status} />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {bird.species} {bird.subspecies ? `• Subespécie: ${bird.subspecies}` : ''}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Idade: <strong>{calculateAge(bird.birthDate)}</strong> ({formatDate(bird.birthDate)})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Gaiola: <strong>{bird.cageId || 'Não definida'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsQrOpen(true)}>
              <QrCode className="w-4 h-4 mr-1.5 text-emerald-600" />
              QR Code
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsBadgeOpen(true)}>
              <Printer className="w-4 h-4 mr-1.5 text-blue-600" />
              Crachá
            </Button>
            <Button variant="emerald" size="sm" onClick={() => setIsPedigreeOpen(true)}>
              <Award className="w-4 h-4 mr-1.5" />
              Pedigree A4
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DADOS GERAIS */}
      {activeTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Informações Cadastrais & Biometria
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mutação / Fator Genético:</span>
                <p className="font-bold text-slate-800">{bird.mutation || 'Ancestral Selvagem'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cor / Plumagem:</span>
                <p className="font-bold text-slate-800">{bird.color || 'Padrão da espécie'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Raça / Linhagem de Canto:</span>
                <p className="font-bold text-slate-800">{bird.breed || 'Linhagem Clássica Selecionada'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Origem da Ave:</span>
                <p className="font-bold text-slate-800">
                  {bird.origin === 'BRED_HERE' ? 'Nascida no Criatório Próprio' : bird.origin}
                  {bird.breederOrigin ? ` (${bird.breederOrigin})` : ''}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Data de Entrada no Criatório:</span>
                <p className="font-bold text-slate-800">{formatDate(bird.entryDate)}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Localização / Gaiola Atual:</span>
                <p className="font-bold text-slate-800">{bird.location || bird.cageId || 'Não especificada'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Características & Notas de Manejo:</span>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {bird.features || 'Sem características morfológicas especiais registradas.'}
                {bird.notes ? ` Obs: ${bird.notes}` : ''}
              </p>
            </div>
          </div>

          {/* Quick Lineage Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Pais Registrados
            </h3>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider">♂ PAI</span>
              <p className="font-bold text-slate-900 text-sm">{bird.fatherName || 'Pai não informado'}</p>
              {bird.fatherRing && <p className="text-xs font-mono text-blue-800">Anilha: {bird.fatherRing}</p>}
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-rose-900 uppercase tracking-wider">♀ MÃE</span>
              <p className="font-bold text-slate-900 text-sm">{bird.motherName || 'Mãe não informada'}</p>
              {bird.motherRing && <p className="text-xs font-mono text-rose-800">Anilha: {bird.motherRing}</p>}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setActiveTab('genealogia')}
            >
              Abrir Árvore Genealógica Completa →
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: HISTÓRICO & TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Linha do Tempo Completa da Ave</h3>
              <p className="text-xs text-slate-500">Histórico cronológico de todos os eventos desde o nascimento</p>
            </div>
            <Button size="sm" onClick={() => setIsNewEventModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Novo Evento
            </Button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum evento registrado ainda.</p>
            ) : (
              timeline.map((event) => (
                <div key={event.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 border-4 border-white shadow-xs" />
                  
                  <div className="bg-slate-50 hover:bg-emerald-50/30 p-4 rounded-2xl border border-slate-200/80 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{event.title}</span>
                      <span className="text-[10px] font-medium text-slate-400">{formatDate(event.date)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                    <p className="text-[10px] text-slate-400 pt-1 font-medium">Registrado por: {event.userName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GENEALOGIA VISUAL & CONSANGUINIDADE */}
      {activeTab === 'genealogia' && (
        <div className="space-y-6">
          {/* Visual Family Tree */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 overflow-x-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Árvore Genealógica Multigeração</h3>
                <p className="text-xs text-slate-500">Navegue pelas 3 gerações de ascendência cadastradas</p>
              </div>
              <Button variant="emerald" size="sm" onClick={() => setIsPedigreeOpen(true)}>
                <Printer className="w-4 h-4 mr-1.5" />
                Imprimir Pedigree A4
              </Button>
            </div>

            {/* Tree Flow Visual Diagram */}
            <div className="min-w-[700px] p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-8 justify-center">
              {/* Target Bird (Gen 0) */}
              <div className="w-56 p-4 bg-emerald-600 text-white rounded-2xl shadow-lg text-center space-y-1 border-2 border-emerald-500">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">INDIVÍDUO PRINCIPAL</span>
                <p className="font-extrabold text-base">{bird.name}</p>
                <p className="text-xs font-mono text-emerald-100">{bird.ringNumber}</p>
                <SexBadge sex={bird.sex} className="bg-emerald-800 text-white border-none mt-1" />
              </div>

              <div className="text-slate-400 font-bold">←</div>

              {/* Parents (Gen 1) */}
              <div className="flex flex-col gap-6 w-60">
                {/* Father */}
                <div className="p-3.5 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-blue-800 uppercase">♂ PAI</span>
                  <p className="font-bold text-slate-900 text-xs">{bird.fatherName || 'Pai não cadastrado'}</p>
                  <p className="text-[10px] font-mono text-blue-700">{bird.fatherRing || '---'}</p>
                </div>

                {/* Mother */}
                <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-rose-800 uppercase">♀ MÃE</span>
                  <p className="font-bold text-slate-900 text-xs">{bird.motherName || 'Mãe não cadastrada'}</p>
                  <p className="text-[10px] font-mono text-rose-700">{bird.motherRing || '---'}</p>
                </div>
              </div>

              <div className="text-slate-400 font-bold">←</div>

              {/* Grandparents (Gen 2) */}
              <div className="flex flex-col gap-3 w-52 text-[11px]">
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Avô Paterno</span>
                  <p className="font-semibold text-slate-800">{bird.paternalGrandfatherId || 'Linha Elite 1'}</p>
                </div>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Avó Paterna</span>
                  <p className="font-semibold text-slate-800">{bird.paternalGrandmotherId || 'Linha Matriz 1'}</p>
                </div>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Avô Materno</span>
                  <p className="font-semibold text-slate-800">{bird.maternalGrandfatherId || 'Linha Campeã 2'}</p>
                </div>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Avó Materna</span>
                  <p className="font-semibold text-slate-800">{bird.maternalGrandmotherId || 'Linha Fecunda 2'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inbreeding Risk Simulator */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Simulador de Acasalamento & Alerta de Consanguinidade
            </h3>
            <p className="text-xs text-slate-500">
              Selecione um parceiro(a) potencial do plantel para calcular o risco de parentesco genético antes do pareamento.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecione o(a) parceiro(a) para simulação:
                </label>
                <select
                  value={compareBirdId}
                  onChange={(e) => setCompareBirdId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="">-- Escolha uma ave do plantel --</option>
                  {allBirds.filter(b => b.id !== bird.id).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.ringNumber}) - {b.sex === 'MALE' ? 'Macho' : b.sex === 'FEMALE' ? 'Fêmea' : 'Indefinido'}
                    </option>
                  ))}
                </select>
              </div>

              {compareBird && (
                <div className={`p-4 rounded-2xl border text-xs sm:col-span-3 ${
                  inbreedingResult.level === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                  inbreedingResult.level === 'HIGH' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {inbreedingResult.level === 'NONE' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>Resultado da Análise: {inbreedingResult.level === 'NONE' ? 'Cruzamento Recomendado (Seguro)' : `Alerta: Consanguinidade ${inbreedingResult.level}`}</span>
                  </div>
                  <p className="text-xs opacity-90">{inbreedingResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REPRODUÇÃO */}
      {activeTab === 'reproducao' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Histórico de Casais & Filhotes Gerados</h3>
              <p className="text-xs text-slate-500">Casais em que {bird.name} foi matriz/reprodutor</p>
            </div>
            <Link href="/dashboard/reproducao">
              <Button size="sm">Novo Acasalamento</Button>
            </Link>
          </div>

          {pairs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhum acasalamento registrado para esta ave.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pairs.map((pair) => (
                <div key={pair.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{pair.name}</span>
                    <Badge variant="purple">{pair.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">Macho: {pair.maleName} x Fêmea: {pair.femaleName}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{pair.clutchesCount} posturas</span>
                    <span>{pair.totalEggs} ovos</span>
                    <span className="text-emerald-700 font-bold">{pair.hatchedCount} filhotes eclodidos</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SAÚDE & PRONTUÁRIO */}
      {activeTab === 'saude' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Prontuário Sanitário & Ocorrências Clínicas</h3>
              <p className="text-xs text-slate-500">Histórico veterinário de diagnósticos e sintomas</p>
            </div>
            <Link href="/dashboard/saude">
              <Button size="sm">Registrar Ocorrência</Button>
            </Link>
          </div>

          {diseases.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhum registro clínico cadastrado. Ave saudável.</p>
          ) : (
            <div className="space-y-3">
              {diseases.map((dis) => (
                <div key={dis.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{dis.diseaseName}</span>
                    <Badge variant={dis.result === 'CURED' ? 'success' : 'danger'}>{dis.result}</Badge>
                  </div>
                  <p className="text-slate-600"><strong>Sintomas:</strong> {dis.symptoms}</p>
                  <p className="text-slate-600"><strong>Diagnóstico:</strong> {dis.diagnosis}</p>
                  <p className="text-slate-400 text-[10px]">Data: {formatDate(dis.diagnosedDate)} • Vet: {dis.veterinarian || 'Veterinário Responsável'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MEDICAMENTOS */}
      {activeTab === 'medicamentos' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Protocolos de Medicamentos & Tratamentos</h3>
              <p className="text-xs text-slate-500">Medicamentos administrados, dosagens e horários</p>
            </div>
            <Link href="/dashboard/medicamentos">
              <Button size="sm">Iniciar Tratamento</Button>
            </Link>
          </div>

          {treatments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhum tratamento médico em andamento.</p>
          ) : (
            <div className="space-y-3">
              {treatments.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{t.medicationName}</span>
                    <Badge variant={t.status === 'ACTIVE' ? 'warning' : 'default'}>{t.status}</Badge>
                  </div>
                  <p className="text-slate-600"><strong>Dosagem:</strong> {t.dosage} • <strong>Frequência:</strong> {t.frequency}</p>
                  <p className="text-slate-600"><strong>Período:</strong> {formatDate(t.startDate)} até {formatDate(t.endDate)}</p>
                  <p className="text-slate-400 text-[10px]">Responsável: {t.responsiblePerson}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: SEXAGEM DNA */}
      {activeTab === 'sexagem' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Laudos Laboratoriais de Sexagem Molecular</h3>
              <p className="text-xs text-slate-500">Certificados de DNA e identificação do sexo biológico</p>
            </div>
            <Link href="/dashboard/sexagem">
              <Button size="sm">Novo Laudo DNA</Button>
            </Link>
          </div>

          {sexings.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhum exame de sexagem anexado.</p>
          ) : (
            <div className="space-y-3">
              {sexings.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Laboratório {s.laboratory}</span>
                      <SexBadge sex={s.result} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Certificado: {s.certificateNumber || 'N/A'}</span>
                  </div>
                  <p className="text-slate-600">Método: {s.method} • Data do Laudo: {formatDate(s.resultDate)}</p>
                  {s.notes && <p className="text-slate-500 italic text-[11px]">&quot;{s.notes}&quot;</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: GENOTIPAGEM */}
      {activeTab === 'genotipagem' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Genotipagem & Mapeamento de Mutações</h3>
              <p className="text-xs text-slate-500">Genes portadores, fatores dominantes e recessivos</p>
            </div>
            <Link href="/dashboard/genotipagem">
              <Button size="sm">Cadastrar Mapeamento</Button>
            </Link>
          </div>

          {genotyping.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhum mapeamento genético registrado.</p>
          ) : (
            <div className="space-y-3">
              {genotyping.map((g) => (
                <div key={g.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Laudo Genômico: {g.laboratory}</span>
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {g.geneticCode || 'CÓD-GEN'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-[11px]">Mutações Confirmadas:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {g.mutationsIdentified.map((m, i) => (
                        <Badge key={i} variant="success">{m}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block text-[11px] mt-2">Genes Portadores (Recessivos):</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {g.carrierGenes.map((c, i) => (
                        <Badge key={i} variant="purple">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: DOCUMENTOS */}
      {activeTab === 'documentos' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Documentos, Notas Fiscais & Certificados</h3>
              <p className="text-xs text-slate-500">Arquivos anexados a esta ave</p>
            </div>
            <Link href="/dashboard/documentos">
              <Button size="sm">Anexar Documento</Button>
            </Link>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhum documento anexado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{doc.title}</span>
                    <Badge variant="info">{doc.category}</Badge>
                  </div>
                  <p className="text-slate-500">{doc.fileName} • {doc.fileSize}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 10: FOTOS */}
      {activeTab === 'fotos' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Galeria de Fotos da Ave</h3>
              <p className="text-xs text-slate-500">Histórico visual do desenvolvimento da ave</p>
            </div>
            <Link href="/dashboard/fotos">
              <Button size="sm">Adicionar Foto</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bird.photoUrl && (
              <div className="rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bird.photoUrl} alt={bird.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 11: COMPORTAMENTO */}
      {activeTab === 'comportamento' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Avaliação Comportamental & Temperamento</h3>
            <p className="text-xs text-slate-500">Scores de 1 a 5 para características zootécnicas e canto</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">Docilidade / Mansidão</span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                ★★★★★ <span className="text-slate-700 text-xs ml-1">(5/5)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">Fibra / Canto em Torneio</span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                ★★★★★ <span className="text-slate-700 text-xs ml-1">(5/5)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">Instinto Maternal / Choco</span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                ★★★★☆ <span className="text-slate-700 text-xs ml-1">(4/5)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Evento Timeline */}
      <Modal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        title="Registrar Novo Evento na Timeline"
        description={`Adicione uma ocorrência ou marco na história de ${bird.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleAddTimelineEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Título do Evento *</label>
            <input
              type="text"
              required
              placeholder="Ex: Troca de Gaiola, Campeonato Paulista, etc."
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipo de Evento</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="NOTE">Anotação Geral</option>
              <option value="CAGE_TRANSFER">Transferência de Gaiola</option>
              <option value="TREATMENT">Tratamento Clínico</option>
              <option value="BREEDING">Acasalamento / Postura</option>
              <option value="SEXING">Sexagem DNA</option>
              <option value="GENETICS">Genética</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição do Evento</label>
            <textarea
              rows={3}
              placeholder="Detalhes do ocorrido..."
              value={eventDesc}
              onChange={(e) => setEventDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsNewEventModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Evento</Button>
          </div>
        </form>
      </Modal>

      {/* QR Modal */}
      {isQrOpen && (
        <QRModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={bird.name}
          subtitle={`${bird.species} • ${bird.mutation || 'Ancestral'}`}
          value={typeof window !== 'undefined' ? `${window.location.origin}/ave/${bird.id}` : `https://birdpro.com/ave/${bird.id}`}
          type="BIRD"
          identifier={bird.ringNumber}
        />
      )}

      {/* Print Badge Modal */}
      {isBadgeOpen && tenant && (
        <PrintBadgeModal
          isOpen={isBadgeOpen}
          onClose={() => setIsBadgeOpen(false)}
          bird={bird}
          tenant={tenant}
        />
      )}

      {/* Print Pedigree Modal */}
      {isPedigreeOpen && tenant && (
        <PrintPedigreeModal
          isOpen={isPedigreeOpen}
          onClose={() => setIsPedigreeOpen(false)}
          bird={bird}
          tenant={tenant}
        />
      )}
    </div>
  );
}
