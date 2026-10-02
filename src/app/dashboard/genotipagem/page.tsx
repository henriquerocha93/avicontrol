'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dna, Plus, Search, Award, CheckCircle2, Bird } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { GenotypingRecord, Bird as BirdType } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function GenotipagemPage() {
  const { tenant } = useAuth();
  const [records, setRecords] = useState<GenotypingRecord[]>([]);
  const [birds, setBirds] = useState<BirdType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    birdId: '',
    laboratory: 'AvianGen Laboratório Genômico',
    sampleDate: new Date(Date.now() - 14*24*60*60*1000).toISOString().split('T')[0],
    resultDate: new Date().toISOString().split('T')[0],
    geneticCode: 'G-CAN-2026-99',
    mutations: 'Amarelo Intenso, Fator Ouro',
    carrierGenes: 'Portador de Pastel Recessivo',
    notes: ''
  });

  const loadData = () => {
    setRecords(db.getGenotyping(tenant?.id));
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bird = birds.find(b => b.id === formData.birdId);
    if (!bird) return;

    db.addGenotyping({
      tenantId: tenant?.id || 'tenant-demo-01',
      birdId: bird.id,
      birdName: bird.name,
      birdRing: bird.ringNumber,
      laboratory: formData.laboratory,
      sampleDate: formData.sampleDate,
      resultDate: formData.resultDate,
      geneticCode: formData.geneticCode,
      mutationsIdentified: formData.mutations.split(',').map(s => s.trim()).filter(Boolean),
      carrierGenes: formData.carrierGenes.split(',').map(s => s.trim()).filter(Boolean),
      notes: formData.notes
    });

    loadData();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Genotipagem & Genética Avançada</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {records.length} Mapeamentos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeamento de mutações fenotípicas, genes recessivos/dominantes e códigos genômicos.
          </p>
        </div>

        <Button size="sm" onClick={() => {
          setFormData({
            birdId: birds[0]?.id || '',
            laboratory: 'AvianGen Laboratório Genômico',
            sampleDate: new Date(Date.now() - 14*24*60*60*1000).toISOString().split('T')[0],
            resultDate: new Date().toISOString().split('T')[0],
            geneticCode: `G-AV-${Math.floor(100 + Math.random() * 900)}`,
            mutations: 'Amarelo Intenso, Fator Ouro',
            carrierGenes: 'Portador de Pastel Recessivo',
            notes: 'Pureza genética comprovada.'
          });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Mapeamento Genético
        </Button>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((g) => (
          <div key={g.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-base text-slate-900">{g.birdName}</h4>
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                  <Bird className="w-3.5 h-3.5" />
                  {g.birdRing}
                </p>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg">
                {g.geneticCode}
              </span>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-700 block text-[11px]">Mutações Fenotípicas Identificadas:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {g.mutationsIdentified.map((m, i) => (
                    <Badge key={i} variant="success">{m}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block text-[11px] mt-2">Genes Ocultos / Carreadores:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {g.carrierGenes.map((c, i) => (
                    <Badge key={i} variant="purple">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Laboratório: {g.laboratory}</span>
              <Link href={`/dashboard/aves/${g.birdId}`} className="font-bold text-emerald-700 hover:underline">
                Abrir Ficha →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Mapeamento Genético"
        description="Vincule as mutações e genes recessivos à ave selecionada."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Selecione a Ave *</label>
            <select
              required
              value={formData.birdId}
              onChange={(e) => setFormData({ ...formData, birdId: e.target.value })}
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
              <label className="block font-bold text-slate-700 mb-1">Código Genético</label>
              <input
                type="text"
                value={formData.geneticCode}
                onChange={(e) => setFormData({ ...formData, geneticCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Laboratório</label>
              <input
                type="text"
                value={formData.laboratory}
                onChange={(e) => setFormData({ ...formData, laboratory: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mutações Identificadas (separadas por vírgula)</label>
            <input
              type="text"
              placeholder="Ex: Amarelo Intenso, Lutino, Topete"
              value={formData.mutations}
              onChange={(e) => setFormData({ ...formData, mutations: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Genes Carreadores (separados por vírgula)</label>
            <input
              type="text"
              placeholder="Ex: Portador de Pastel, Portador de Canela"
              value={formData.carrierGenes}
              onChange={(e) => setFormData({ ...formData, carrierGenes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Mapeamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
