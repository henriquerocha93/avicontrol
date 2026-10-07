'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Printer, 
  Save, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  Bird as BirdIcon,
  Layers,
  FileText,
  Sliders,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { firebaseSync } from '@/lib/firebase-service';
import { Bird, Tenant } from '@/types';
import { BadgeFrontAndBack, BadgeAncestors } from '@/components/genealogy/badge-front-and-back';
import { SpeciesCombobox } from '@/components/ui/species-combobox';

export default function CriarCrachaPage() {
  const { tenant } = useAuth();
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);

  React.useEffect(() => {
    const syncTenant = () => {
      const t = db.getTenant(tenant?.id);
      if (t) setActiveTenant(t);
    };
    syncTenant();
    if (typeof window !== 'undefined') {
      window.addEventListener('birdpro_db_updated', syncTenant);
      return () => window.removeEventListener('birdpro_db_updated', syncTenant);
    }
  }, [tenant?.id]);

  const currentTenant = activeTenant || tenant || ({} as any);

  // Modo de exibição: Apenas Frente ou Frente e Verso
  const [badgeMode, setBadgeMode] = useState<'BOTH' | 'FRONT_ONLY'>('BOTH');
  const [isSaved, setIsSaved] = useState(false);
  const [savedBirdRecord, setSavedBirdRecord] = useState<Bird | null>(null);

  const plantelBirds = useMemo(() => {
    return db.getBirds(currentTenant?.id);
  }, [currentTenant?.id, isSaved]);

  // 1. Dados da Ave Principal (de fácil preenchimento para o usuário leigo)
  const [birdData, setBirdData] = useState({
    name: '',
    ringNumber: '',
    species: '',
    sex: 'MALE' as 'MALE' | 'FEMALE',
    birthDate: '',
    registryNumber: tenant?.registryNumber || ''
  });

  // 2. Pais (1ª Geração)
  const [parents, setParents] = useState({
    fatherName: '',
    motherName: ''
  });

  // 3. Avós (2ª Geração)
  const [grandparents, setGrandparents] = useState({
    paternalGrandfather: '',
    paternalGrandmother: '',
    maternalGrandfather: '',
    maternalGrandmother: ''
  });

  // 4. Bisavós (3ª Geração)
  const [showBisavos, setShowBisavos] = useState(false);
  const [greatGrandparents, setGreatGrandparents] = useState([
    { name: '', male: true },
    { name: '', male: false },
    { name: '', male: true },
    { name: '', male: false },
    { name: '', male: true },
    { name: '', male: false },
    { name: '', male: true },
    { name: '', male: false }
  ]);

  // Objeto Bird sintético para passar ao BadgeFrontAndBack
  const previewBird: Bird = useMemo(() => {
    return {
      id: `sim-cracha-${birdData.ringNumber || '001'}`,
      tenantId: tenant?.id || 'demo-tenant',
      name: birdData.name || '',
      ringNumber: birdData.ringNumber || '',
      species: birdData.species || '',
      sex: birdData.sex,
      status: 'ALIVE',
      fatherName: parents.fatherName || '',
      motherName: parents.motherName || '',
      paternalGrandfatherId: grandparents.paternalGrandfather || '',
      paternalGrandmotherId: grandparents.paternalGrandmother || '',
      maternalGrandfatherId: grandparents.maternalGrandfather || '',
      maternalGrandmotherId: grandparents.maternalGrandmother || '',
      birthDate: birdData.birthDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [birdData, parents, grandparents, tenant?.id]);

  const customAncestors: BadgeAncestors = useMemo(() => {
    return {
      fatherName: parents.fatherName,
      motherName: parents.motherName,
      paternalGrandfather: grandparents.paternalGrandfather,
      paternalGrandmother: grandparents.paternalGrandmother,
      maternalGrandfather: grandparents.maternalGrandfather,
      maternalGrandmother: grandparents.maternalGrandmother,
      greatGrandparents: greatGrandparents
    };
  }, [parents, grandparents, greatGrandparents]);

  const handlePrint = () => {
    // Se o usuário preencheu a ave, garante que fique salva no plantel/lista
    if ((birdData.name || birdData.ringNumber) && !savedBirdRecord) {
      handleSaveToCriatorio();
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('birdpro_simulated_bird', JSON.stringify(previewBird));
    }
    window.print();
  };

  const handleSaveToCriatorio = () => {
    try {
      // Monta mapa de linhagem genealógica completa (Pais, Avós e Bisavós)
      const ancestry: Record<string, { name: string; ringNumber: string }> = {
        'F': { name: parents.fatherName || '', ringNumber: '' },
        'M': { name: parents.motherName || '', ringNumber: '' },
        'FF': { name: grandparents.paternalGrandfather || '', ringNumber: '' },
        'FM': { name: grandparents.paternalGrandmother || '', ringNumber: '' },
        'MF': { name: grandparents.maternalGrandfather || '', ringNumber: '' },
        'MM': { name: grandparents.maternalGrandmother || '', ringNumber: '' },
      };

      const bisavoKeys = ['FFF', 'FFM', 'FMF', 'FMM', 'MFF', 'MFM', 'MMF', 'MMM'];
      greatGrandparents.forEach((bg, idx) => {
        if (bg.name) {
          ancestry[bisavoKeys[idx]] = { name: bg.name, ringNumber: '' };
        }
      });

      // 1. Prepara o pássaro no plantel com status oficial ACTIVE e toda a genealogia vinculada
      const childBirdData: Omit<Bird, 'id' | 'createdAt' | 'updatedAt'> = {
        tenantId: tenant?.id || 'demo-tenant',
        name: birdData.name || 'Nova Ave (Crachá)',
        ringNumber: birdData.ringNumber || `ANILHA-${Date.now().toString().slice(-4)}`,
        species: birdData.species || 'Canário-da-terra (Sicalis flaveola)',
        sex: birdData.sex || 'MALE',
        status: 'ACTIVE',
        origin: 'BRED_HERE',
        fatherName: parents.fatherName || undefined,
        motherName: parents.motherName || undefined,
        paternalGrandfatherId: grandparents.paternalGrandfather || undefined,
        paternalGrandmotherId: grandparents.paternalGrandmother || undefined,
        maternalGrandfatherId: grandparents.maternalGrandfather || undefined,
        maternalGrandmotherId: grandparents.maternalGrandmother || undefined,
        birthDate: birdData.birthDate || new Date().toISOString().split('T')[0],
        entryDate: birdData.birthDate || new Date().toISOString().split('T')[0],
        isPublic: true,
        ancestry
      };

      // 2. Salva oficialmente no banco de dados do criatório
      const savedBird = db.addBird(childBirdData);

      // 3. Sincroniza imediatamente na nuvem se disponível
      if (firebaseSync.isAvailable()) {
        firebaseSync.saveDocument('birds', savedBird.id, savedBird).catch(() => {});
      }

      // 4. Marca este pássaro como ativo para a Árvore Genealógica carregar de imediato
      if (typeof window !== 'undefined') {
        localStorage.setItem('birdpro_active_tree_bird_id', savedBird.id);
        localStorage.setItem('birdpro_simulated_bird', JSON.stringify(savedBird));
        window.dispatchEvent(new Event('birdpro_db_updated'));
      }

      setIsSaved(true);
      setSavedBirdRecord(savedBird);
      setTimeout(() => setIsSaved(false), 5000);
    } catch (e) {
      console.error('Erro ao salvar pássaro no criatório:', e);
    }
  };

  const handleClearAll = () => {
    setBirdData({
      name: '',
      ringNumber: '',
      species: '',
      sex: 'MALE',
      birthDate: '',
      registryNumber: tenant?.registryNumber || ''
    });
    setParents({ fatherName: '', motherName: '' });
    setGrandparents({
      paternalGrandfather: '',
      paternalGrandmother: '',
      maternalGrandfather: '',
      maternalGrandmother: ''
    });
    setGreatGrandparents([
      { name: '', male: true },
      { name: '', male: false },
      { name: '', male: true },
      { name: '', male: false },
      { name: '', male: true },
      { name: '', male: false },
      { name: '', male: true },
      { name: '', male: false }
    ]);
  };

  const handleLoadSample = () => {
    setBirdData({
      name: 'Canto & Fibra Campeão',
      ringNumber: 'FOB-2026-BR-01234',
      species: 'Canário-da-terra (Sicalis flaveola brasiliensis)',
      sex: 'MALE',
      birthDate: '2025-10-15',
      registryNumber: tenant?.registryNumber || ''
    });
    setParents({
      fatherName: '05898 EP (Campeão Nacional)',
      motherName: '047 EP 03/04 (Reprodutora Ouro)'
    });
    setGrandparents({
      paternalGrandfather: 'Carcaça Fibra Pura',
      paternalGrandmother: 'Felícia Canto Clássico',
      maternalGrandfather: 'Zeus CMA 999',
      maternalGrandmother: 'Lady Gaga Matriz'
    });
    setGreatGrandparents([
      { name: 'Soberano Campeão', male: true },
      { name: 'Dourada Matriarca', male: false },
      { name: 'Ventania Puro', male: true },
      { name: 'Serena Campeã', male: false },
      { name: 'Rei do Canto', male: true },
      { name: 'Rainha Matrizes', male: false },
      { name: 'Monte Negro Fibra', male: true },
      { name: 'Estrela Guia Ouro', male: false }
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Criar Crachá &amp; Etiqueta de Gaiola
                <span className="text-[10px] uppercase font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Fácil &amp; Rápido
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Cadastre a ave e sua genealogia na hora e imprima o crachá com o brasão e imagens do seu criatório.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Helper Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Preencher com dados de exemplo"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exemplo Rápido</span>
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Limpar todos os campos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. FORMULÁRIO DE PREENCHIMENTO RÁPIDO E INTUITIVO (LEIGO)                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6 print:hidden">
        
        {/* Banner Explicativo */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-3 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Como funciona:</strong> Digite os dados da sua ave e dos pais/avós abaixo. O crachá é gerado automaticamente na tela em tempo real utilizando o <strong>brasão, imagens de fundo e cores oficiais</strong> configuradas no seu criatório. Ao final, escolha entre imprimir <strong>Apenas Frente</strong> ou <strong>Frente e Verso</strong>.
          </p>
        </div>

        {/* BLOCO 1: AVE PRINCIPAL */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 border-b pb-1.5">
            <span className="w-5 h-5 rounded-full bg-[#00c853] text-white text-[10px] flex items-center justify-center">1</span>
            <span>Ave Principal (Aparece na Frente do Crachá)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome da Ave *</label>
              <input
                type="text"
                placeholder="Ex: Rei da Fibra"
                value={birdData.name}
                onChange={(e) => setBirdData({ ...birdData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c853]/20 focus:border-[#00c853] font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Anilha Oficial *</label>
              <input
                type="text"
                placeholder="Ex: FOB-2026-BR-0589"
                value={birdData.ringNumber}
                onChange={(e) => setBirdData({ ...birdData, ringNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c853]/20 focus:border-[#00c853] font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <SpeciesCombobox
                label="Espécie"
                required
                value={birdData.species}
                onChange={(val) => setBirdData({ ...birdData, species: val })}
                plantelBirds={plantelBirds}
                placeholder="Ex: Canário-da-terra"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Sexo *</label>
              <select
                value={birdData.sex}
                onChange={(e) => setBirdData({ ...birdData, sex: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c853]/20 focus:border-[#00c853] font-bold text-slate-800"
              >
                <option value="MALE">♂ Macho</option>
                <option value="FEMALE">♀ Fêmea</option>
              </select>
            </div>
          </div>
        </div>

        {/* BLOCO 2: PAIS (1ª GERAÇÃO) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 border-b pb-1.5">
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center">2</span>
            <span>Pais (1ª Geração)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200">
              <label className="block text-[11px] font-bold text-sky-900 mb-1">♂ Nome do Pai</label>
              <input
                type="text"
                placeholder="Nome / anilha do pai"
                value={parents.fatherName}
                onChange={(e) => setParents({ ...parents, fatherName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-sky-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold text-slate-900"
              />
            </div>

            <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200">
              <label className="block text-[11px] font-bold text-rose-900 mb-1">♀ Nome da Mãe</label>
              <input
                type="text"
                placeholder="Nome / anilha da mãe"
                value={parents.motherName}
                onChange={(e) => setParents({ ...parents, motherName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* BLOCO 3: AVÓS (2ª GERAÇÃO) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 border-b pb-1.5">
            <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center">3</span>
            <span>Avós (2ª Geração)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
              <label className="block text-[10px] font-bold text-sky-800 mb-1">♂ Avô Paterno (Pai do Pai)</label>
              <input
                type="text"
                placeholder="Nome da ave"
                value={grandparents.paternalGrandfather}
                onChange={(e) => setGrandparents({ ...grandparents, paternalGrandfather: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
              />
            </div>

            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
              <label className="block text-[10px] font-bold text-rose-800 mb-1">♀ Avó Paterna (Mãe do Pai)</label>
              <input
                type="text"
                placeholder="Nome da ave"
                value={grandparents.paternalGrandmother}
                onChange={(e) => setGrandparents({ ...grandparents, paternalGrandmother: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
              />
            </div>

            <div className="bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
              <label className="block text-[10px] font-bold text-sky-800 mb-1">♂ Avô Materno (Pai da Mãe)</label>
              <input
                type="text"
                placeholder="Nome da ave"
                value={grandparents.maternalGrandfather}
                onChange={(e) => setGrandparents({ ...grandparents, maternalGrandfather: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
              />
            </div>

            <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
              <label className="block text-[10px] font-bold text-rose-800 mb-1">♀ Avó Materna (Mãe da Mãe)</label>
              <input
                type="text"
                placeholder="Nome da ave"
                value={grandparents.maternalGrandmother}
                onChange={(e) => setGrandparents({ ...grandparents, maternalGrandmother: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* BLOCO 4: BISAVÓS (OPCIONAL) */}
        <div>
          <button
            type="button"
            onClick={() => setShowBisavos(!showBisavos)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showBisavos ? 'rotate-90' : ''}`} />
            <span>Configurar Bisavós (3ª Geração - 8 Aves Opcionais)</span>
          </button>

          {showBisavos && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {greatGrandparents.map((bis, idx) => (
                <div key={idx} className="space-y-0.5">
                  <label className="block text-[9.5px] font-bold text-slate-500 truncate">
                    Bisavô {idx + 1} ({bis.male ? '♂' : '♀'})
                  </label>
                  <input
                    type="text"
                    value={bis.name}
                    onChange={(e) => {
                      const updated = [...greatGrandparents];
                      updated[idx].name = e.target.value;
                      setGreatGrandparents(updated);
                    }}
                    placeholder={`Nome`}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SELETOR DE MODO DE CRIAÇÃO & BOTÕES DE IMPRESSÃO                          */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Escolha do Formato: Frente e Verso ou Apenas Frente */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xs font-bold text-slate-700">Formato:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setBadgeMode('BOTH')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition text-center ${
                  badgeMode === 'BOTH' ? 'bg-[#00c853] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏅 Frente e Verso
              </button>
              <button
                type="button"
                onClick={() => setBadgeMode('FRONT_ONLY')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition text-center ${
                  badgeMode === 'FRONT_ONLY' ? 'bg-[#00c853] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🪪 Apenas Frente
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveToCriatorio}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? '✓ Salvo com Sucesso!' : 'Salvar no Criatório'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-black rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Imprimir Crachá</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. PRÉ-VISUALIZAÇÃO AO VIVO DO CRACHÁ COM BRASÃO E CONEXÕES SANGUÍNEAS     */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-slate-700 px-1 print:hidden">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Pré-visualização Oficial (Pronto para Impressão)</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Adaptável Mobile &amp; PC
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            Imagens, fundo e cores aplicados automaticamente das configurações do criatório
          </span>
        </div>

        {/* Live Badge Preview Canvas */}
        <div className="bg-slate-900/95 p-2 sm:p-6 md:p-8 rounded-xl border border-slate-800 flex flex-col items-center justify-center print:p-0 print:bg-white print:border-0 w-full overflow-hidden">
          <div className="w-full flex justify-center items-center">
            <BadgeFrontAndBack
              bird={previewBird}
              tenant={currentTenant}
              mode={badgeMode}
              customAncestors={customAncestors}
            />
          </div>
        </div>
      </div>

      {/* Notificação Flutuante de Sucesso com Link Direto para a Árvore */}
      {savedBirdRecord && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex flex-col sm:flex-row items-center gap-3 animate-in slide-in-from-bottom duration-300 max-w-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-[#00c853] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#00c853]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-black text-white">Ave salva com sucesso no Plantel!</p>
            <p className="text-[11px] text-slate-300">
              <strong>{savedBirdRecord.name}</strong> já está integrada e pronta na Árvore Genealógica.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link 
              href={`/dashboard/genealogia?birdId=${savedBirdRecord.id}`}
              className="px-3 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-black text-xs rounded-lg transition"
            >
              Ver na Árvore →
            </Link>
            <button 
              onClick={() => setSavedBirdRecord(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
