'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bird, CircleDot, Grid3X3, Heart, FileText, ArrowRight, X } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { SexBadge, StatusBadge } from '@/components/ui/badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { tenant } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const birds = db.getBirds(tenant?.id);
  const rings = db.getRings(tenant?.id);
  const cages = db.getCages(tenant?.id);
  const pairs = db.getPairs(tenant?.id);
  const docs = db.getDocuments(tenant?.id);

  const cleanQ = query.trim().toLowerCase();

  const filteredBirds = cleanQ ? birds.filter(b => 
    b.name.toLowerCase().includes(cleanQ) ||
    b.ringNumber.toLowerCase().includes(cleanQ) ||
    b.species.toLowerCase().includes(cleanQ) ||
    (b.nickname && b.nickname.toLowerCase().includes(cleanQ)) ||
    (b.mutation && b.mutation.toLowerCase().includes(cleanQ))
  ).slice(0, 5) : birds.slice(0, 3);

  const filteredRings = cleanQ ? rings.filter(r => 
    r.number.toLowerCase().includes(cleanQ) ||
    r.type.toLowerCase().includes(cleanQ)
  ).slice(0, 4) : [];

  const filteredCages = cleanQ ? cages.filter(c => 
    c.code.toLowerCase().includes(cleanQ) ||
    c.name.toLowerCase().includes(cleanQ) ||
    c.location.toLowerCase().includes(cleanQ)
  ).slice(0, 3) : [];

  const filteredPairs = cleanQ ? pairs.filter(p => 
    p.name.toLowerCase().includes(cleanQ) ||
    p.code.toLowerCase().includes(cleanQ) ||
    p.maleName.toLowerCase().includes(cleanQ) ||
    p.femaleName.toLowerCase().includes(cleanQ)
  ).slice(0, 3) : [];

  const filteredDocs = cleanQ ? docs.filter(d => 
    d.title.toLowerCase().includes(cleanQ) ||
    d.fileName.toLowerCase().includes(cleanQ)
  ).slice(0, 3) : [];

  const handleNavigate = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Digite para buscar aves, anilhas, gaiolas, casais, exames..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-0"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="ml-2 text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* Birds Result */}
          {filteredBirds.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <span className="flex items-center gap-1.5">
                  <Bird className="w-3.5 h-3.5 text-emerald-600" /> Aves & Plantel
                </span>
                <span>{filteredBirds.length} resultado{filteredBirds.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1">
                {filteredBirds.map((bird) => (
                  <div
                    key={bird.id}
                    onClick={() => handleNavigate(`/dashboard/aves/${bird.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-200 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        {bird.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bird.photoUrl} alt={bird.name} className="w-full h-full object-cover" />
                        ) : (
                          <Bird className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">{bird.name}</h4>
                          <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border">
                            {bird.ringNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{bird.species} • {bird.mutation || 'Ancestral'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SexBadge sex={bird.sex} />
                      <StatusBadge status={bird.status} />
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rings Result */}
          {filteredRings.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <CircleDot className="w-3.5 h-3.5 text-blue-600" /> Anilhas Encontradas
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredRings.map((ring) => (
                  <div
                    key={ring.id}
                    onClick={() => handleNavigate('/dashboard/anilhas')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{ring.number}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {ring.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{ring.type} ({ring.year})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cages Result */}
          {filteredCages.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <Grid3X3 className="w-3.5 h-3.5 text-purple-600" /> Gaiolas & Viveiros
              </div>
              <div className="space-y-1">
                {filteredCages.map((cage) => (
                  <div
                    key={cage.id}
                    onClick={() => handleNavigate('/dashboard/gaiolas')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/60 border border-slate-100 hover:border-purple-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        {cage.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{cage.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{cage.location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breeding Pairs Result */}
          {filteredPairs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <Heart className="w-3.5 h-3.5 text-rose-600" /> Casais Reprodutores
              </div>
              <div className="space-y-1">
                {filteredPairs.map((pair) => (
                  <div
                    key={pair.id}
                    onClick={() => handleNavigate('/dashboard/reproducao')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50/60 border border-slate-100 hover:border-rose-200 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">{pair.name} ({pair.code})</span>
                    <span className="text-xs text-slate-500">{pair.maleName} ♂ x {pair.femaleName} ♀</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Result */}
          {filteredDocs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                <FileText className="w-3.5 h-3.5 text-amber-600" /> Documentos & Laudos
              </div>
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleNavigate('/dashboard/documentos')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">{doc.title}</span>
                    <span className="text-xs text-slate-500">{doc.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cleanQ && filteredBirds.length === 0 && filteredRings.length === 0 && filteredCages.length === 0 && filteredPairs.length === 0 && filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-700">Nenhum resultado para &quot;{query}&quot;</p>
              <p className="text-xs text-slate-500 mt-1">Verifique o número da anilha, nome ou espécie digitados.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Pressione <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Enter</kbd> para abrir</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">ESC</kbd> para fechar</span>
          </div>
          <span className="font-semibold text-emerald-700">BIRDPRO Busca Rápida</span>
        </div>
      </div>
    </div>
  );
}
