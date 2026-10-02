'use client';

import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { PlanType } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AssinaturaPage() {
  const { tenant, refreshTenant } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<PlanType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD' | 'BOLETO'>('PIX');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const plans = [
    {
      id: 'PRO' as PlanType,
      name: 'Plano Mensal Completo',
      badge: 'Sem Fidelidade',
      monthlyPrice: 14.90,
      annualPrice: 14.90,
      limitBirds: 99999,
      features: [
        'Acesso Total e Ilimitado a 100% da plataforma',
        'Sem taxas extras e sem custos para upgrades',
        'Aves, gaiolas e anilhas ilimitadas',
        'Genealogia de 4 gerações & Pedigree A4 com QR Code',
        'Reprodução, ovoscopia, ninhos e eclosão',
        'Saúde, medicamentos, sexagem DNA e genotipagem',
        'Importação em massa via planilha Excel',
        'Cancele quando quiser, sem carência'
      ],
      cta: 'Assinar Plano Mensal (R$ 14,99)',
      popular: false
    },
    {
      id: 'PREMIUM' as PlanType,
      name: 'Plano Anual Completo',
      badge: 'Mais Vantajoso',
      monthlyPrice: 14.16,
      annualPrice: 169.99,
      limitBirds: 99999,
      features: [
        'Acesso Total e Ilimitado a 100% da plataforma',
        'Sem taxas extras e sem custos para upgrades',
        '12 meses de acesso garantido com desconto',
        'Aves, gaiolas e anilhas ilimitadas',
        'Genealogia de 4 gerações & Pedigree A4 com QR Code',
        'Reprodução, ovoscopia, ninhos e eclosão',
        'Saúde, medicamentos, sexagem DNA e genotipagem',
        'Backup prioritário contínuo em nuvem',
        'Suporte VIP via WhatsApp'
      ],
      cta: 'Assinar Plano Anual (R$ 169,99)',
      popular: true
    }
  ];

  const handleOpenCheckout = (planId: PlanType) => {
    setSelectedPlanToBuy(planId);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlanToBuy) return;

    db.updateTenant({
      plan: selectedPlanToBuy,
      planStatus: 'ACTIVE',
      maxBirds: selectedPlanToBuy === 'FREE' ? 20 : selectedPlanToBuy === 'PRO' ? 500 : 99999
    }, tenant?.id);

    refreshTenant();
    setSelectedPlanToBuy(null);
    setIsSuccessModalOpen(true);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136birdpro-pagamentos-pix-99881235204000053039865802BR5920BIRDPRO TECNOLOGIA6009SAO PAULO62070503***6304E8A2');
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
          Assinatura & Planos Transparentes
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Escale a gestão do seu criatório com alta tecnologia
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Escolha o plano ideal para a quantidade de aves do seu plantel. Cancele ou altere a qualquer momento.
        </p>

        {/* Toggle Monthly / Annual */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 mt-2">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'MONTHLY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'ANNUAL' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
            }`}
          >
            <span>Anual</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-700 text-white rounded-md font-extrabold">
              Economize 20%
            </span>
          </button>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seu Plano Atual:</span>
            <span className="font-extrabold text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              {tenant?.plan || 'PREMIUM'}
            </span>
            <Badge variant="success" size="sm">Ativo</Badge>
          </div>
          <p className="text-sm font-bold text-white">
            Limite de aves do seu plano: {tenant?.maxBirds ? `${tenant.maxBirds} aves` : 'Aves Ilimitadas'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Próxima renovação: 01/10/2027</span>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((p) => {
          const price = billingCycle === 'ANNUAL' ? p.annualPrice : p.monthlyPrice;
          const isCurrent = tenant?.plan === p.id;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-200 flex flex-col justify-between relative ${
                p.popular 
                  ? 'border-2 border-emerald-600 shadow-xl scale-102' 
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-md">
                  Mais Recomendado
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Capacidade de até {p.limitBirds > 1000 ? 'Aves Ilimitadas' : `${p.limitBirds} aves`}</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {price === 0 ? 'Grátis' : formatCurrency(price)}
                    </span>
                    {price > 0 && <span className="text-xs text-slate-400">/mês</span>}
                  </div>
                  {billingCycle === 'ANNUAL' && price > 0 && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Cobrado anualmente com desconto</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  variant={p.popular ? 'primary' : 'outline'}
                  size="md"
                  className="w-full font-bold"
                  disabled={isCurrent}
                  onClick={() => handleOpenCheckout(p.id)}
                >
                  {isCurrent ? 'Plano Atual Ativo' : p.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {selectedPlanToBuy && (
        <Modal
          isOpen={!!selectedPlanToBuy}
          onClose={() => setSelectedPlanToBuy(null)}
          title={
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>Checkout Seguro BIRDPRO</span>
            </div>
          }
          description={`Assinatura do Plano ${selectedPlanToBuy} (${billingCycle === 'ANNUAL' ? 'Anual' : 'Mensal'})`}
          maxWidth="md"
        >
          <div className="space-y-5 text-xs">
            {/* Payment Methods Tabs */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Selecione a Forma de Pagamento:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PIX')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paymentMethod === 'PIX' ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  ⚡ PIX (Instantâneo)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paymentMethod === 'CARD' ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  💳 Cartão
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BOLETO')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paymentMethod === 'BOLETO' ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  📄 Boleto
                </button>
              </div>
            </div>

            {/* PIX View */}
            {paymentMethod === 'PIX' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <p className="font-bold text-slate-800 text-xs">Escaneie o QR Code PIX para ativação imediata</p>
                <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="00020126580014br.gov.bcb.pix0136birdpro-pagamentos-pix-99881235..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-mono"
                  />
                  <button
                    onClick={handleCopyPix}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold whitespace-nowrap"
                  >
                    {pixCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {/* Card View */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número do Cartão</label>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• 8890"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Validade</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedPlanToBuy(null)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmPayment}>
                Confirmar Pagamento & Ativar Plano
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="🎉 Assinatura Confirmada com Sucesso!"
        description="Seu criatório agora possui todos os recursos do plano ativado."
        maxWidth="sm"
      >
        <div className="text-center py-4 space-y-3">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
          <p className="text-xs text-slate-600">
            Obrigado por confiar no <strong>BIRDPRO</strong>! Seus limites de aves foram atualizados e o comprovante foi enviado ao seu e-mail.
          </p>
          <Button className="w-full" onClick={() => setIsSuccessModalOpen(false)}>
            Voltar ao Painel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
