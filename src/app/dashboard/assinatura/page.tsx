'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  QrCode, 
  Copy, 
  CheckCircle2,
  Lock,
  Tag,
  AlertCircle,
  Building2,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { PlanType, CouponValidationResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateEmvCoPix } from '@/lib/pagbank';

export default function AssinaturaPage() {
  const { tenant, refreshTenant } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<PlanType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD' | 'BOLETO'>('PIX');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Discount Coupon States
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState('');

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');

  const basePrice = billingCycle === 'ANNUAL' ? 169.99 : 14.99;
  
  // Calculate discount
  const discountPercent = appliedCoupon?.valid ? appliedCoupon.discountPercent : 0;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = Math.max(1, basePrice - discountAmount);

  // PagBank PIX Code generation
  const globalConfig = db.getGlobalConfig();
  const pagbankPixKey = globalConfig.pagbankPixKey || '6f33236f-92cb-4012-b0a8-332e3af35039';
  const txid = `PGB${Date.now().toString().slice(-8)}`;
  const currentPixCode = generateEmvCoPix(
    pagbankPixKey, 
    'BIRDPRO TECNOLOGIA', 
    'SAO PAULO', 
    finalPrice, 
    txid
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCodeInput.trim()) {
      setCouponError('Por favor digite um cupom de desconto.');
      return;
    }

    const result = db.validateCoupon(couponCodeInput);
    if (result.valid) {
      setAppliedCoupon(result);
      setCouponError('');
    } else {
      setAppliedCoupon(null);
      setCouponError(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
  };

  const handleOpenCheckout = (planId: PlanType) => {
    setSelectedPlanToBuy(planId);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlanToBuy || !tenant) return;
    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Activate/Renew tenant plan in DB
      const monthsToAdd = billingCycle === 'ANNUAL' ? 12 : 1;
      const updatedTenant = db.renewTenantPlan(tenant.id, monthsToAdd);
      if (updatedTenant) {
        db.updateTenant({
          plan: 'PREMIUM',
          billingCycle: billingCycle === 'ANNUAL' ? 'ANUAL' : 'MENSAL',
          planStatus: 'ACTIVE',
          maxBirds: 99999
        }, tenant.id);
      }

      // 2. If a seller / affiliate coupon was used, record commission
      if (appliedCoupon?.sellerId) {
        db.addCommission({
          id: `comm-${Date.now()}`,
          affiliateId: appliedCoupon.sellerId,
          affiliateName: appliedCoupon.sellerName || 'Parceiro BirdPro',
          tenantId: tenant.id,
          tenantName: tenant.name,
          planName: `Plano Completo ${billingCycle === 'ANNUAL' ? 'Anual' : 'Mensal'}`,
          saleValue: finalPrice,
          commissionPercent: 20,
          commissionAmount: (finalPrice * 20) / 100,
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        });
      }

      refreshTenant();
      setIsSubmitting(false);
      setSelectedPlanToBuy(null);
      setIsSuccessModalOpen(true);
    }, 1200);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(currentPixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Plano Completo Sem Restrições</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Gestão Profissional para seu Criatório
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Acesso ilimitado a 100% das ferramentas do BIRDPRO: Genealogia, SISPASS, Pedigree A4 com QR Code, Medicamentos e muito mais.
        </p>

        {/* Toggle Monthly / Annual */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 mt-2">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'MONTHLY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📅 Mensalidade (R$ 14,99/mês)
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'ANNUAL' ? 'bg-[#00c853] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🗓️ Anuidade (R$ 169,99/ano)</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-800 text-white rounded-md font-extrabold">
              Mais Econômico
            </span>
          </button>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-[#171b21] text-white rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Criatório Ativo:</span>
            <span className="font-bold text-sm text-white">{tenant?.name}</span>
            <span className="font-black text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              PLANO COMPLETO BIRDPRO
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {tenant?.billingCycle === 'ISENTO' 
              ? '🛡️ Licença Isenta / Cortesia Vitalícia Ativa' 
              : `Vencimento do ciclo atual: ${formatDate(tenant?.expiresAt || new Date().toISOString())}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            {tenant?.planStatus === 'ACTIVE' ? '✅ Acesso Liberado' : '⚡ Renovação Disponível'}
          </Badge>
        </div>
      </div>

      {/* Plan Card (Unified Complete Plan) */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#00c853] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#00c853] text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-xl tracking-wider">
          Plano Tudo Incluso
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              PLANO COMPLETO BIRDPRO
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sem limites de aves, sem travas ou custos adicionais por módulo.
            </p>
          </div>

          {/* Pricing display */}
          <div className="py-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {formatCurrency(basePrice)}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  /{billingCycle === 'ANNUAL' ? 'ano' : 'mês'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                {billingCycle === 'ANNUAL' 
                  ? 'Apenas R$ 14,16 por mês faturado anualmente' 
                  : 'Faturamento mensal sem fidelidade, cancele quando quiser'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Gateway Oficial</span>
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>PagBank (PagSeguro)</span>
              </span>
            </div>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 pt-2">
            {[
              'Aves, Gaiolas e Plantel Ilimitados',
              'Genealogia Completa de até 4 Gerações',
              'Emissão de Pedigree A4 com QR Code',
              'Controle de Anilhamento FOB & SISPASS',
              'Reprodução, Ninhos, Posturas e Eclosão',
              'Prontuário Veterinário & Farmácia',
              'Laudos de Sexagem DNA e Genotipagem',
              'Importação em Massa via Planilha Excel',
              'Backup Prioritário em Nuvem Seguro',
              'Suporte Técnico Direto pelo WhatsApp'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-3" />
                </div>
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => handleOpenCheckout('PREMIUM')}
              className="w-full py-3.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <span>Contratar Plano {billingCycle === 'ANNUAL' ? 'Anual' : 'Mensal'} via PagBank</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHECKOUT MODAL COM INTEGRAÇÃO PAGBANK & CUPOM DE DESCONTO             */}
      {/* ==================================================================== */}
      {selectedPlanToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header with PagBank badge */}
            <div className="px-6 py-4 bg-[#171b21] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00c853]" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Checkout Seguro PagBank (PagSeguro)
                </span>
              </div>
              <button onClick={() => setSelectedPlanToBuy(null)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Order Summary & Coupon Form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Plano Completo BirdPro ({billingCycle === 'ANNUAL' ? 'Anual' : 'Mensal'})</span>
                  <span>{formatCurrency(basePrice)}</span>
                </div>

                {/* Applied Coupon Display */}
                {appliedCoupon?.valid && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-100/60 px-3 py-1.5 rounded-lg border border-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Cupom <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountPercent}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>-{formatCurrency(discountAmount)}</span>
                      <button 
                        type="button" 
                        onClick={handleRemoveCoupon} 
                        className="text-red-500 hover:text-red-700 text-[11px] underline cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}

                {/* Final Total */}
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="font-extrabold text-slate-700">Total a Pagar:</span>
                  <span className="text-xl font-black text-emerald-600">{formatCurrency(finalPrice)}</span>
                </div>
              </div>

              {/* Coupon Input Form */}
              {!appliedCoupon?.valid && (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span>Possui um Cupom de Desconto ou Código de Parceiro?</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="Ex: MADRUGUINHA10, BIRDPRO10"
                      className="w-full h-9 px-3 text-xs uppercase font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#00c853]"
                    />
                    <button
                      type="submit"
                      className="px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition whitespace-nowrap cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </form>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-2">
                  Forma de Pagamento PagBank:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'PIX'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">⚡ PIX PagBank</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Imediato</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">💳 Cartão PagBank</span>
                    <span className="text-[10px] text-slate-500 font-medium">Até 12x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BOLETO')}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'BOLETO'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">📄 Boleto</span>
                    <span className="text-[10px] text-slate-500 font-medium">1 a 3 dias</span>
                  </button>
                </div>
              </div>

              {/* PIX PagBank View */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>QR Code PIX PagBank PagSeguro</span>
                  </div>

                  {/* Visual QR Code Box */}
                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border-2 border-emerald-500/40 shadow-xs flex flex-col items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentPixCode)}`} 
                      alt="QR Code PIX PagBank" 
                      className="w-40 h-40 object-contain rounded-lg"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Abra o aplicativo do seu banco, selecione a opção <strong>PIX Copia e Cola</strong> e cole o código abaixo:
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentPixCode}
                      className="w-full h-8.5 px-2.5 text-[10px] font-mono bg-white border border-slate-300 rounded-lg text-slate-600 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3 h-8.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {pixCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Card PagBank View */}
              {paymentMethod === 'CARD' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Número do Cartão de Crédito</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Ex: MARCOS A SILVA"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg uppercase focus:outline-none focus:border-[#00c853]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Validade</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Parcelas PagBank</label>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(e.target.value)}
                      className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-[#00c853]"
                    >
                      <option value="1">1x de {formatCurrency(finalPrice)} (Sem juros)</option>
                      {billingCycle === 'ANNUAL' && (
                        <>
                          <option value="2">2x de {formatCurrency(finalPrice / 2)} (Sem juros)</option>
                          <option value="3">3x de {formatCurrency(finalPrice / 3)} (Sem juros)</option>
                          <option value="6">6x de {formatCurrency(finalPrice / 6)} (Sem juros)</option>
                          <option value="12">12x de {formatCurrency((finalPrice * 1.08) / 12)} (PagBank)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Boleto PagBank View */}
              {paymentMethod === 'BOLETO' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-800">Boleto Bancário PagBank</p>
                  <p className="text-[11px] text-slate-500">
                    O boleto será gerado com vencimento para 3 dias úteis. A confirmação ocorre automaticamente em até 24h após a quitação.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedPlanToBuy(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-lg transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processando no PagBank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Pagamento &amp; Liberar Acesso</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUCCESS MODAL                                                        */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="🎉 Pagamento Confirmado com Sucesso!"
        description="O Plano Completo BIRDPRO já está 100% ativo para seu criatório."
        maxWidth="sm"
      >
        <div className="text-center py-4 space-y-4 font-sans">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00c853] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Seu pagamento via <strong>PagBank (PagSeguro)</strong> foi autenticado com sucesso. 
            Todos os módulos avançados, limite ilimitado de aves e genealogia VIP estão liberados!
          </p>
          <Button className="w-full font-black bg-[#00c853] hover:bg-[#00b84a]" onClick={() => setIsSuccessModalOpen(false)}>
            Acessar Painel do Criatório
          </Button>
        </div>
      </Modal>
    </div>
  );
}
