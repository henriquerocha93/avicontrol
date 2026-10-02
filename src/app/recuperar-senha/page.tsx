'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-md mx-auto w-full flex justify-between items-center">
        <Logo variant="light" size="sm" href="/" />
        <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
        </Link>
      </div>

      <div className="max-w-md mx-auto w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 my-8">
        {!isSent ? (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-white">Recuperação de Senha</h1>
              <p className="text-xs text-slate-400">Informe seu e-mail cadastrado para receber as instruções</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-bold h-11 text-sm">
                Enviar Link de Redefinição
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">E-mail Enviado!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
            </p>
            <Link href="/login" className="inline-block pt-2">
              <Button variant="outline" size="sm">
                Ir para o Login
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500">
        BIRDPRO • Recuperação Segura
      </div>
    </div>
  );
}
