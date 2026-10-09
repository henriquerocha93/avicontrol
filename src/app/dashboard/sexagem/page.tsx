'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  Search, 
  CheckCircle2, 
  FileText, 
  Bird, 
  Calendar,
  Building,
  Award
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { SexingRecord, Bird as BirdType, BirdSex } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import { DateManualInput } from '@/components/ui/date-manual-input';

export default function SexagemPage() {
  const { tenant } = useAuth();
  const [sexings, setSexings] = useState<SexingRecord[]>([]);
  const [birds, setBirds] = useState<BirdType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    birdId: '',
    result: 'MALE' as BirdSex,
    method: 'DNA_FEATHER' as SexingRecord['method'],
    laboratory: 'Unigen Genética e Biotecnologia',
    sampleDate: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
    resultDate: new Date().toISOString().split('T')[0],
    certificateNumber: `UNI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    notes: ''
  });

  const loadData = () => {
    setSexings(db.getSexings(tenant?.id));
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const bird = birds.find(b => b.id === formData.birdId);
    if (!bird) return;

    db.addSexing({
      tenantId: tenant?.id || 'tenant-demo-01',
      birdId: bird.id,
      birdName: bird.name,
      birdRing: bird.ringNumber,
      result: formData.result,
      method: formData.method,
      laboratory: formData.laboratory,
      sampleDate: formData.sampleDate,
      resultDate: formData.resultDate,
      certificateNumber: formData.certificateNumber,
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sexagem Molecular por DNA</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {sexings.length} Laudos Emitidos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Certificados oficiais de laboratório (ZZ / ZW), controle de amostras e atualização automática do cadastro da ave.
          </p>
        </div>

        <Button size="sm" onClick={() => {
          setFormData({
            birdId: birds.find(b => b.sex === 'UNKNOWN')?.id || birds[0]?.id || '',
            result: 'MALE',
            method: 'DNA_FEATHER',
            laboratory: 'Unigen Genética e Biotecnologia',
            sampleDate: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
            resultDate: new Date().toISOString().split('T')[0],
            certificateNumber: `UNI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            notes: 'Amostra de penas com bulbo íntegro.'
          });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-1.5" />
          Registrar Novo Laudo DNA
        </Button>
      </div>

      {/* Sexing List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sexings.map((s) => (
          <div key={s.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-base text-slate-900">{s.birdName}</h4>
                <p className="font-mono text-xs text-slate-500">{s.birdRing}</p>
              </div>
              <SexBadge sex={s.result} />
            </div>

            <div className="space-y-1 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <p className="text-slate-700"><strong>Laboratório:</strong> {s.laboratory}</p>
              <p className="text-slate-700"><strong>Certificado:</strong> <span className="font-mono">{s.certificateNumber}</span></p>
              <p className="text-slate-500 text-[11px]">Método: {s.method === 'DNA_FEATHER' ? 'Penas (Bulbo)' : s.method}</p>
              <p className="text-slate-500 text-[11px]">Emissão: {formatDate(s.resultDate)}</p>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <Link href={`/dashboard/aves/${s.birdId}`}>
                <span className="text-xs font-bold text-emerald-700 hover:underline">
                  Abrir Ficha da Ave →
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Resultado de Sexagem DNA"
        description="O sexo da ave será atualizado automaticamente no sistema."
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
                <option key={b.id} value={b.id}>{b.name} ({b.ringNumber}) - Atual: {b.sex}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Resultado Biológico *</label>
              <select
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value as BirdSex })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
              >
                <option value="MALE">♂ Macho (ZZ)</option>
                <option value="FEMALE">♀ Fêmea (ZW)</option>
                <option value="UNKNOWN">? Inconclusivo</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Laboratório Perito</label>
              <input
                type="text"
                value={formData.laboratory}
                onChange={(e) => setFormData({ ...formData, laboratory: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Número do Certificado</label>
              <input
                type="text"
                value={formData.certificateNumber}
                onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Data do Laudo</label>
              <DateManualInput
                value={formData.resultDate}
                onChange={(val) => setFormData({ ...formData, resultDate: val })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Laudo & Atualizar Ave</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
