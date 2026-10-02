'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Bird, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  ShieldCheck, 
  ExternalLink, 
  MessageCircle,
  QrCode
} from 'lucide-react';
import { db } from '@/lib/db';
import { Tenant, Bird as BirdType } from '@/types';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { SexBadge } from '@/components/ui/badge';
import { maskRingNumber, calculateAge } from '@/lib/utils';

export default function PublicCriatorioPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [publicBirds, setPublicBirds] = useState<BirdType[]>([]);

  useEffect(() => {
    const t = db.getTenant();
    setTenant(t);
    const birds = db.getBirds(t.id).filter(b => b.isPublic);
    setPublicBirds(birds);
  }, [slug]);

  if (!tenant) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo variant="dark" size="sm" href="/" />
          <Link href="/login">
            <Button size="sm" variant="outline">
              Área do Criador (Login)
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Criatório Cover */}
      <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden">
        {tenant.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tenant.coverUrl}
            alt={tenant.name}
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        
        <div className="absolute bottom-6 left-0 right-0 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1.5 shadow-2xl border-2 border-emerald-500 shrink-0 overflow-hidden">
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                {tenant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-white space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">{tenant.name}</h1>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {tenant.city} - {tenant.state} • Registro Oficial: {tenant.document}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Description & Contact Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-extrabold text-base text-slate-900">Sobre o Criatório</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {tenant.description || 'Criatório dedicado à preservação, seleção genética de matrizes de alto padrão e pureza de canto.'}
            </p>
          </div>

          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Contato Oficial</h4>
            <div className="space-y-2 text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {tenant.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                {tenant.email}
              </p>
            </div>

            {tenant.whatsapp && (
              <a
                href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}?text=Olá!%20Vi%20seu%20criatório%20no%20BIRDPRO`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm transition-colors mt-2"
              >
                <MessageCircle className="w-4 h-4" />
                Falar pelo WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Public Birds Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900">Plantel & Matrizes em Destaque</h3>
              <p className="text-xs text-slate-500">Exemplares públicos selecionados pelo criador</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              {publicBirds.length} Aves Públicas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {publicBirds.map((bird) => (
              <Link
                key={bird.id}
                href={`/ave/${bird.id}`}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
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
                      <Bird className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <SexBadge sex={bird.sex} />
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-white text-[11px] font-mono font-bold flex items-center justify-between">
                    <span>{maskRingNumber(bird.ringNumber)}</span>
                    <span className="text-[10px] text-emerald-400">Ver Pedigree →</span>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {bird.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{bird.species}</p>
                  <p className="text-[11px] text-slate-400">Mutação: {bird.mutation || 'Ancestral'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 space-y-1">
        <p>Página oficial do {tenant.name} desenvolvida na plataforma <strong>BIRDPRO</strong></p>
        <p>© {new Date().getFullYear()} BIRDPRO • Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
