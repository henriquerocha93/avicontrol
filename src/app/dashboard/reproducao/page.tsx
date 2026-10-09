'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Bird, 
  Edit, 
  Egg as EggIcon,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { BreedingPair, Clutch, Egg, Bird as BirdType, EggStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { inheritFullAncestryFromCouple } from '@/lib/pedigree';
import { DateManualInput } from '@/components/ui/date-manual-input';

export default function BreedingPage() {
  const { tenant } = useAuth();

  const [pairs, setPairs] = useState<BreedingPair[]>([]);
  const [clutches, setClutches] = useState<Clutch[]>([]);
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [birds, setBirds] = useState<BirdType[]>([]);

  // Modals
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isClutchModalOpen, setIsClutchModalOpen] = useState(false);
  const [isHatchModalOpen, setIsHatchModalOpen] = useState(false);
  const [selectedEggToHatch, setSelectedEggToHatch] = useState<Egg | null>(null);

  // Pair form
  const [pairForm, setPairForm] = useState({
    name: '',
    code: '',
    maleId: '',
    femaleId: '',
    cageCode: 'G-101',
    formedDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE' as const,
    notes: ''
  });

  // Clutch form
  const [clutchForm, setClutchForm] = useState({
    pairId: '',
    clutchNumber: 1,
    startDate: new Date().toISOString().split('T')[0],
    totalEggs: 3,
    fertileEggs: 3,
    infertileEggs: 0,
    notes: ''
  });

  // Hatch form
  const [hatchForm, setHatchForm] = useState({
    name: '',
    ringNumber: '',
    sex: 'UNKNOWN' as const,
    color: '',
    mutation: ''
  });

  const loadData = () => {
    setPairs(db.getPairs(tenant?.id));
    setClutches(db.getClutches(tenant?.id));
    setEggs(db.getEggs(tenant?.id));
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const males = birds.filter(b => b.sex === 'MALE');
  const females = birds.filter(b => b.sex === 'FEMALE');
  const availableRings = db.getRings(tenant?.id).filter(r => r.status === 'IN_STOCK');

  const handleCreatePair = (e: React.FormEvent) => {
    e.preventDefault();
    const male = birds.find(b => b.id === pairForm.maleId);
    const female = birds.find(b => b.id === pairForm.femaleId);

    if (!male || !female) {
      alert('Selecione um macho e uma fêmea válidos.');
      return;
    }

    db.addPair({
      tenantId: tenant?.id || 'tenant-demo-01',
      name: pairForm.name || `Casal ${male.name.split(' ')[0]} x ${female.name.split(' ')[0]}`,
      code: pairForm.code || `CP-${Math.floor(10 + Math.random() * 90)}`,
      maleId: male.id,
      maleName: male.name,
      maleRing: male.ringNumber,
      maleSpecies: male.species,
      femaleId: female.id,
      femaleName: female.name,
      femaleRing: female.ringNumber,
      femaleSpecies: female.species,
      cageCode: pairForm.cageCode,
      formedDate: pairForm.formedDate,
      status: pairForm.status,
      notes: pairForm.notes
    });

    // Update bird status to BREEDING
    db.updateBird(male.id, { status: 'BREEDING', cageId: pairForm.cageCode });
    db.updateBird(female.id, { status: 'BREEDING', cageId: pairForm.cageCode });

    loadData();
    setIsPairModalOpen(false);
  };

  const handleCreateClutch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clutchForm.pairId) {
      alert('Selecione um casal para registrar a postura.');
      return;
    }

    const newClutch = db.addClutch({
      tenantId: tenant?.id || 'tenant-demo-01',
      pairId: clutchForm.pairId,
      clutchNumber: Number(clutchForm.clutchNumber),
      startDate: clutchForm.startDate,
      totalEggs: Number(clutchForm.totalEggs),
      fertileEggs: Number(clutchForm.fertileEggs),
      infertileEggs: Number(clutchForm.infertileEggs),
      hatchedEggs: 0,
      lostEggs: 0,
      status: 'INCUBATING',
      notes: clutchForm.notes
    });

    // Generate individual eggs
    for (let i = 1; i <= clutchForm.totalEggs; i++) {
      const layDate = new Date(clutchForm.startDate);
      layDate.setDate(layDate.getDate() + (i - 1));
      
      const hatchDate = new Date(layDate);
      hatchDate.setDate(hatchDate.getDate() + 14); // 14 days incubation standard for passerines

      db.addEgg({
        tenantId: tenant?.id || 'tenant-demo-01',
        clutchId: newClutch.id,
        pairId: clutchForm.pairId,
        eggNumber: i,
        layDate: layDate.toISOString().split('T')[0],
        expectedHatchDate: hatchDate.toISOString().split('T')[0],
        status: i <= clutchForm.fertileEggs ? 'FERTILE' : 'INFERTILE',
        notes: `Ovo #${i} postura #${clutchForm.clutchNumber}`
      });
    }

    loadData();
    setIsClutchModalOpen(false);
  };

  const handleHatchEgg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEggToHatch) return;

    const pair = pairs.find(p => p.id === selectedEggToHatch.pairId);
    const maleBird = birds.find(b => b.id === pair?.maleId);
    const femaleBird = birds.find(b => b.id === pair?.femaleId);
    const inheritedAncestry = inheritFullAncestryFromCouple(maleBird, femaleBird, birds);

    // 1. Create offspring bird with complete 5-generation ancestry inherited
    const newBird = db.addBird({
      tenantId: tenant?.id || 'tenant-demo-01',
      name: hatchForm.name || `Filhote Canto Nobre ${Math.floor(10 + Math.random() * 90)}`,
      ringNumber: hatchForm.ringNumber || `FOB-2026-BR-${Math.floor(1000 + Math.random() * 9000)}`,
      species: pair ? pair.maleSpecies : 'Canário da Terra (Sicalis flaveola)',
      sex: hatchForm.sex,
      birthDate: new Date().toISOString().split('T')[0],
      fatherId: maleBird?.id || pair?.maleId,
      fatherName: maleBird?.name || pair?.maleName,
      fatherRing: maleBird?.ringNumber || pair?.maleRing,
      motherId: femaleBird?.id || pair?.femaleId,
      motherName: femaleBird?.name || pair?.femaleName,
      motherRing: femaleBird?.ringNumber || pair?.femaleRing,
      paternalGrandfatherId: inheritedAncestry['FF']?.name || maleBird?.paternalGrandfatherId || undefined,
      paternalGrandmotherId: inheritedAncestry['FM']?.name || maleBird?.paternalGrandmotherId || undefined,
      maternalGrandfatherId: inheritedAncestry['MF']?.name || femaleBird?.maternalGrandfatherId || undefined,
      maternalGrandmotherId: inheritedAncestry['MM']?.name || femaleBird?.maternalGrandmotherId || undefined,
      ancestry: inheritedAncestry,
      cageId: pair?.cageCode || 'VO-02',
      status: 'ACTIVE',
      origin: 'BRED_HERE',
      entryDate: new Date().toISOString().split('T')[0],
      isPublic: true,
      mutation: hatchForm.mutation || 'Ancestral',
      color: hatchForm.color || 'Padrão'
    });

    // 2. Mark egg as hatched
    db.updateEgg(selectedEggToHatch.id, {
      status: 'HATCHED',
      actualHatchDate: new Date().toISOString().split('T')[0],
      offspringBirdId: newBird.id
    });

    setSelectedEggToHatch(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Reprodução & Ninhos</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {pairs.length} Casais • {eggs.filter(e => e.status === 'FERTILE').length} Ovos Férteis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento de posturas, ovoscopia, previsão de eclosão e registro de nascimentos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setClutchForm({
              pairId: pairs[0]?.id || '',
              clutchNumber: 1,
              startDate: new Date().toISOString().split('T')[0],
              totalEggs: 3,
              fertileEggs: 3,
              infertileEggs: 0,
              notes: ''
            });
            setIsClutchModalOpen(true);
          }}>
            <EggIcon className="w-4 h-4 mr-1.5 text-amber-600" />
            Nova Postura
          </Button>

          <Button size="sm" onClick={() => {
            setPairForm({
              name: '',
              code: `CP-${Math.floor(10 + Math.random() * 90)}`,
              maleId: males[0]?.id || '',
              femaleId: females[0]?.id || '',
              cageCode: 'G-101',
              formedDate: new Date().toISOString().split('T')[0],
              status: 'ACTIVE',
              notes: ''
            });
            setIsPairModalOpen(true);
          }}>
            <Heart className="w-4 h-4 mr-1.5" />
            Formar Casal
          </Button>
        </div>
      </div>

      {/* Incubating Eggs Highlight Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl p-6 border border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
              <EggIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Ovos em Incubação no Ninho</h3>
              <p className="text-xs text-slate-600">Contagem regressiva de dias para eclosão</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white text-emerald-800 rounded-full border border-emerald-200 shadow-2xs">
            {eggs.filter(e => e.status === 'FERTILE' || e.status === 'INCUBATING').length} ovos monitorados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {eggs.filter(e => e.status === 'FERTILE' || e.status === 'INCUBATING').map((egg) => {
            const pair = pairs.find(p => p.id === egg.pairId);
            return (
              <div key={egg.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Ovo #{egg.eggNumber}</span>
                    <Badge variant="success" size="sm">Fértil (Vivo)</Badge>
                  </div>
                  <p className="text-xs font-semibold text-emerald-800 mt-1">{pair?.name || 'Casal Reprodutor'}</p>
                  <p className="text-[11px] text-slate-500">Postura em: {formatDate(egg.layDate)}</p>
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Eclosão: {formatDate(egg.expectedHatchDate)}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setSelectedEggToHatch(egg);
                    setHatchForm({
                      name: `Filhote ${pair?.maleName.split(' ')[0] || 'Junior'} #${egg.eggNumber}`,
                      ringNumber: availableRings[0]?.number || `FOB-2026-BR-00${Math.floor(10 + Math.random() * 90)}`,
                      sex: 'UNKNOWN',
                      color: '',
                      mutation: ''
                    });
                    setIsHatchModalOpen(true);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Registrar Nascimento
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breeding Pairs Cards */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Casais em Reprodução</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pairs.map((pair) => (
            <div key={pair.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-rose-100 text-rose-900 rounded-lg">
                    {pair.code}
                  </span>
                  <h4 className="font-bold text-base text-slate-900">{pair.name}</h4>
                </div>
                <Badge variant="purple">{pair.status === 'ACTIVE' ? 'Casal Ativo' : pair.status}</Badge>
              </div>

              {/* Parents Matchup Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase">♂ Macho</span>
                  <p className="font-bold text-slate-900 truncate">{pair.maleName}</p>
                  <p className="text-[10px] font-mono text-blue-700">{pair.maleRing}</p>
                </div>

                <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 uppercase">♀ Fêmea</span>
                  <p className="font-bold text-slate-900 truncate">{pair.femaleName}</p>
                  <p className="text-[10px] font-mono text-rose-700">{pair.femaleRing}</p>
                </div>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Posturas</span>
                  <span className="font-extrabold text-slate-800 text-sm">{pair.clutchesCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Ovos</span>
                  <span className="font-extrabold text-slate-800 text-sm">{pair.totalEggs}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Filhotes</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{pair.hatchedCount}</span>
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Acomodação: <strong>Gaiola {pair.cageCode || 'G-101'}</strong></span>
                <span>Formado em: {formatDate(pair.formedDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Pair Modal */}
      <Modal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        title="Formar Novo Casal de Reprodução"
        description="Selecione um macho e uma fêmea do plantel para pareamento."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePair} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome de Referência do Casal</label>
            <input
              type="text"
              placeholder="Ex: Casal Real 2026"
              value={pairForm.name}
              onChange={(e) => setPairForm({ ...pairForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Macho (♂) *</label>
              <select
                required
                value={pairForm.maleId}
                onChange={(e) => setPairForm({ ...pairForm, maleId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="">Selecione o macho</option>
                {males.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.ringNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Fêmea (♀) *</label>
              <select
                required
                value={pairForm.femaleId}
                onChange={(e) => setPairForm({ ...pairForm, femaleId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="">Selecione a fêmea</option>
                {females.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.ringNumber})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gaiola do Casal</label>
              <input
                type="text"
                placeholder="Ex: G-101"
                value={pairForm.cageCode}
                onChange={(e) => setPairForm({ ...pairForm, cageCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Data de Formação</label>
              <DateManualInput
                value={pairForm.formedDate}
                onChange={(val) => setPairForm({ ...pairForm, formedDate: val })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsPairModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Formar Casal</Button>
          </div>
        </form>
      </Modal>

      {/* Form Clutch Modal */}
      <Modal
        isOpen={isClutchModalOpen}
        onClose={() => setIsClutchModalOpen(false)}
        title="Registrar Nova Postura de Ovos"
        description="Informe a quantidade de ovos e resultado da ovoscopia."
        maxWidth="md"
      >
        <form onSubmit={handleCreateClutch} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Casal Reprodutor *</label>
            <select
              required
              value={clutchForm.pairId}
              onChange={(e) => setClutchForm({ ...clutchForm, pairId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="">Selecione o casal</option>
              {pairs.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.maleName} x {p.femaleName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data Início da Postura</label>
              <DateManualInput
                value={clutchForm.startDate}
                onChange={(val) => setClutchForm({ ...clutchForm, startDate: val })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Quantidade de Ovos</label>
              <input
                type="number"
                min={1}
                max={10}
                value={clutchForm.totalEggs}
                onChange={(e) => setClutchForm({ ...clutchForm, totalEggs: Number(e.target.value), fertileEggs: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ovos Férteis (Ovoscopia)</label>
              <input
                type="number"
                min={0}
                max={clutchForm.totalEggs}
                value={clutchForm.fertileEggs}
                onChange={(e) => setClutchForm({ ...clutchForm, fertileEggs: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ovos Inférteis / Claros</label>
              <input
                type="number"
                min={0}
                max={clutchForm.totalEggs}
                value={clutchForm.infertileEggs}
                onChange={(e) => setClutchForm({ ...clutchForm, infertileEggs: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsClutchModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Postura & Iniciar Incubação</Button>
          </div>
        </form>
      </Modal>

      {/* Hatch Egg & Register Birth Modal */}
      <Modal
        isOpen={isHatchModalOpen}
        onClose={() => setIsHatchModalOpen(false)}
        title="🎉 Registrar Nascimento de Filhote"
        description="Vincule a anilha oficial e cadastre o novo membro do plantel."
        maxWidth="md"
      >
        <form onSubmit={handleHatchEgg} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome / Identificação do Filhote *</label>
            <input
              type="text"
              required
              value={hatchForm.name}
              onChange={(e) => setHatchForm({ ...hatchForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Anilha Oficial do Estoque *</label>
            <input
              type="text"
              required
              placeholder="Ex: FOB-2026-BR-0019"
              value={hatchForm.ringNumber}
              onChange={(e) => setHatchForm({ ...hatchForm, ringNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mutação / Fator</label>
              <input
                type="text"
                placeholder="Ex: Amarelo Intenso"
                value={hatchForm.mutation}
                onChange={(e) => setHatchForm({ ...hatchForm, mutation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cor</label>
              <input
                type="text"
                placeholder="Ex: Dourado"
                value={hatchForm.color}
                onChange={(e) => setHatchForm({ ...hatchForm, color: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsHatchModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Filhote no Plantel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
