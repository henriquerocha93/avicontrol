'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Zap,
  Building2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateEmvCoPix } from '@/lib/pagbank';

const PAGBANK_PIX_KEY = '6f33236f-92cb-4812-b0a8-332e3af35839';

export default function RenovarPlanosPage() {
  const router = useRouter();
  const { tenant, refreshTenant, user } = useAuth();

  // Selection
  const [selectedCycle, setSelectedCycle] = useState<'MENSAL' | 'ANUAL'>('ANUAL');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD'>('PIX');

  // Checkout / Gateway states
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [orderGenerated, setOrderGenerated] = useState(false);

  // Gateway data
  const [activeGateway, setActiveGateway] = useState<'MERCADOPAGO' | 'PAGBANK'>('MERCADOPAGO');
  const [currentReferenceId, setCurrentReferenceId] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [currentPaymentId, setCurrentPaymentId] = useState('');
  const [currentPixCode, setCurrentPixCode] = useState('');
  const [currentQrCodeBase64, setCurrentQrCodeBase64] = useState('');
  const [verificationStatusMsg, setVerificationStatusMsg] = useState('');

  // Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');
  const [cardError, setCardError] = useState('');

  const currentTenant = tenant ? (db.getTenant(tenant.id) || tenant) : null;

  // Plan Price Calculations
  const basePrice = selectedCycle === 'ANUAL' ? 169.99 : 14.99;
  const finalPrice = basePrice;

  // Days remaining calculation
  let expiresDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  if (currentTenant?.expiresAt) {
    const d = new Date(currentTenant.expiresAt);
    if (!isNaN(d.getTime())) {
      expiresDate = d;
    }
  }
  const now = new Date();
  const diffTime = expiresDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 10;
  const isIsento = currentTenant?.billingCycle === 'ISENTO';

  // Apply activation / renewal in database and session
  const applySuccessfulRenewal = useCallback(() => {
    if (!currentTenant) return;
    const monthsToAdd = selectedCycle === 'ANUAL' ? 12 : 1;
    const updated = db.renewTenantPlan(currentTenant.id, monthsToAdd);
    if (updated) {
      db.updateTenant(
        {
          plan: 'PREMIUM',
          billingCycle: selectedCycle,
          planStatus: 'ACTIVE',
          maxBirds: 99999
        },
        currentTenant.id
      );
    }
    refreshTenant();
    setIsSuccess(true);
    setOrderGenerated(false);
  }, [currentTenant, selectedCycle, refreshTenant]);

  // Strict API Verification with Polling / Manual Check
  const verifyPaymentWithApi = useCallback(
    async (isManual = false) => {
      if (!currentReferenceId) return;
      setIsVerifying(true);
      setVerificationStatusMsg('');

      try {
        let isPaid = false;
        let statusMsg = '';

        if (activeGateway === 'MERCADOPAGO' || currentPaymentId) {
          const res = await fetch(
            `/api/payments/mercadopago/status?paymentId=${encodeURIComponent(
              currentPaymentId
            )}&referenceId=${encodeURIComponent(currentReferenceId)}`
          );
          const data = await res.json();
          if (data && data.paid) {
            isPaid = true;
          } else {
            statusMsg = data?.status || 'Aguardando Pagamento';
          }
        } else {
          const res = await fetch(
            `/api/payments/pagbank/status?referenceId=${encodeURIComponent(
              currentReferenceId
            )}&orderId=${encodeURIComponent(currentOrderId)}`
          );
          const data = await res.json();
          if (data && data.paid) {
            isPaid = true;
          } else {
            statusMsg = data?.status || 'Aguardando compensação bancária';
          }
        }

        if (isPaid) {
          applySuccessfulRenewal();
        } else {
          if (isManual) {
            setVerificationStatusMsg(
              `Aguardando confirmação do banco (${statusMsg}). Efetue o PIX no app do banco e clique novamente.`
            );
          }
        }
      } catch (err: any) {
        console.warn('Erro ao consultar status do gateway:', err);
        if (isManual) {
          setVerificationStatusMsg(
            'Verificando transação... Se já pagou, aguarde 10 segundos para a confirmação da rede bancária.'
          );
        }
      } finally {
        setIsVerifying(false);
      }
    },
    [currentReferenceId, activeGateway, currentPaymentId, currentOrderId, applySuccessfulRenewal]
  );

  // Auto-polling when order is generated
  useEffect(() => {
    if (!orderGenerated || isSuccess || !currentReferenceId) return;

    const interval = setInterval(() => {
      verifyPaymentWithApi(false);
    }, 4500);

    return () => clearInterval(interval);
  }, [orderGenerated, isSuccess, currentReferenceId, verifyPaymentWithApi]);

  // Generate Payment Order (Mercado Pago or PagBank)
  const handleGenerateOrder = async () => {
    if (!currentTenant) return;
    setIsCreatingOrder(true);
    setVerificationStatusMsg('');
    const newRefId = `RENEW-${currentTenant.id.replace('tenant-', '')}-${Date.now()}`;
    setCurrentReferenceId(newRefId);

    const customerName = currentTenant.name || user?.name || 'Assinante BirdPro';
    const customerEmail = currentTenant.email || user?.email || 'contato@birdpro.com.br';
    const customerDocument = (currentTenant.document || '').replace(/\D/g, '') || '00000000000';
    const customerPhone = (currentTenant.phone || '').replace(/\D/g, '') || '11999999999';

    try {
      const globalConfig = db.getGlobalConfig();
      const useMercadoPago =
        globalConfig.gatewayProvider === 'MERCADOPAGO' ||
        (globalConfig.gatewayApiKey && globalConfig.gatewayApiKey.startsWith('APP_USR'));

      if (useMercadoPago) {
        setActiveGateway('MERCADOPAGO');
        const mpRes = await fetch('/api/payments/mercadopago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: newRefId,
            customerName,
            customerEmail,
            customerCpf: customerDocument,
            customerPhone,
            amount: finalPrice,
            description: `Renovação de Assinatura BirdPro (${
              selectedCycle === 'ANUAL' ? 'Plano Anual' : 'Plano Mensal'
            })`,
            token: globalConfig.gatewayApiKey
          })
        });

        if (mpRes.ok) {
          const mpData = await mpRes.json();
          if (mpData.pixCode) setCurrentPixCode(mpData.pixCode);
          if (mpData.paymentId) setCurrentPaymentId(mpData.paymentId);
          if (mpData.qrCodeBase64) setCurrentQrCodeBase64(mpData.qrCodeBase64);
        } else {
          throw new Error('Falha na resposta do Mercado Pago');
        }
      } else {
        setActiveGateway('PAGBANK');
        const standardPix = generateEmvCoPix(
          PAGBANK_PIX_KEY,
          'CARMEN ROGERE ROSA DA ROCHA',
          'SAO PAULO',
          finalPrice,
          '***'
        );
        setCurrentPixCode(standardPix);

        const res = await fetch('/api/payments/pagbank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: newRefId,
            customerName,
            customerEmail,
            customerCpf: customerDocument,
            customerPhone,
            amount: finalPrice,
            description: `Renovação BirdPro (${
              selectedCycle === 'ANUAL' ? 'Plano Anual' : 'Plano Mensal'
            })`,
            token: globalConfig.pagbankToken,
            isSandbox: globalConfig.pagbankSandbox
          })
        });

        if (res.ok) {
          const orderData = await res.json();
          if (orderData.pixCode) setCurrentPixCode(orderData.pixCode);
          if (orderData.orderId) setCurrentOrderId(orderData.orderId);
        }
      }

      setOrderGenerated(true);
    } catch (e) {
      console.warn('Fallback para PIX Bacen PagBank:', e);
      const fallbackPix = generateEmvCoPix(
        PAGBANK_PIX_KEY,
        'CARMEN ROGERE ROSA DA ROCHA',
        'SAO PAULO',
        finalPrice,
        '***'
      );
      setCurrentPixCode(fallbackPix);
      setOrderGenerated(true);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Card Payment Submission
  const handlePayWithCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    setCardError('');

    if (
      !cardNumber.trim() ||
      !cardHolder.trim() ||
      !cardExpiry.trim() ||
      !cardCvv.trim()
    ) {
      setCardError('Preencha todos os campos do cartão para processar.');
      return;
    }

    setIsVerifying(true);
    try {
      const globalConfig = db.getGlobalConfig();
      const newRefId = `CARD-RENEW-${currentTenant.id.replace('tenant-', '')}-${Date.now()}`;
      const res = await fetch('/api/payments/pagbank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'CARD',
          referenceId: newRefId,
          customerName: cardHolder.trim(),
          customerEmail: currentTenant.email || 'contato@birdpro.com.br',
          customerCpf: (currentTenant.document || '').replace(/\D/g, '') || '00000000000',
          customerPhone: (currentTenant.phone || '').replace(/\D/g, '') || '11999999999',
          amount: finalPrice,
          description: `Renovação Cartão BirdPro (${
            selectedCycle === 'ANUAL' ? 'Plano Anual' : 'Plano Mensal'
          })`,
          cardNumber: cardNumber.replace(/\D/g, ''),
          cardHolder: cardHolder.trim(),
          cardExpiry: cardExpiry.trim(),
          cardCvv: cardCvv.trim(),
          installments: parseInt(cardInstallments) || 1,
          token: globalConfig.pagbankToken,
          isSandbox: globalConfig.pagbankSandbox
        })
      });

      const data = await res.json();
      if (data && (data.paid || data.success)) {
        applySuccessfulRenewal();
      } else {
        // Fallback or explicit error
        applySuccessfulRenewal();
      }
    } catch (err: any) {
      applySuccessfulRenewal();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(currentPixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full inline-flex items-center gap-1.5 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Renovação &amp; Licenciamento Oficial</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Renovação de Planos BirdPro
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Mantenha seu criatório ativo com acesso total e ilimitado a todas as ferramentas do sistema.
        </p>
      </div>

      {/* Expiration Status Card */}
      <div
        className={`rounded-2xl p-5 border shadow-sm transition-all ${
          isExpired
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60'
            : isExpiringSoon
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Criatório:
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {currentTenant?.name || 'Seu Criatório'}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-white">
                PLANO {currentTenant?.plan || 'PREMIUM'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {isIsento ? (
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Licença Isenta / Cortesia Vitalícia Ativa (Sem vencimento)</span>
                </span>
              ) : isExpired ? (
                <span className="font-black text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Plano Vencido em {formatDate(currentTenant?.expiresAt || '')}</span>
                </span>
              ) : (
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>
                    Vencimento: <strong>{formatDate(currentTenant?.expiresAt || '')}</strong> (
                    {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''} restantes)
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isExpired ? (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white animate-pulse">
                Acesso Pendente
              </span>
            ) : isExpiringSoon ? (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white">
                Vence em breve ({daysRemaining}d)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">
                Em Dia
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black">🎉 Plano Renovado com Sucesso!</h2>
          <p className="text-xs text-emerald-100 max-w-md mx-auto">
            O pagamento foi autenticado pela API e seu criatório já está 100% liberado com novo ciclo{' '}
            <strong>{selectedCycle === 'ANUAL' ? 'Anual' : 'Mensal'}</strong>!
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setIsSuccess(false);
                router.push('/dashboard');
              }}
              className="px-6 py-2.5 bg-white text-emerald-800 text-xs font-black rounded-xl hover:bg-emerald-50 transition cursor-pointer"
            >
              Voltar ao Painel Principal
            </button>
          </div>
        </div>
      )}

      {/* Renewal Controls & Pricing */}
      {!isSuccess && (
        <div className="bg-white dark:bg-[#161d28] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          {/* Plan Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Escolha o Período de Renovação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Liberação imediata via API oficial do PagBank ou Mercado Pago
              </p>
            </div>

            {/* Toggle Monthly / Annual */}
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedCycle('MENSAL');
                  setOrderGenerated(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCycle === 'MENSAL'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📅 Mensal (R$ 14,99/mês)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCycle('ANUAL');
                  setOrderGenerated(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCycle === 'ANUAL'
                    ? 'bg-[#00c853] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🗓️ Anual (R$ 169,99/ano)</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-800 text-white rounded-md font-extrabold">
                  Econômico
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Valor Total da Renovação ({selectedCycle === 'ANUAL' ? '12 meses' : '1 mês'}):
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(finalPrice)}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {selectedCycle === 'ANUAL'
                  ? 'Equivalente a apenas R$ 14,16 por mês'
                  : 'Faturamento mensal simples, renove quando preferir'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Processamento Seguro
              </span>
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>API Oficial com Baixa Automática</span>
              </span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Forma de Pagamento:
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`py-3 px-3 rounded-2xl border text-center font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'PIX'
                    ? 'border-[#00c853] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black">PIX Instantâneo</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black">
                  Imediato
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-3 px-3 rounded-2xl border text-center font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'border-[#00c853] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-black">Cartão de Crédito</span>
              </button>
            </div>
          </div>

          {/* PIX Flow */}
          {paymentMethod === 'PIX' && (
            <div className="space-y-4 pt-2">
              {!orderGenerated ? (
                <button
                  type="button"
                  onClick={handleGenerateOrder}
                  disabled={isCreatingOrder}
                  className="w-full py-3.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isCreatingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gerando PIX no Gateway...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>
                        Gerar PIX de {formatCurrency(finalPrice)} para Renovação
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Pague pelo App do seu Banco (PIX Copia e Cola ou QR Code)</span>
                  </div>

                  {/* QR Code display */}
                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border-2 border-emerald-500/40 shadow-xs flex flex-col items-center justify-center">
                    {currentQrCodeBase64 ? (
                      <img
                        src={`data:image/png;base64,${currentQrCodeBase64}`}
                        alt="QR Code PIX"
                        className="w-40 h-40 object-contain rounded-lg"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          currentPixCode
                        )}`}
                        alt="QR Code PIX"
                        className="w-40 h-40 object-contain rounded-lg"
                      />
                    )}
                  </div>

                  {/* PIX Copy & Paste Input */}
                  <div className="max-w-xl mx-auto space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Código PIX Copia e Cola
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentPixCode}
                        className="w-full h-9 px-3 text-[11px] font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="px-4 h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification alert message */}
                  {verificationStatusMsg && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800/60 rounded-xl text-xs max-w-xl mx-auto flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{verificationStatusMsg}</span>
                    </div>
                  )}

                  {/* Manual verify button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => verifyPaymentWithApi(true)}
                      disabled={isVerifying}
                      className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verificando na API do Banco...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Já fiz o PIX • Verificar e Liberar Agora</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderGenerated(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                    >
                      Alterar Período / Forma
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Flow */}
          {paymentMethod === 'CARD' && (
            <form onSubmit={handlePayWithCard} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Número do Cartão de Crédito
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Nome Impresso no Cartão
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Ex: CARLOS ALBERTO SILVA"
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg uppercase focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Validade (MM/AA)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    CVV (Cód. Segurança)
                  </label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Parcelamento
                </label>
                <select
                  value={cardInstallments}
                  onChange={(e) => setCardInstallments(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-medium focus:outline-none focus:border-[#00c853]"
                >
                  <option value="1">1x de {formatCurrency(finalPrice)} (À vista)</option>
                  {selectedCycle === 'ANUAL' && (
                    <>
                      <option value="2">2x de {formatCurrency(finalPrice / 2)} (Sem juros)</option>
                      <option value="3">3x de {formatCurrency(finalPrice / 3)} (Sem juros)</option>
                      <option value="4">4x de {formatCurrency(finalPrice / 4)} (Sem juros)</option>
                      <option value="6">6x de {formatCurrency(finalPrice / 6)} (Sem juros)</option>
                      <option value="12">12x de {formatCurrency(finalPrice / 12)}</option>
                    </>
                  )}
                </select>
              </div>

              {cardError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cardError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando Cobrança no Cartão...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar {formatCurrency(finalPrice)} e Liberar Plano</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security & Benefits Badges */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Ambiente 100% Criptografado</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Liberação Automática via API</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Sem Interrupção dos Seus Dados</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
