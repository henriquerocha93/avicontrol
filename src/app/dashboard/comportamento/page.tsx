'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, Plus, Bird, Star, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Bird as BirdType } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface BehaviorItem {
  id: string;
  birdId: string;
  birdName: string;
  birdRing: string;
  tameness: number;
  singing: number;
  reproduction: number;
  stress: number;
  notes: string;
  date: string;
}

export default function ComportamentoPage() {
  const { tenant } = useAuth();
  const [birds, setBirds] = useState<BirdType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [records, setRecords] = useState<BehaviorItem[]>([
    {
      id: 'b-1',
      birdId: 'bird-01',
      birdName: 'Soberano Real',
      birdRing: 'FOB-2024-BR-0891',
      tameness: 5,
      singing: 5,
      reproduction: 5,
      stress: 1,
      notes: 'Excelente postura em roda de canto, manso no manejo de gaiola.',
      date: '2026-02-15'
    },
    {
      id: 'b-2',
      birdId: 'bird-03',
      birdName: 'Maestro Clássico',
      birdRing: 'SISPASS-2023-SP-5502',
      tameness: 4,
      singing: 5,
      reproduction: 4,
      stress: 2,
      notes: 'Dialeto clássico perfeito com alta repetição de estrofes.',
      date: '2026-02-20'
    }
  ]);

  const [form, setForm] = useState({
    birdId: '',
    tameness: 5,
    singing: 5,
    reproduction: 4,
    stress: 1,
    notes: ''
  });

  useEffect(() => {
    setBirds(db.getBirds(tenant?.id));
  }, [tenant?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bird = birds.find(b => b.id === form.birdId);
    if (!bird) return;

    const newItem: BehaviorItem = {
      id: `b-${Date.now()}`,
      birdId: bird.id,
      birdName: bird.name,
      birdRing: bird.ringNumber,
      tameness: Number(form.tameness),
      singing: Number(form.singing),
      reproduction: Number(form.reproduction),
      stress: Number(form.stress),
      notes: form.notes,
      date: new Date().toISOString().split('T')[0]
    };

    setRecords([newItem, ...records]);
    setIsModalOpen(false);
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < score ? 'text-amber-500' : 'text-slate-200'}>★</span>
        ))}
        <span className="text-slate-700 ml-1">({score}/5)</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Comportamento & Canto</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {records.length} Avaliações
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de mansidão, fibra vocal, instinto reprodutivo e adaptação ao ambiente.
          </p>
        </div>

        <Button size="sm" onClick={() => {
          setForm({
            birdId: birds[0]?.id || '',
            tameness: 5,
            singing: 5,
            reproduction: 4,
            stress: 1,
            notes: ''
          });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Avaliação Comportamental
        </Button>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((r) => (
          <div key={r.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-base text-slate-900">{r.birdName}</h4>
                <p className="font-mono text-xs text-slate-500">{r.birdRing}</p>
              </div>
              <Link href={`/dashboard/aves/${r.birdId}`} className="text-xs font-bold text-emerald-700 hover:underline">
                Ver Ficha →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Docilidade:</span>
                {renderStars(r.tameness)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Qualidade do Canto:</span>
                {renderStars(r.singing)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Instinto Reprodutivo:</span>
                {renderStars(r.reproduction)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nível de Estresse:</span>
                <span className="font-bold text-slate-800">{r.stress === 1 ? 'Muito Baixo (Excelente)' : `${r.stress}/5`}</span>
              </div>
            </div>

            {r.notes && (
              <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100">
                &quot;{r.notes}&quot;
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Avaliar Comportamento da Ave"
        description="Atribua notas de 1 a 5 para as aptidões comportamentais e vocais."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Selecione a Ave *</label>
            <select
              required
              value={form.birdId}
              onChange={(e) => setForm({ ...form, birdId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="">Selecione a ave</option>
              {birds.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.ringNumber})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Docilidade / Mansidão (1 a 5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.tameness}
                onChange={(e) => setForm({ ...form, tameness: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Potência e Canto (1 a 5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.singing}
                onChange={(e) => setForm({ ...form, singing: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Observações de Temperamento</label>
            <textarea
              rows={2}
              placeholder="Ex: Aceita encarte com fone, não belisca a grade..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Avaliação</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
