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
  Info
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Bird, Tenant } from '@/types';
import { BadgeFrontAndBack, BadgeAncestors } from '@/components/genealogy/badge-front-and-back';

export default function CriarCrachaPage() {
  const { tenant } = useAuth();

  // Modo de exibição: Apenas Frente ou Frente e Verso
  const [badgeMode, setBadgeMode] = useState<'BOTH' | 'FRONT_ONLY'>('BOTH');
  const [isSaved, setIsSaved] = useState(false);

  // 1. Dados da Ave Principal (de fácil preenchimento para o usuário leigo)
  const [birdData, setBirdData] = useState({
    name: 'Soberano da Fibra',
    ringNumber: 'FOB-2026-BR-05898',
    species: 'Canário-da-terra (Sicalis flaveola)',
    sex: 'MALE' as 'MALE' | 'FEMALE',
    birthDate: '2025-11-20',
    registryNumber: tenant?.registryNumber || '4719754'
  });

  // 2. Pais (1ª Geração)
  const [parents, setParents] = useState({
    fatherName: '05898 EP (Campeão)',
    motherName: '047 EP 03/04 (Matriz de Ouro)'
  });

  // 3. Avós (2ª Geração)
  const [grandparents, setGrandparents] = useState({
    paternalGrandfather: 'Carcaça Puro Sangue',
    paternalGrandmother: 'Felícia Canto Clássico',
    maternalGrandfather: 'Zeus CMA Fibra',
    maternalGrandmother: 'Lady Gaga CM999'
  });

  // 4. Bisavós (3ª Geração)
  const [showBisavos, setShowBisavos] = useState(false);
  const [greatGrandparents, setGreatGrandparents] = useState([
    { name: 'Soberano Campeão', male: true },
    { name: 'Dourada Matriarca', male: false },
    { name: 'Ventania Puro', male: true },
    { name: 'Serena Campeã', male: false },
    { name: 'Rei do Canto', male: true },
    { name: 'Rainha Matrizes', male: false },
    { name: 'Monte Negro Fibra', male: true },
    { name: 'Estrela Guia Ouro', male: false }
  ]);

  // Objeto Bird sintético para passar ao BadgeFrontAndBack
  const previewBird: Bird = useMemo(() => {
    return {
      id: `sim-cracha-${birdData.ringNumber || '001'}`,
      tenantId: tenant?.id || 'demo-tenant',
      name: birdData.name || 'Nome da Ave',
      ringNumber: birdData.ringNumber || 'ANILHA-2026',
      species: birdData.species,
      sex: birdData.sex,
      status: 'ALIVE',
      fatherName: parents.fatherName,
      motherName: parents.motherName,
      paternalGrandfatherId: grandparents.paternalGrandfather,
      paternalGrandmotherId: grandparents.paternalGrandmother,
      maternalGrandfatherId: grandparents.maternalGrandfather,
      maternalGrandmotherId: grandparents.maternalGrandmother,
      birthDate: birdData.birthDate,
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
    // Salva ave temporária no localStorage para autenticação imediata se escanearem o QR
    if (typeof window !== 'undefined') {
      localStorage.setItem('birdpro_simulated_bird', JSON.stringify(previewBird));
    }
    window.print();
  };

  const handleSaveToCriatorio = () => {
    try {
      const allBirds = db.getBirds(tenant?.id);
      const newBird: Bird = {
        ...previewBird,
        id: `bird-${Date.now()}`
      };
      allBirds.push(newBird);
      if (typeof window !== 'undefined') {
        localStorage.setItem('birdpro_birds', JSON.stringify(allBirds));
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = () => {
    setBirdData({
      name: '',
      ringNumber: '',
      species: 'Canário-da-terra (Sicalis flaveola)',
      sex: 'MALE',
      birthDate: new Date().toISOString().split('T')[0],
      registryNumber: tenant?.registryNumber || '4719754'
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
      name: 'Madreguinha Diamante',
      ringNumber: 'FOB-2026-RS-47197',
      species: 'Canário-da-terra (Sicalis flaveola brasiliensis)',
      sex: 'MALE',
      birthDate: '2025-10-15',
      registryNumber: tenant?.registryNumber || '4719754'
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
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Espécie *</label>
              <input
                type="text"
                placeholder="Ex: Canário-da-terra"
                value={birdData.species}
                onChange={(e) => setBirdData({ ...birdData, species: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c853]/20 focus:border-[#00c853] text-slate-800"
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
        <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Escolha do Formato: Frente e Verso ou Apenas Frente */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Formato de Impressão:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setBadgeMode('BOTH')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  badgeMode === 'BOTH' ? 'bg-[#00c853] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏅 Frente e Verso (Completo)
              </button>
              <button
                type="button"
                onClick={() => setBadgeMode('FRONT_ONLY')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  badgeMode === 'FRONT_ONLY' ? 'bg-[#00c853] text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🪪 Apenas Frente (Etiqueta de Gaiola)
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToCriatorio}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? '✓ Salvo com Sucesso!' : 'Salvar no Criatório'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-black rounded-lg text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Imprimir Crachá Agora</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. PRÉ-VISUALIZAÇÃO AO VIVO DO CRACHÁ COM BRASÃO E CONEXÕES SANGUÍNEAS     */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1 print:hidden">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            Pré-visualização Oficial (Pronto para Impressão)
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Imagens, fundo e cores aplicados automaticamente das configurações do criatório
          </span>
        </div>

        {/* Live Badge Preview Canvas */}
        <div className="bg-slate-900/90 p-4 sm:p-8 rounded-xl border border-slate-800 overflow-x-auto flex justify-center print:p-0 print:bg-white print:border-0">
          <BadgeFrontAndBack
            bird={previewBird}
            tenant={tenant || ({} as any)}
            mode={badgeMode}
            customAncestors={customAncestors}
          />
        </div>
      </div>

    </div>
  );
}
