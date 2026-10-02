'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Plus, Trash2, Bird, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Bird as BirdType } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export default function FotosPage() {
  const { tenant } = useAuth();
  const [birds, setBirds] = useState<BirdType[]>([]);
  const [selectedBirdId, setSelectedBirdId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    birdId: '',
    url: '',
    caption: 'Foto Oficial no Poleiro'
  });

  const loadData = () => {
    setBirds(db.getBirds(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const filteredBirds = selectedBirdId 
    ? birds.filter(b => b.id === selectedBirdId) 
    : birds.filter(b => !!b.photoUrl);

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.birdId || !form.url) return;

    db.updateBird(form.birdId, { photoUrl: form.url });
    loadData();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Galeria de Fotos do Criatório</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800">
              {filteredBirds.length} Fotos de Matrizes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro fotográfico de alta resolução das matrizes, reprodutores e filhotes em crescimento.
          </p>
        </div>

        <Button size="sm" onClick={() => {
          setForm({
            birdId: birds[0]?.id || '',
            url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80',
            caption: 'Foto de Exposição'
          });
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-1.5" />
          Adicionar Nova Foto
        </Button>
      </div>

      {/* Filter by Bird */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
        <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Filtrar por Ave:</label>
        <select
          value={selectedBirdId}
          onChange={(e) => setSelectedBirdId(e.target.value)}
          className="w-full max-w-xs px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
        >
          <option value="">Todas as Aves com Fotos</option>
          {birds.map(b => (
            <option key={b.id} value={b.id}>{b.name} ({b.ringNumber})</option>
          ))}
        </select>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredBirds.map((bird) => (
          <div
            key={bird.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all group flex flex-col justify-between"
          >
            <div className="relative aspect-square bg-slate-100 overflow-hidden">
              {bird.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bird.photoUrl}
                  alt={bird.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}

              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-mono text-[10px] font-bold">
                {bird.ringNumber}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900 truncate">{bird.name}</h4>
                <p className="text-xs text-slate-500 truncate">{bird.species}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link href={`/dashboard/aves/${bird.id}`} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                  <span>Abrir Ficha</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => {
                    if (confirm(`Remover foto de ${bird.name}?`)) {
                      db.updateBird(bird.id, { photoUrl: undefined });
                      loadData();
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                  title="Remover Foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Foto de Ave"
        description="Informe a URL da foto ou imagem para exibição no crachá e ficha."
        maxWidth="md"
      >
        <form onSubmit={handleSavePhoto} className="space-y-4 text-xs">
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">URL da Imagem / Foto *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="https://exemplo.com/foto.jpg"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
              <label className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-[11px] cursor-pointer whitespace-nowrap flex items-center gap-1 transition shrink-0">
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setForm({ ...form, url: ev.target.result as string });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Legenda da Foto</label>
            <input
              type="text"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Foto</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
