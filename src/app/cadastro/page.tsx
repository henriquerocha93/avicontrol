'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building, User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function CadastroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    creatorName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await register(form);
    setIsLoading(false);
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-md mx-auto w-full flex justify-between items-center">
        <Logo variant="light" size="sm" href="/" />
        <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white">
          Já tem conta? Entrar
        </Link>
      </div>

      <div className="max-w-md mx-auto w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 my-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white">Criar Nova Conta no BIRDPRO</h1>
          <p className="text-xs text-slate-400">Comece a gerenciar seu criatório com tecnologia de ponta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Seu Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Roberto Silveira"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Nome do seu Criatório *</label>
            <input
              type="text"
              required
              placeholder="Ex: Criadouro Canto Dourado"
              value={form.creatorName}
              onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Seu E-mail Profissional *</label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">WhatsApp / Celular</label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Criar Senha *</label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 dígitos"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full font-bold h-11 text-sm mt-2">
            Criar Conta & Iniciar Assistente →
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Ao se cadastrar, você concorda com os Termos de Uso e Política de Privacidade do BIRDPRO.
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        BIRDPRO • Gestão Inteligente de Criatórios
      </div>
    </div>
  );
}
