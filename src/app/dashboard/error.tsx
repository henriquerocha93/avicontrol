'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for quick diagnosis
    console.error('BIRDPRO Dashboard Error Boundary Caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#161d28] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-800 dark:text-white">
            Não foi possível carregar esta seção
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Ocorreu uma instabilidade temporária ao processar os dados desta tela. Clique abaixo para tentar novamente ou retorne ao início.
          </p>
          {error?.message && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-400 break-words text-left border border-slate-200 dark:border-slate-800 max-h-24 overflow-y-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>
          
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
