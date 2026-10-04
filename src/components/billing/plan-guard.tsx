'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  X,
  Sparkles,
  QrCode,
  ShieldCheck,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { Tenant } from '@/types';

interface PlanGuardProps {
  children: React.ReactNode;
}

export function PlanGuard({ children }: PlanGuardProps) {
  const { tenant, user } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (tenant) {
      const freshTenant = db.getTenant(tenant.id);
      setCurrentTenant(freshTenant || tenant);
    }
  }, [tenant]);

  // If Super Admin, bypass all locks and warnings
  if (user?.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  if (!currentTenant) {
    return <>{children}</>;
  }

  // If Tenant is ISENTO (exempt/lifetime/courtesy), no expiration or block ever applies!
  if (currentTenant.billingCycle === 'ISENTO') {
    return <>{children}</>;
  }

  const expiresDate = currentTenant.expiresAt ? new Date(currentTenant.expiresAt) : new Date(Date.now() + 365*24*60*60*1000);
  const now = new Date();
  const diffTime = expiresDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isMonthly = currentTenant.billingCycle === 'MENSAL';
  const planPrice = isMonthly ? 14.99 : 169.99;
  const cycleLabel = isMonthly ? 'Mensal' : 'Anual';
  const pixCode = '00020126580014br.gov.bcb.pix0136birdpro-financeiro@birdpro.com.br5204000053039865405' + planPrice.toFixed(2) + '5802BR5913BIRDPRO_SISTEMAS6009SAO_PAULO62070503***6304';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleConfirmRenewal = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const monthsToAdd = isMonthly ? 1 : 12;
      const updated = db.renewTenantPlan(currentTenant.id, monthsToAdd);
      if (updated) {
        setCurrentTenant({ ...updated });
        setIsRenewModalOpen(false);
        setIsProcessing(false);
        alert(`🎉 Pagamento confirmado com sucesso! Seu plano foi renovado até ${new Date(updated.expiresAt).toLocaleDateString('pt-BR')}.`);
        window.location.reload();
      }
    }, 800);
  };

  // =========================================================================
  // CASE 1: EXPIRED FOR MORE THAN 10 DAYS -> FULL DASHBOARD LOCKOUT SCREEN
  // =========================================================================
  if (daysRemaining < -10) {
    const daysPastDue = Math.abs(daysRemaining);

    return (
      <div className="fixed inset-0 z-50 bg-[#0c1017] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-xl bg-[#161d28] border-2 border-red-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300 my-auto">
          
          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-950/50">
            <Lock className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
              Acesso Temporariamente Suspenso
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Painel Bloqueado por Mensalidade Atrasada
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              O acesso ao painel do criatório <strong>{currentTenant.name}</strong> foi bloqueado porque a assinatura do plano venceu há <strong>{daysPastDue} dias</strong> (em {formatDate(currentTenant.expiresAt)}).
            </p>
          </div>

          {/* Invoice Summary Box */}
          <div className="bg-[#101720] rounded-xl p-4 border border-slate-800 text-left space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Criatório / Titular:</span>
              <span className="font-bold text-white">{currentTenant.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Plano / Ciclo:</span>
              <span className="font-bold text-emerald-400">Plano {currentTenant.plan} ({cycleLabel})</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400">Vencido em:</span>
              <span className="font-bold text-red-400">{formatDate(currentTenant.expiresAt)} ({daysPastDue} dias de atraso)</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-300 font-bold uppercase text-[11px]">Valor a Regularizar:</span>
              <span className="text-lg font-black text-emerald-400">R$ {planPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* PIX Payment Section */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Pagamento Instantâneo via PIX (Liberação Imediata)</span>
            </div>

            {/* PIX Copy & Paste */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={pixCode}
                className="w-full h-9 px-3 text-[11px] font-mono bg-slate-950 border border-slate-700 rounded-lg text-slate-300 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyPix}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedPix ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Unlock Button */}
            <button
              onClick={handleConfirmRenewal}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando Pagamento...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Já Fiz o Pagamento PIX (Desbloquear Painel Agora)</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Support */}
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <span>Precisa de ajuda ou deseja parcelar?</span>
            <a
              href={`https://wa.me/555182251103?text=${encodeURIComponent(`Olá! Meu painel do criatório ${currentTenant.name} foi suspenso por atraso e gostaria de regularizar meu pagamento.`)}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>Falar com Suporte WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: EXPIRED WITHIN 10 DAYS (Grace Period / Carência de 10 dias)
  // =========================================================================
  const isPastDueGracePeriod = daysRemaining <= 0 && daysRemaining >= -10;
  const daysOverdue = Math.abs(daysRemaining);
  const daysUntilLockout = 10 - daysOverdue;

  // =========================================================================
  // CASE 3: EXPIRING IN 10 DAYS OR FEWER (Upcoming Expiration Warning)
  // =========================================================================
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 10;

  return (
    <div className="w-full">
      {/* Grace Period Warning (0 to 10 days past due) */}
      {isPastDueGracePeriod && (
        <div className="mb-3 px-4 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 text-white rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                <span>⚠️ Mensalidade Atrasada ({daysOverdue} dia{daysOverdue > 1 ? 's' : ''} vencido)</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-white text-red-700 font-bold">
                  Tolerância: {daysUntilLockout} dia{daysUntilLockout > 1 ? 's' : ''} restantes
                </span>
              </div>
              <p className="text-[11px] text-white/90">
                Sua assinatura {cycleLabel.toLowerCase()} do BIRDPRO venceu em {formatDate(currentTenant.expiresAt)}. 
                Efetue o pagamento para evitar o bloqueio total do acesso ao criatório.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRenewModalOpen(true)}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-red-700 text-xs font-black rounded-lg shadow-sm shrink-0 transition flex items-center justify-center gap-1.5 cursor-pointer uppercase"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Pagar Mensalidade (PIX)</span>
          </button>
        </div>
      )}

      {/* 10 Days Warning Banner (Before Expiration) */}
      {isExpiringSoon && (
        <div className="mb-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
                <span>Aviso de Vencimento do Plano ({daysRemaining} dia{daysRemaining > 1 ? 's' : ''} para vencer)</span>
              </div>
              <p className="text-[11px] text-amber-50">
                Sua assinatura {cycleLabel.toLowerCase()} vence no dia <strong>{formatDate(currentTenant.expiresAt)}</strong>. 
                Renove antecipadamente com PIX para manter seu acesso sem interrupções.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRenewModalOpen(true)}
            className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-xs font-black rounded-lg shadow-sm shrink-0 transition flex items-center justify-center gap-1.5 cursor-pointer uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Renovar com PIX</span>
          </button>
        </div>
      )}

      {/* Render Main Page Content */}
      {children}

      {/* ==================================================================== */}
      {/* MODAL: RENOVAÇÃO / PAGAMENTO PIX                                      */}
      {/* ==================================================================== */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#161d28] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-white">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Renovação de Assinatura BIRDPRO</span>
              </span>
              <button onClick={() => setIsRenewModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1 text-emerald-900 dark:text-emerald-300">
                <div>Criatório: <strong>{currentTenant.name}</strong></div>
                <div>Plano: <strong>Plano {currentTenant.plan} ({cycleLabel})</strong></div>
                <div>Vencimento Atual: <strong>{formatDate(currentTenant.expiresAt)}</strong></div>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-400 pt-1">
                  Valor: R$ {planPrice.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Código PIX Copia e Cola
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={pixCode}
                    className="w-full h-9 px-3 text-[11px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedPix ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <p>1. Abra o app do seu banco e escolha a opção <strong>PIX Copia e Cola</strong>.</p>
                <p>2. Cole o código acima e efetue o pagamento.</p>
                <p>3. Clique no botão abaixo para confirmar a liberação imediata do seu plano.</p>
              </div>

              <button
                onClick={handleConfirmRenewal}
                disabled={isProcessing}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando Renovação...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Pagamento Realizado</span>
                  </>
                )}
              </button>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsRenewModalOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
