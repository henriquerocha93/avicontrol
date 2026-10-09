'use client';

import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Bird, 
  AlertCircle,
  Check,
  Building
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Medication, Treatment, Bird as BirdType } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import { DateManualInput } from '@/components/ui/date-manual-input';

export default function MedicamentosPage() {
  const { tenant } = useAuth();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [birds, setBirds] = useState<BirdType[]>([]);

  // Modals
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isTreatModalOpen, setIsTreatModalOpen] = useState(false);

  // Forms
  const [medForm, setMedForm] = useState({
    name: '',
    activeIngredient: '',
    manufacturer: '',
    standardDosage: '2 gotas para 50ml de água',
    applicationMethod: 'WATER' as Medication['applicationMethod'],
    stockQuantity: '2 frascos',
    notes: ''
  });

  const [treatForm, setTreatForm] = useState({
    birdId: '',
    medicationId: '',
    dosage: '2 gotas no bico',
    frequency: 'A cada 12 horas (08:00 e 20:00)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    responsiblePerson: 'Carlos Alberto (Tratador)',
    notes: ''
  });

  const loadData = () => {
    setMedications(db.getMedications(tenant?.id));
    setTreatments(db.getTreatments(tenant?.id));
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.name) return;

    db.addMedication({
      tenantId: tenant?.id || 'tenant-demo-01',
      ...medForm
    });

    loadData();
    setIsMedModalOpen(false);
  };

  const handleSaveTreat = (e: React.FormEvent) => {
    e.preventDefault();
    const bird = birds.find(b => b.id === treatForm.birdId);
    const med = medications.find(m => m.id === treatForm.medicationId);

    if (!bird || !med) {
      alert('Selecione uma ave e um medicamento válidos.');
      return;
    }

    db.addTreatment({
      tenantId: tenant?.id || 'tenant-demo-01',
      birdId: bird.id,
      birdName: bird.name,
      birdRing: bird.ringNumber,
      medicationId: med.id,
      medicationName: med.name,
      dosage: treatForm.dosage,
      frequency: treatForm.frequency,
      startDate: treatForm.startDate,
      endDate: treatForm.endDate,
      responsiblePerson: treatForm.responsiblePerson,
      status: 'ACTIVE',
      notes: treatForm.notes
    });

    loadData();
    setIsTreatModalOpen(false);
  };

  const handleCompleteTreatment = (id: string) => {
    db.updateTreatment(id, { status: 'COMPLETED' });
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farmácia & Medicamentos</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {treatments.filter(t => t.status === 'ACTIVE').length} Tratamentos Ativos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Estoque de fármacos, protocolos posológicos diários, horários de aplicação e alertas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsMedModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Cadastrar Fármaco
          </Button>
          <Button size="sm" onClick={() => setIsTreatModalOpen(true)}>
            <Clock className="w-4 h-4 mr-1.5" />
            Novo Tratamento por Ave
          </Button>
        </div>
      </div>

      {/* Active Treatments Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          Tratamentos Clínicos em Andamento (Administração Ativa)
        </h3>

        {treatments.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Nenhum tratamento ativo no momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{t.medicationName}</h4>
                      <p className="text-xs font-semibold text-emerald-800 mt-0.5 flex items-center gap-1">
                        <Bird className="w-3.5 h-3.5" />
                        {t.birdName} ({t.birdRing})
                      </p>
                    </div>
                    <Badge variant={t.status === 'ACTIVE' ? 'warning' : 'success'}>{t.status}</Badge>
                  </div>

                  <div className="mt-2 text-xs text-slate-700 space-y-1">
                    <p><strong>Dose:</strong> {t.dosage}</p>
                    <p><strong>Frequência:</strong> {t.frequency}</p>
                    <p className="text-slate-500 text-[11px]">Período: {formatDate(t.startDate)} até {formatDate(t.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
                  <span className="text-slate-500 text-[11px]">Resp: {t.responsiblePerson}</span>
                  {t.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCompleteTreatment(t.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Concluir Tratamento
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pharmacy Stock List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-600" />
          Estoque da Farmácia do Criatório
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((m) => (
            <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                <span className="font-semibold text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  {m.stockQuantity || 'Em estoque'}
                </span>
              </div>
              <p className="text-slate-600"><strong>Princípio Ativo:</strong> {m.activeIngredient}</p>
              <p className="text-slate-600"><strong>Fabricante:</strong> {m.manufacturer || 'Avian'}</p>
              <p className="text-slate-500 text-[11px]"><strong>Dosagem padrão:</strong> {m.standardDosage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Novo Fármaco */}
      <Modal
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        title="Cadastrar Medicamento / Suplemento na Farmácia"
        description="Adicione ao catálogo de fármacos com princípio ativo e dosagem padrão."
        maxWidth="md"
      >
        <form onSubmit={handleSaveMed} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Comercial do Medicamento *</label>
            <input
              type="text"
              required
              placeholder="Ex: Baytril 10%, Nistatina, Complexo E"
              value={medForm.name}
              onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Princípio Ativo</label>
              <input
                type="text"
                placeholder="Ex: Enrofloxacino"
                value={medForm.activeIngredient}
                onChange={(e) => setMedForm({ ...medForm, activeIngredient: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fabricante</label>
              <input
                type="text"
                placeholder="Ex: Bayer, VetNobre"
                value={medForm.manufacturer}
                onChange={(e) => setMedForm({ ...medForm, manufacturer: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dosagem Padrão Recomendada</label>
            <input
              type="text"
              placeholder="Ex: 5 gotas em 50ml de água mineral"
              value={medForm.standardDosage}
              onChange={(e) => setMedForm({ ...medForm, standardDosage: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsMedModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Fármaco</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Novo Tratamento */}
      <Modal
        isOpen={isTreatModalOpen}
        onClose={() => setIsTreatModalOpen(false)}
        title="Prescrever Tratamento para Ave"
        description="Configure a dosagem, horários e dias de duração do tratamento."
        maxWidth="md"
      >
        <form onSubmit={handleSaveTreat} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ave Paciente *</label>
            <select
              required
              value={treatForm.birdId}
              onChange={(e) => setTreatForm({ ...treatForm, birdId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="">Selecione a ave</option>
              {birds.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.ringNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Medicamento a Administrar *</label>
            <select
              required
              value={treatForm.medicationId}
              onChange={(e) => setTreatForm({ ...treatForm, medicationId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="">Selecione o medicamento</option>
              {medications.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.activeIngredient})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dosagem Específica</label>
              <input
                type="text"
                value={treatForm.dosage}
                onChange={(e) => setTreatForm({ ...treatForm, dosage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Frequência / Horários</label>
              <input
                type="text"
                value={treatForm.frequency}
                onChange={(e) => setTreatForm({ ...treatForm, frequency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data de Início</label>
              <DateManualInput
                value={treatForm.startDate}
                onChange={(val) => setTreatForm({ ...treatForm, startDate: val })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data de Término</label>
              <DateManualInput
                value={treatForm.endDate}
                onChange={(val) => setTreatForm({ ...treatForm, endDate: val })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsTreatModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Iniciar Tratamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
