'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  Bird, 
  Calendar,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { DiseaseRecord, Bird as BirdType } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function SaudePage() {
  const { tenant } = useAuth();
  const [diseases, setDiseases] = useState<DiseaseRecord[]>([]);
  const [birds, setBirds] = useState<BirdType[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    birdId: '',
    diseaseName: '',
    symptoms: '',
    diagnosis: '',
    diagnosedDate: new Date().toISOString().split('T')[0],
    veterinarian: 'Dra. Juliana Mendes (CRMV-SP 44.920)',
    treatmentNotes: '',
    result: 'IN_TREATMENT' as const
  });

  const loadData = () => {
    setDiseases(db.getDiseases(tenant?.id));
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const filtered = diseases.filter(d => 
    d.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
    d.birdName.toLowerCase().includes(search.toLowerCase()) ||
    d.birdRing.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bird = birds.find(b => b.id === formData.birdId);
    if (!bird) {
      alert('Selecione uma ave válida.');
      return;
    }

    db.addDisease({
      tenantId: tenant?.id || 'tenant-demo-01',
      birdId: bird.id,
      birdName: bird.name,
      birdRing: bird.ringNumber,
      diseaseName: formData.diseaseName,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      diagnosedDate: formData.diagnosedDate,
      veterinarian: formData.veterinarian,
      treatmentNotes: formData.treatmentNotes,
      result: formData.result
    });

    if (formData.result === 'IN_TREATMENT') {
      db.updateBird(bird.id, { status: 'IN_TREATMENT' });
    }

    loadData();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saúde & Prontuário Sanitário</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {diseases.length} Ocorrências Clínicas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro veterinário de doenças, sintomas clínicos, quarentenas e histórico de recuperação.
          </p>
        </div>

        <Button size="sm" onClick={() => {
          setFormData({
            birdId: birds[0]?.id || '',
            diseaseName: '',
            symptoms: '',
            diagnosis: '',
            diagnosedDate: new Date().toISOString().split('T')[0],
            veterinarian: 'Dra. Juliana Mendes (CRMV-SP 44.920)',
            treatmentNotes: '',
            result: 'IN_TREATMENT'
          });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-1.5" />
          Registrar Ocorrência Sanitária
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome da doença, ave ou anilha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Disease Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-base text-slate-900">{d.diseaseName}</span>
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                  <Bird className="w-3.5 h-3.5" />
                  {d.birdName} ({d.birdRing})
                </p>
              </div>
              <Badge variant={d.result === 'CURED' ? 'success' : d.result === 'IN_TREATMENT' ? 'danger' : 'warning'}>
                {d.result === 'CURED' ? 'Curado' : d.result === 'IN_TREATMENT' ? 'Em Tratamento' : d.result}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <p className="text-slate-700"><strong>Sintomas:</strong> {d.symptoms}</p>
              <p className="text-slate-700"><strong>Diagnóstico:</strong> {d.diagnosis}</p>
              {d.treatmentNotes && <p className="text-slate-600"><strong>Conduta:</strong> {d.treatmentNotes}</p>}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
              <span>Vet: {d.veterinarian || 'Veterinário Responsável'}</span>
              <span>Diagnosticado em: {formatDate(d.diagnosedDate)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Ocorrência */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Ocorrência Clínica / Sanitária"
        description="Preencha os sintomas e diagnóstico para atualização do prontuário."
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome da Doença / Patologia *</label>
            <input
              type="text"
              required
              placeholder="Ex: Coccidiose, Candidíase, Muda de Penas"
              value={formData.diseaseName}
              onChange={(e) => setFormData({ ...formData, diseaseName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Sintomas Apresentados *</label>
            <textarea
              rows={2}
              required
              placeholder="Ex: Penas eriçadas, fezes líquidas, perda de apetite..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Diagnóstico Veterinário</label>
            <input
              type="text"
              placeholder="Ex: Confirmado por exame coproparasitológico"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data do Diagnóstico</label>
              <input
                type="date"
                value={formData.diagnosedDate}
                onChange={(e) => setFormData({ ...formData, diagnosedDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status do Quadro</label>
              <select
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="IN_TREATMENT">Em Tratamento Ativo</option>
                <option value="CURED">Curado / Recuperado</option>
                <option value="CHRONIC">Crônico</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar no Prontuário</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
