'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Grid3X3, 
  Plus, 
  Search, 
  QrCode, 
  ArrowRightLeft, 
  Edit, 
  Trash2, 
  Bird as BirdIcon, 
  MapPin, 
  Check, 
  ShieldAlert 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Cage, Bird } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge, SexBadge } from '@/components/ui/badge';
import { QRModal } from '@/components/modals/qr-modal';

export default function CagesPage() {
  const { tenant } = useAuth();
  const [cages, setCages] = useState<Cage[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCage, setEditingCage] = useState<Cage | null>(null);
  const [qrModalCage, setQrModalCage] = useState<Cage | null>(null);
  const [transferBirdModal, setTransferBirdModal] = useState<Bird | null>(null);
  const [targetCageCode, setTargetCageCode] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: 'Setor A - Reprodução Nobre',
    type: 'BREEDING' as Cage['type'],
    size: '80x40x45 cm',
    capacity: 2,
    status: 'ACTIVE' as Cage['status'],
    notes: ''
  });

  const loadData = () => {
    setCages(db.getCages(tenant?.id));
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const filteredCages = cages.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());

    const matchesType = !selectedType || c.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSaveCage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;

    if (editingCage) {
      db.updateCage(editingCage.id, formData);
    } else {
      db.addCage({
        tenantId: tenant?.id || 'tenant-demo-01',
        ...formData
      });
    }

    loadData();
    setIsFormModalOpen(false);
  };

  const handleDeleteCage = (id: string, code: string) => {
    if (confirm(`Excluir gaiola ${code}?`)) {
      db.deleteCage(id);
      loadData();
    }
  };

  const handleTransferBird = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferBirdModal) return;

    db.updateBird(transferBirdModal.id, {
      cageId: targetCageCode || undefined,
      location: targetCageCode ? `Gaiola ${targetCageCode}` : undefined
    });

    setTransferBirdModal(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Gaiolas & Espaço</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {cages.length} Acomodações
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organização espacial, ocupação, lotação de voadeiras e transferência de aves.
          </p>
        </div>

        <Button size="sm" onClick={() => {
          setEditingCage(null);
          setFormData({
            code: `G-${Math.floor(100 + Math.random() * 900)}`,
            name: 'Gaiola Padrão',
            location: 'Setor A - Reprodução',
            type: 'BREEDING',
            size: '80x40x45 cm',
            capacity: 2,
            status: 'ACTIVE',
            notes: ''
          });
          setIsFormModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Gaiola
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (G-101), nome ou setor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
        >
          <option value="">Todos os Tipos</option>
          <option value="BREEDING">Reprodução</option>
          <option value="FLIGHT">Voadeira</option>
          <option value="INDIVIDUAL">Individual / Canto</option>
          <option value="HOSPITAL">Ambulatório / UTI</option>
          <option value="NURSERY">Berçário</option>
        </select>
      </div>

      {/* Visual Cages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCages.map((cage) => {
          // Birds inside this cage
          const occupants = birds.filter(b => b.cageId === cage.code || b.cageId === cage.id);
          const isOverCapacity = occupants.length > cage.capacity;
          const isFull = occupants.length === cage.capacity;

          return (
            <div
              key={cage.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Cage Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-black px-2.5 py-1 bg-purple-100 text-purple-900 rounded-xl border border-purple-200">
                      {cage.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{cage.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {cage.location}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setQrModalCage(cage)}
                    title="QR Code da Gaiola"
                    className="p-2 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                {/* Capacity Bar */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Ocupação: <strong className={isOverCapacity ? 'text-rose-600' : isFull ? 'text-amber-600' : 'text-emerald-700'}>
                      {occupants.length} de {cage.capacity} aves
                    </strong>
                  </span>
                  <Badge variant={cage.type === 'BREEDING' ? 'purple' : cage.type === 'HOSPITAL' ? 'danger' : 'info'} size="sm">
                    {cage.type === 'BREEDING' ? 'Reprodução' : cage.type === 'FLIGHT' ? 'Voadeira' : cage.type === 'HOSPITAL' ? 'UTI' : cage.type}
                  </Badge>
                </div>
              </div>

              {/* Occupants List (Aves Alocadas) */}
              <div className="p-4 flex-1 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Aves Atualmente nesta Gaiola ({occupants.length}):
                </span>

                {occupants.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Gaiola vazia e disponível.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {occupants.map((bird) => (
                      <div
                        key={bird.id}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between hover:bg-emerald-50/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                            {bird.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={bird.photoUrl} alt={bird.name} className="w-full h-full object-cover" />
                            ) : (
                              <BirdIcon className="w-4 h-4 text-slate-400 m-auto mt-2" />
                            )}
                          </div>
                          <div className="truncate">
                            <Link href={`/dashboard/aves/${bird.id}`} className="font-bold text-xs text-slate-900 hover:text-emerald-700 truncate block">
                              {bird.name}
                            </Link>
                            <p className="text-[10px] font-mono text-slate-500">{bird.ringNumber}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <SexBadge sex={bird.sex} />
                          <button
                            onClick={() => {
                              setTransferBirdModal(bird);
                              setTargetCageCode(bird.cageId || '');
                            }}
                            title="Mudar Gaiola da Ave"
                            className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-md border border-transparent hover:border-slate-200"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cage Footer Controls */}
              <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{cage.size || 'Dimensões padrão'}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingCage(cage);
                      setFormData({
                        code: cage.code,
                        name: cage.name,
                        location: cage.location,
                        type: cage.type,
                        size: cage.size || '',
                        capacity: cage.capacity,
                        status: cage.status,
                        notes: cage.notes || ''
                      });
                      setIsFormModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200/60"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCage(cage.id, cage.code)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCage ? `Editar Gaiola ${editingCage.code}` : 'Cadastrar Nova Gaiola / Viveiro'}
        description="Configure as dimensões, capacidade e localização da acomodação."
        maxWidth="md"
      >
        <form onSubmit={handleSaveCage} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Código da Gaiola *</label>
              <input
                type="text"
                required
                placeholder="Ex: G-105"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Acomodação</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="BREEDING">Gaiola de Reprodução</option>
                <option value="FLIGHT">Voadeira de Voo</option>
                <option value="INDIVIDUAL">Gaiola Individual / Canto</option>
                <option value="HOSPITAL">Ambulatório / UTI</option>
                <option value="NURSERY">Berçário de Filhotes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome / Descrição da Gaiola *</label>
            <input
              type="text"
              required
              placeholder="Ex: Gaiola Criatório Especial 05"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Setor / Localização</label>
              <input
                type="text"
                placeholder="Ex: Setor A - Reprodução"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Capacidade de Aves</label>
              <input
                type="number"
                min={1}
                max={50}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Gaiola</Button>
          </div>
        </form>
      </Modal>

      {/* Transfer Bird Modal */}
      <Modal
        isOpen={!!transferBirdModal}
        onClose={() => setTransferBirdModal(null)}
        title="Transferir Ave para Outra Gaiola"
        description={`Realocar a ave ${transferBirdModal?.name} (${transferBirdModal?.ringNumber})`}
        maxWidth="md"
      >
        <form onSubmit={handleTransferBird} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Selecione a Gaiola de Destino:</label>
            <select
              value={targetCageCode}
              onChange={(e) => setTargetCageCode(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs"
            >
              <option value="">Sem Gaiola (Plantel Geral)</option>
              {cages.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} - {c.name} ({c.location})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setTransferBirdModal(null)}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar Transferência</Button>
          </div>
        </form>
      </Modal>

      {/* QR Modal */}
      {qrModalCage && (
        <QRModal
          isOpen={!!qrModalCage}
          onClose={() => setQrModalCage(null)}
          title={`Gaiola ${qrModalCage.code}`}
          subtitle={`${qrModalCage.name} • ${qrModalCage.location}`}
          value={typeof window !== 'undefined' ? `${window.location.origin}/gaiola/${qrModalCage.id}` : `https://birdpro.com/gaiola/${qrModalCage.id}`}
          type="CAGE"
          identifier={qrModalCage.code}
        />
      )}
    </div>
  );
}
