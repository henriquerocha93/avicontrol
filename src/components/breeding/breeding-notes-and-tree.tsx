'use client';

import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Plus, 
  Calendar, 
  Sparkles, 
  Bird as BirdIcon, 
  Egg as EggIcon,
  Search,
  CheckCircle2, 
  Clock, 
  FileText, 
  Trash2, 
  Edit3, 
  Filter, 
  Printer, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Info,
  Activity,
  Dna,
  BadgeAlert
} from 'lucide-react';
import { Bird, BreedingPair, BreedingObservation, BreedingEventType } from '@/types';
import { db } from '@/lib/db';
import { resolvePedigreeTree, inheritFullAncestryFromCouple } from '@/lib/pedigree';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { DateManualInput } from '@/components/ui/date-manual-input';

interface BreedingNotesAndTreeProps {
  tenantId: string;
  pairs: BreedingPair[];
  birds: Bird[];
  onRefreshData?: () => void;
  selectedPairIdFromProps?: string | null;
}

export function BreedingNotesAndTree({
  tenantId,
  pairs,
  birds,
  onRefreshData,
  selectedPairIdFromProps
}: BreedingNotesAndTreeProps) {
  // Selection States
  const [selectedPairId, setSelectedPairId] = useState<string>(selectedPairIdFromProps || (pairs[0]?.id || ''));
  const [selectedMaleId, setSelectedMaleId] = useState<string>('');
  const [selectedFemaleId, setSelectedFemaleId] = useState<string>('');
  
  // Filter for Timeline
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTreeExpanded, setIsTreeExpanded] = useState<boolean>(true);

  // Modals
  const [isObservationModalOpen, setIsObservationModalOpen] = useState<boolean>(false);
  const [editingObs, setEditingObs] = useState<BreedingObservation | null>(null);

  // Form State
  const [formState, setFormState] = useState<{
    type: BreedingEventType;
    title: string;
    date: string;
    time: string;
    galaNumber: number;
    offspringName: string;
    offspringRing: string;
    notes: string;
    autoRegisterOffspring: boolean;
  }>({
    type: 'GALA',
    title: '1ª Gala do Casal',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    galaNumber: 1,
    offspringName: '',
    offspringRing: '',
    notes: '',
    autoRegisterOffspring: true
  });

  // Males & Females lists
  const males = useMemo(() => birds.filter(b => b.sex === 'MALE'), [birds]);
  const females = useMemo(() => birds.filter(b => b.sex === 'FEMALE'), [birds]);
  const availableRings = useMemo(() => db.getRings(tenantId).filter(r => r.status === 'IN_STOCK'), [tenantId]);

  // Synchronize male & female when pair changes
  const activePair = useMemo(() => pairs.find(p => p.id === selectedPairId), [pairs, selectedPairId]);

  const activeMale = useMemo(() => {
    if (selectedMaleId) return birds.find(b => b.id === selectedMaleId);
    if (activePair?.maleId) return birds.find(b => b.id === activePair.maleId);
    return males[0];
  }, [selectedMaleId, activePair, birds, males]);

  const activeFemale = useMemo(() => {
    if (selectedFemaleId) return birds.find(b => b.id === selectedFemaleId);
    if (activePair?.femaleId) return birds.find(b => b.id === activePair.femaleId);
    return females[0];
  }, [selectedFemaleId, activePair, females, birds]);

  // Handle pair selection change
  const handleSelectPair = (pairId: string) => {
    setSelectedPairId(pairId);
    const p = pairs.find(item => item.id === pairId);
    if (p) {
      setSelectedMaleId(p.maleId);
      setSelectedFemaleId(p.femaleId);
    }
  };

  // Observations from DB
  const observations = useMemo(() => {
    return db.getBreedingObservations(
      tenantId,
      selectedPairId || undefined,
      activeMale?.id,
      activeFemale?.id
    );
  }, [tenantId, selectedPairId, activeMale?.id, activeFemale?.id, pairs]);

  // Filtered observations
  const filteredObservations = useMemo(() => {
    return observations.filter(obs => {
      if (filterType !== 'ALL' && obs.type !== filterType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = obs.title.toLowerCase().includes(query);
        const matchesNotes = (obs.notes || '').toLowerCase().includes(query);
        const matchesOffspring = (obs.offspringName || '').toLowerCase().includes(query) || (obs.offspringRing || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes && !matchesOffspring) return false;
      }
      return true;
    });
  }, [observations, filterType, searchQuery]);

  // Pedigree Trees for Male & Female
  const maleTree = useMemo(() => activeMale ? resolvePedigreeTree(activeMale, birds) : null, [activeMale, birds]);
  const femaleTree = useMemo(() => activeFemale ? resolvePedigreeTree(activeFemale, birds) : null, [activeFemale, birds]);

  // Count existing galas to suggest the next one
  const existingGalasCount = useMemo(() => {
    return observations.filter(o => o.type === 'GALA').length;
  }, [observations]);

  // Quick Action Buttons Handlers
  const handleOpenGalaModal = () => {
    const nextNumber = existingGalasCount + 1;
    const today = new Date().toISOString().split('T')[0];
    setEditingObs(null);
    setFormState({
      type: 'GALA',
      title: `${nextNumber}ª Gala de ${activeMale?.name || 'Macho'} x ${activeFemale?.name || 'Fêmea'}`,
      date: today,
      time: '08:00',
      galaNumber: nextNumber,
      offspringName: '',
      offspringRing: '',
      notes: `Gala #${nextNumber} presenciada no ninho/poleiro. Cópula confirmada com sucesso.`,
      autoRegisterOffspring: false
    });
    setIsObservationModalOpen(true);
  };

  const handleOpenPosturaModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const eggNum = observations.filter(o => o.type === 'POSTURA').length + 1;
    setEditingObs(null);
    setFormState({
      type: 'POSTURA',
      title: `Postura do ${eggNum}º Ovo`,
      date: today,
      time: '07:30',
      galaNumber: 0,
      offspringName: '',
      offspringRing: '',
      notes: `Ovo #${eggNum} botado com casca perfeita. Casal revezando no ninho.`,
      autoRegisterOffspring: false
    });
    setIsObservationModalOpen(true);
  };

  const handleOpenOvoscopiaModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingObs(null);
    setFormState({
      type: 'OVOSCOPIA',
      title: `Ovoscopia - Galas Confirmadas (Ovos Férteis)`,
      date: today,
      time: '18:00',
      galaNumber: 0,
      offspringName: '',
      offspringRing: '',
      notes: `Ovoscopia realizada no 6º dia após a postura. Vasos sanguíneos bem visíveis, embrião em desenvolvimento saudável.`,
      autoRegisterOffspring: false
    });
    setIsObservationModalOpen(true);
  };

  const handleOpenNascimentoModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const chickCount = observations.filter(o => o.type === 'NASCIMENTO').length + 1;
    const suggestedRing = availableRings[0]?.number || `FOB-2026-BR-${Math.floor(1000 + Math.random() * 9000)}`;
    setEditingObs(null);
    setFormState({
      type: 'NASCIMENTO',
      title: `Nascimento de Filhote #${chickCount} dessa genética`,
      date: today,
      time: '06:30',
      galaNumber: 0,
      offspringName: `Filhote ${activeMale?.name.split(' ')[0] || 'Junior'} x ${activeFemale?.name.split(' ')[0] || 'Maria'} #${chickCount}`,
      offspringRing: suggestedRing,
      notes: `Filhote eclodiu forte e ativo. Pais já alimentando no ninho com papinha fresca.`,
      autoRegisterOffspring: true
    });
    setIsObservationModalOpen(true);
  };

  const handleOpenCustomNoteModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingObs(null);
    setFormState({
      type: 'OBSERVACAO',
      title: `Observação de Manejo do Casal`,
      date: today,
      time: '09:00',
      galaNumber: 0,
      offspringName: '',
      offspringRing: '',
      notes: '',
      autoRegisterOffspring: false
    });
    setIsObservationModalOpen(true);
  };

  const handleEditObservation = (obs: BreedingObservation) => {
    setEditingObs(obs);
    setFormState({
      type: obs.type,
      title: obs.title,
      date: obs.date,
      time: obs.time || '',
      galaNumber: obs.galaNumber || 1,
      offspringName: obs.offspringName || '',
      offspringRing: obs.offspringRing || '',
      notes: obs.notes || '',
      autoRegisterOffspring: false
    });
    setIsObservationModalOpen(true);
  };

  const handleDeleteObservation = (id: string) => {
    if (confirm('Deseja realmente excluir esta anotação da reprodução?')) {
      db.deleteBreedingObservation(id);
      if (onRefreshData) onRefreshData();
    }
  };

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeMale || !activeFemale) {
      alert('Selecione um macho e uma fêmea para registrar a anotação.');
      return;
    }

    if (editingObs) {
      db.updateBreedingObservation({
        ...editingObs,
        type: formState.type,
        title: formState.title,
        date: formState.date,
        time: formState.time,
        galaNumber: formState.galaNumber,
        offspringName: formState.offspringName,
        offspringRing: formState.offspringRing,
        notes: formState.notes
      });
    } else {
      db.addBreedingObservation({
        tenantId,
        pairId: selectedPairId || undefined,
        pairName: activePair?.name || `Casal ${activeMale.name} x ${activeFemale.name}`,
        maleId: activeMale.id,
        maleName: activeMale.name,
        maleRing: activeMale.ringNumber,
        maleSpecies: activeMale.species,
        femaleId: activeFemale.id,
        femaleName: activeFemale.name,
        femaleRing: activeFemale.ringNumber,
        femaleSpecies: activeFemale.species,
        type: formState.type,
        title: formState.title,
        date: formState.date,
        time: formState.time,
        galaNumber: formState.galaNumber,
        offspringName: formState.offspringName,
        offspringRing: formState.offspringRing,
        notes: formState.notes
      });

      // Se for nascimento e marcou auto-cadastro no plantel, cria a ave com a árvore herdada!
      if (formState.type === 'NASCIMENTO' && formState.autoRegisterOffspring && formState.offspringName) {
        const inheritedAncestry = inheritFullAncestryFromCouple(activeMale, activeFemale, birds);
        db.addBird({
          tenantId,
          name: formState.offspringName,
          ringNumber: formState.offspringRing || `FOB-2026-BR-${Math.floor(1000 + Math.random() * 9000)}`,
          species: activeMale.species || 'Canário da Terra (Sicalis flaveola)',
          sex: 'UNKNOWN',
          birthDate: formState.date,
          fatherId: activeMale.id,
          fatherName: activeMale.name,
          fatherRing: activeMale.ringNumber,
          motherId: activeFemale.id,
          motherName: activeFemale.name,
          motherRing: activeFemale.ringNumber,
          paternalGrandfatherId: inheritedAncestry['FF']?.name || activeMale.paternalGrandfatherId,
          paternalGrandmotherId: inheritedAncestry['FM']?.name || activeMale.paternalGrandmotherId,
          maternalGrandfatherId: inheritedAncestry['MF']?.name || activeFemale.maternalGrandfatherId,
          maternalGrandmotherId: inheritedAncestry['MM']?.name || activeFemale.maternalGrandmotherId,
          ancestry: inheritedAncestry,
          cageId: activePair?.cageCode || 'VO-02',
          status: 'ACTIVE',
          origin: 'BRED_HERE',
          entryDate: formState.date,
          isPublic: true,
          mutation: 'Filhote / Genética Fixada',
          color: 'Padrão da Linhagem'
        });
      }
    }

    setIsObservationModalOpen(false);
    if (onRefreshData) onRefreshData();
  };

  const getEventBadge = (type: BreedingEventType) => {
    switch (type) {
      case 'GALA':
        return <Badge className="bg-rose-500/15 text-rose-700 border-rose-300 font-bold"><Heart className="w-3 h-3 mr-1 text-rose-500 fill-rose-500" /> Gala / Cobertura</Badge>;
      case 'POSTURA':
        return <Badge className="bg-amber-500/15 text-amber-800 border-amber-300 font-bold"><EggIcon className="w-3 h-3 mr-1 text-amber-600" /> Postura de Ovo</Badge>;
      case 'OVOSCOPIA':
        return <Badge className="bg-indigo-500/15 text-indigo-700 border-indigo-300 font-bold"><Search className="w-3 h-3 mr-1 text-indigo-600" /> Ovoscopia</Badge>;
      case 'NASCIMENTO':
        return <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-300 font-bold"><Sparkles className="w-3 h-3 mr-1 text-emerald-600" /> Nascimento</Badge>;
      case 'ANILHAMENTO':
        return <Badge className="bg-cyan-500/15 text-cyan-800 border-cyan-300 font-bold"><ShieldCheck className="w-3 h-3 mr-1 text-cyan-600" /> Anilhamento</Badge>;
      case 'DESMAME':
        return <Badge className="bg-purple-500/15 text-purple-800 border-purple-300 font-bold"><CheckCircle2 className="w-3 h-3 mr-1 text-purple-600" /> Desmame</Badge>;
      default:
        return <Badge className="bg-blue-500/15 text-blue-800 border-blue-300 font-bold"><FileText className="w-3 h-3 mr-1 text-blue-600" /> Manejo</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. SELEÇÃO DO CASAL E VINCULAÇÃO GENÉTICA */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Heart className="w-5 h-5 fill-rose-500" />
              </span>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Diário de Galas & Linhagem Genética do Casal
                </h3>
                <p className="text-xs text-slate-500">
                  Registre as datas exatas de galas (1ª, 2ª...), nascimento dos filhotes e visualize a árvore genealógica completa do acasalamento.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTreeExpanded(!isTreeExpanded)}
              className="text-xs font-bold gap-1.5"
            >
              <Dna className="w-4 h-4 text-emerald-600" />
              <span>{isTreeExpanded ? 'Recolher Árvore' : 'Ver Árvore Genética'}</span>
              {isTreeExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* CONTROLES DE SELEÇÃO: CASAL OU MACHO E FÊMEA LIVRES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Seletor de Casal Formado */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span>Casal Formado Cadastrado</span>
              <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
            </label>
            <select
              value={selectedPairId}
              onChange={(e) => handleSelectPair(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="">-- Selecionar Casal ou escolher aves abaixo --</option>
              {pairs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.maleName} x {p.femaleName}) - Gaiola {p.cageCode || 'G-101'}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor Macho (Pai João) */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80">
            <label className="block font-bold text-blue-900 mb-1 flex items-center justify-between">
              <span>♂ Macho (Pai)</span>
              {activeMale && (
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  {activeMale.ringNumber || 'Sem Anilha'}
                </span>
              )}
            </label>
            <select
              value={activeMale?.id || ''}
              onChange={(e) => setSelectedMaleId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl font-bold text-slate-900 focus:outline-none"
            >
              <option value="">Selecione o Macho</option>
              {males.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.ringNumber || 'S/N'}) - {m.mutation || m.species}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor Fêmea (Mãe Maria) */}
          <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200/80">
            <label className="block font-bold text-rose-900 mb-1 flex items-center justify-between">
              <span>♀ Fêmea (Mãe)</span>
              {activeFemale && (
                <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                  {activeFemale.ringNumber || 'Sem Anilha'}
                </span>
              )}
            </label>
            <select
              value={activeFemale?.id || ''}
              onChange={(e) => setSelectedFemaleId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl font-bold text-slate-900 focus:outline-none"
            >
              <option value="">Selecione a Fêmea</option>
              {females.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.ringNumber || 'S/N'}) - {f.mutation || f.species}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* 2. ÁRVORE GENÉTICA DINÂMICA DO CASAL (PUXADA DOS CADASTROS DAS AVES) */}
        {isTreeExpanded && activeMale && activeFemale && (
          <div className="bg-gradient-to-br from-slate-900 via-[#0d2218] to-slate-950 p-5 rounded-2xl text-white space-y-4 border border-emerald-900/60 shadow-inner">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">
                  Árvore Genealógica Herdada do Cruzamento: {activeMale.name} ♂ x {activeFemale.name} ♀
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
                Linhagem Completa 5 Gerações
              </span>
            </div>

            {/* GRID GENÉTICO: PAIS & AVÓS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* LADO PATERNO (MACHO JOÃO) */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <span>♂ PAI (1ª Geração)</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{activeMale.ringNumber}</span>
                </div>
                <div>
                  <h5 className="font-extrabold text-base text-white">{activeMale.name}</h5>
                  <p className="text-[11px] text-slate-300">{activeMale.species} • {activeMale.mutation || 'Ancestral'}</p>
                </div>

                {/* Avós Paternos */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avós Paternos:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-blue-400 font-bold block">Avô Paterno ♂</span>
                      <strong className="text-slate-200 block truncate">{maleTree?.father?.name || activeMale.fatherName || 'Não Informado'}</strong>
                      <span className="text-[9px] text-slate-500">{maleTree?.father?.ringNumber || activeMale.fatherRing || '—'}</span>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-rose-400 font-bold block">Avó Paterna ♀</span>
                      <strong className="text-slate-200 block truncate">{maleTree?.mother?.name || activeMale.motherName || 'Não Informada'}</strong>
                      <span className="text-[9px] text-slate-500">{maleTree?.mother?.ringNumber || activeMale.motherRing || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LADO MATERNO (FÊMEA MARIA) */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span>♀ MÃE (1ª Geração)</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{activeFemale.ringNumber}</span>
                </div>
                <div>
                  <h5 className="font-extrabold text-base text-white">{activeFemale.name}</h5>
                  <p className="text-[11px] text-slate-300">{activeFemale.species} • {activeFemale.mutation || 'Ancestral'}</p>
                </div>

                {/* Avós Maternos */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avós Maternos:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-blue-400 font-bold block">Avô Materno ♂</span>
                      <strong className="text-slate-200 block truncate">{femaleTree?.father?.name || activeFemale.fatherName || 'Não Informado'}</strong>
                      <span className="text-[9px] text-slate-500">{femaleTree?.father?.ringNumber || activeFemale.fatherRing || '—'}</span>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-rose-400 font-bold block">Avó Materna ♀</span>
                      <strong className="text-slate-200 block truncate">{femaleTree?.mother?.name || activeFemale.motherName || 'Não Informada'}</strong>
                      <span className="text-[9px] text-slate-500">{femaleTree?.mother?.ringNumber || activeFemale.motherRing || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Os filhotes gerados herdam toda esta genética automaticamente no Pedigree Oficial do BIRDPRO.</span>
              </span>
            </div>
          </div>
        )}

        {/* 3. BOTÕES DE AÇÕES RÁPIDAS PARA O CRIADOR (1-CLIQUE) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-extrabold text-slate-900">
            Ações Rápidas de Reprodução & Anotação de Galas:
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            
            <button
              type="button"
              onClick={handleOpenGalaModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>+ Registrar Gala #{existingGalasCount + 1}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPosturaModal}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <EggIcon className="w-3.5 h-3.5" />
              <span>+ Postura do Ovo</span>
            </button>

            <button
              type="button"
              onClick={handleOpenOvoscopiaModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>+ Ovoscopia (Gala Confirmada)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNascimentoModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Nascimento do Filhote</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCustomNoteModal}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>+ Anotação Livre</span>
            </button>

          </div>
        </div>
      </div>

      {/* 4. LINHA DO TEMPO (TIMELINE DE GALAS & OBSERVAÇÕES) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        
        {/* Header e Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Histórico Cronológico de Galas & Eventos</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filteredObservations.length} registros
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Linha do tempo com datas exatas de coberturas, postura, fertilidade e eclosão de filhotes.
            </p>
          </div>

          {/* Filtros de Tipo */}
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Todos os Eventos</option>
              <option value="GALA">Apenas Galas</option>
              <option value="POSTURA">Apenas Posturas</option>
              <option value="OVOSCOPIA">Apenas Ovoscopias</option>
              <option value="NASCIMENTO">Apenas Nascimentos</option>
              <option value="OBSERVACAO">Apenas Observações</option>
            </select>
          </div>
        </div>

        {/* LISTA DA TIMELINE */}
        {filteredObservations.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 mx-auto bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h5 className="font-extrabold text-slate-800 text-sm">Nenhum evento registrado ainda para este casal</h5>
              <p className="text-xs text-slate-500 mt-1">
                Clique nos botões acima para registrar a <strong>1ª Gala</strong>, postura de ovos ou o nascimento dos filhotes da genética {activeMale?.name || 'Macho'} x {activeFemale?.name || 'Fêmea'}.
              </p>
            </div>
            <Button size="sm" onClick={handleOpenGalaModal} className="mt-2 bg-rose-600 hover:bg-rose-700">
              <Heart className="w-3.5 h-3.5 mr-1.5 fill-white" />
              Registrar 1ª Gala Agora
            </Button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {filteredObservations.map((obs, idx) => {
              const isGala = obs.type === 'GALA';
              const isBirth = obs.type === 'NASCIMENTO';

              return (
                <div key={obs.id} className="relative group">
                  {/* Ponto / Ícone na Linha do Tempo */}
                  <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                    isGala ? 'bg-rose-500 text-white' :
                    isBirth ? 'bg-emerald-500 text-white' :
                    obs.type === 'POSTURA' ? 'bg-amber-500 text-white' :
                    obs.type === 'OVOSCOPIA' ? 'bg-indigo-500 text-white' :
                    'bg-slate-500 text-white'
                  }`}>
                    {isGala ? <Heart className="w-3 h-3 fill-white" /> :
                     isBirth ? <Sparkles className="w-3 h-3" /> :
                     obs.type === 'POSTURA' ? <EggIcon className="w-3 h-3" /> :
                     obs.type === 'OVOSCOPIA' ? <Search className="w-3 h-3" /> :
                     <FileText className="w-3 h-3" />}
                  </div>

                  {/* Card do Evento */}
                  <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isGala ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300' :
                    isBirth ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300' :
                    'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        {getEventBadge(obs.type)}
                        <h5 className="font-extrabold text-sm text-slate-900">{obs.title}</h5>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatDate(obs.date)}</span>
                          {obs.time && <span className="text-slate-400 font-normal">às {obs.time}</span>}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => handleEditObservation(obs)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                            title="Editar Anotação"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteObservation(obs.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                            title="Excluir Anotação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo / Detalhes */}
                    <div className="pt-2.5 space-y-2 text-xs">
                      {obs.notes && (
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {obs.notes}
                        </p>
                      )}

                      {/* Informações adicionais se filhote nasceu */}
                      {isBirth && (obs.offspringName || obs.offspringRing) && (
                        <div className="p-3 bg-white rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <BirdIcon className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-slate-900">{obs.offspringName}</span>
                          </div>
                          {obs.offspringRing && (
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              Anilha: {obs.offspringRing}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Info do Casal */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Genética: <strong>{obs.maleName}</strong> x <strong>{obs.femaleName}</strong></span>
                        {obs.galaNumber ? <span>Contagem: <strong>{obs.galaNumber}ª gala</strong></span> : null}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 5. MODAL DE CRIAÇÃO / EDIÇÃO DE ANOTAÇÃO & GALA */}
      <Modal
        isOpen={isObservationModalOpen}
        onClose={() => setIsObservationModalOpen(false)}
        title={editingObs ? 'Editar Registro de Reprodução' : 'Novo Registro de Reprodução'}
        description={`Genética: ${activeMale?.name || 'Macho'} ♂ x ${activeFemale?.name || 'Fêmea'} ♀`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveObservation} className="space-y-4 text-xs">
          
          {/* Tipo de Evento */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipo de Evento *</label>
            <select
              value={formState.type}
              onChange={(e) => {
                const newType = e.target.value as BreedingEventType;
                setFormState(prev => ({
                  ...prev,
                  type: newType,
                  title: newType === 'GALA' ? `${existingGalasCount + 1}ª Gala do Casal` :
                         newType === 'POSTURA' ? 'Postura de Ovo' :
                         newType === 'OVOSCOPIA' ? 'Ovoscopia - Gala Confirmada' :
                         newType === 'NASCIMENTO' ? 'Nascimento de Filhote dessa genética' :
                         'Anotação de Manejo'
                }));
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
            >
              <option value="GALA">💖 Gala / Cobertura (Cópula)</option>
              <option value="POSTURA">🥚 Postura de Ovos</option>
              <option value="OVOSCOPIA">🔍 Ovoscopia / Verificação de Fertilidade</option>
              <option value="NASCIMENTO">🐣 Nascimento de Filhote dessa Genética</option>
              <option value="ANILHAMENTO">💍 Anilhamento Oficial</option>
              <option value="DESMAME">🌿 Desmame / Separação</option>
              <option value="OBSERVACAO">📝 Anotação de Manejo / Comportamento</option>
            </select>
          </div>

          {/* Título do Evento */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Identificação / Título *</label>
            <input
              type="text"
              required
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              placeholder="Ex: 1ª Gala do João e Maria"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
            />
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data do Acontecimento *</label>
              <DateManualInput
                value={formState.date}
                onChange={(val) => setFormState({ ...formState, date: val })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Horário (Opcional)</label>
              <input
                type="time"
                value={formState.time}
                onChange={(e) => setFormState({ ...formState, time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Campos específicos se for Gala */}
          {formState.type === 'GALA' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Número da Gala</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formState.galaNumber}
                onChange={(e) => setFormState({ ...formState, galaNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
              />
            </div>
          )}

          {/* Campos específicos se for Nascimento */}
          {formState.type === 'NASCIMENTO' && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <span className="font-extrabold text-emerald-900 block text-xs">Dados do Novo Filhote:</span>
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome / Identificação do Filhote</label>
                <input
                  type="text"
                  value={formState.offspringName}
                  onChange={(e) => setFormState({ ...formState, offspringName: e.target.value })}
                  placeholder="Ex: Filhote João x Maria #1"
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Anilha Oficial do Filhote</label>
                <input
                  type="text"
                  value={formState.offspringRing}
                  onChange={(e) => setFormState({ ...formState, offspringRing: e.target.value })}
                  placeholder="Ex: FOB-2026-BR-0012"
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formState.autoRegisterOffspring}
                  onChange={(e) => setFormState({ ...formState, autoRegisterOffspring: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="font-bold text-emerald-900 text-[11px]">
                  Cadastrar filhote automaticamente no plantel com a árvore genealógica de 5 gerações herdada
                </span>
              </label>
            </div>
          )}

          {/* Observações / Anotações Livres */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Observações de Manejo / Detalhes</label>
            <textarea
              rows={3}
              value={formState.notes}
              onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
              placeholder="Ex: Macho cobriu pela manhã, comportamento tranquilo, ninho em perfeitas condições..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsObservationModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {editingObs ? 'Salvar Alterações' : 'Salvar no Diário de Reprodução'}
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
