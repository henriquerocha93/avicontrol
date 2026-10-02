'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building, 
  Bird, 
  Grid3X3, 
  CircleDot, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Criatório
  const [creatorName, setCreatorName] = useState('Meu Criatório de Elite');
  const [docNumber, setDocNumber] = useState('12.345.678/0001-00');
  const [city, setCity] = useState('Campinas');
  const [state, setState] = useState('SP');

  // Step 2: Ave
  const [birdName, setBirdName] = useState('Campeão Estrela');
  const [birdRing, setBirdRing] = useState('FOB-2026-BR-0001');
  const [birdSpecies, setBirdSpecies] = useState('Canário da Terra (Sicalis flaveola)');
  const [birdSex, setBirdSex] = useState<'MALE' | 'FEMALE'>('MALE');

  // Step 3: Gaiola
  const [cageCode, setCageCode] = useState('G-101');
  const [cageName, setCageName] = useState('Gaiola de Reprodução 01');

  // Step 4: Anilhas
  const [ringPrefix, setRingPrefix] = useState('FOB-2026-BR-');
  const [ringCount, setRingCount] = useState(10);

  const progressPercent = Math.round((step / 5) * 100);

  const handleNextStep = () => {
    if (step === 1) {
      db.updateTenant({
        name: creatorName,
        document: docNumber,
        city,
        state,
        setupProgress: 40
      });
      setStep(2);
    } else if (step === 2) {
      db.addBird({
        tenantId: 'tenant-demo-01',
        name: birdName,
        ringNumber: birdRing,
        species: birdSpecies,
        sex: birdSex,
        status: 'ACTIVE',
        origin: 'BRED_HERE',
        entryDate: new Date().toISOString().split('T')[0],
        isPublic: true
      });
      db.updateTenant({ setupProgress: 60 });
      setStep(3);
    } else if (step === 3) {
      db.addCage({
        tenantId: 'tenant-demo-01',
        code: cageCode,
        name: cageName,
        location: 'Setor Principal',
        type: 'BREEDING',
        capacity: 2,
        status: 'ACTIVE'
      });
      db.updateTenant({ setupProgress: 80 });
      setStep(4);
    } else if (step === 4) {
      // Create batch rings
      const rings: any[] = [];
      for (let i = 1; i <= ringCount; i++) {
        rings.push({
          tenantId: 'tenant-demo-01',
          number: `${ringPrefix}${String(i).padStart(4, '0')}`,
          year: 2026,
          type: 'FOB Oficial',
          acquisitionDate: new Date().toISOString().split('T')[0],
          status: 'IN_STOCK'
        });
      }
      db.addRingsBatch(rings);
      db.updateTenant({ setupProgress: 100 });
      
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setStep(5);
    } else if (step === 5) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Brand */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
        <Logo variant="light" size="sm" href="/" />
        <span className="text-xs text-slate-400 font-semibold">
          Assistente de Configuração
        </span>
      </div>

      {/* Center Wizard Container */}
      <div className="max-w-xl mx-auto w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 my-8">
        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400">Etapa {step} de 5</span>
            <span className="text-slate-400 font-mono font-bold">{progressPercent}% Concluído</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* STEP 1: CRIATÓRIO */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">1. Identificação do Criatório</h2>
                <p className="text-xs text-slate-400">Defina o nome oficial e localização do seu espaço.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nome do Criatório *</label>
                <input
                  type="text"
                  required
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">CPF ou CNPJ / Registro</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PRIMEIRA AVE */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                <Bird className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">2. Cadastrar Primeira Ave</h2>
                <p className="text-xs text-slate-400">Adicione sua primeira matriz ou reprodutor ao plantel.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nome da Ave *</label>
                <input
                  type="text"
                  required
                  value={birdName}
                  onChange={(e) => setBirdName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Número da Anilha *</label>
                  <input
                    type="text"
                    required
                    value={birdRing}
                    onChange={(e) => setBirdRing(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Sexo</label>
                  <select
                    value={birdSex}
                    onChange={(e) => setBirdSex(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="MALE">♂ Macho</option>
                    <option value="FEMALE">♀ Fêmea</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Espécie</label>
                <input
                  type="text"
                  value={birdSpecies}
                  onChange={(e) => setBirdSpecies(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PRIMEIRA GAIOLA */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                <Grid3X3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">3. Cadastrar Primeira Gaiola</h2>
                <p className="text-xs text-slate-400">Onde suas aves ficarão organizadas e alocadas.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Código da Gaiola *</label>
                  <input
                    type="text"
                    required
                    value={cageCode}
                    onChange={(e) => setCageCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={cageName}
                    onChange={(e) => setCageName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ESTOQUE DE ANILHAS */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
                <CircleDot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">4. Gerar Estoque de Anilhas</h2>
                <p className="text-xs text-slate-400">Crie uma sequência automática de anilhas para os filhotes.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Prefixo da Série</label>
                  <input
                    type="text"
                    value={ringPrefix}
                    onChange={(e) => setRingPrefix(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={ringCount}
                    onChange={(e) => setRingCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PRONTO */}
        {step === 5 && (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-500">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Parabéns! Seu Criatório está 100% Pronto</h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Todas as etapas essenciais foram concluídas com sucesso. Acesse o seu Dashboard completo agora.
            </p>
          </div>
        )}

        {/* Bottom Button */}
        <div className="pt-4 border-t border-slate-700 flex justify-end">
          <Button onClick={handleNextStep} size="md" className="w-full sm:w-auto font-bold">
            {step === 5 ? 'Acessar Meu Dashboard →' : 'Avançar para Próxima Etapa →'}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500">
        BIRDPRO Plataforma Profissional de Gestão de Criatórios
      </div>
    </div>
  );
}
