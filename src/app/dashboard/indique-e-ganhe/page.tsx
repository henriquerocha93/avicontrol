'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Award, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  QrCode, 
  X, 
  CreditCard,
  Crown,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  Briefcase,
  Target
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { UserReferralProgram, ReferredFriend, AffiliatePayout } from '@/types';

export default function IndiqueEGanhePage() {
  const { tenant } = useAuth();
  const [referralData, setReferralData] = useState<UserReferralProgram | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Modals
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Forms
  const [payoutAmount, setPayoutAmount] = useState('');
  const [pixKeyForm, setPixKeyForm] = useState('');
  const [pixTypeForm, setPixTypeForm] = useState<'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'>('EMAIL');

  const tenantId = tenant?.id || 'tenant-demo-01';

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = () => {
    const data = db.getUserReferral(tenantId);
    const linked = db.getSellerByTenantId(tenantId);
    if (linked) {
      data.isOfficialPartner = true;
      data.partnerType = linked.type;
      data.userCommissionPercent = linked.commissionPercent;
      data.monthlySalesGoal = linked.monthlySalesGoal;
      data.monthlySignupsGoal = linked.monthlySignupsGoal;
      data.goalBonusPercent = linked.goalBonusPercent;
      data.goalBonusFixed = linked.goalBonusFixed;
      data.couponCode = linked.couponCode;
      data.referralCode = linked.affiliateCode;
      data.referralUrl = linked.affiliateUrl;
      if (linked.pixKey) {
        data.pixKey = linked.pixKey;
        data.pixKeyType = linked.pixKeyType;
      }
    }
    setReferralData({ ...data });
    setPixKeyForm(data.pixKey || '');
    setPixTypeForm(data.pixKeyType || 'EMAIL');
  };

  const handleCopyLink = () => {
    if (!referralData) return;
    navigator.clipboard.writeText(referralData.referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCoupon = () => {
    if (!referralData) return;
    navigator.clipboard.writeText(referralData.couponCode);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const readyMessage = referralData 
    ? `Olá amigo criador! 🐦\n\nEstou usando o BIRDPRO para gerenciar todo meu criatório, matrizes, filhotes, reprodução, anilhas e genealogia aviária completa.\n\nUse meu link exclusivo para criar sua conta com 30 DIAS GRÁTIS + 10% DE DESCONTO na sua assinatura:\n👉 ${referralData.referralUrl}\n\nOu use o cupom no checkout: ${referralData.couponCode}`
    : '';

  const handleCopyReadyMessage = () => {
    navigator.clipboard.writeText(readyMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleSavePix = () => {
    if (!pixKeyForm.trim()) {
      alert('Por favor, informe a chave PIX.');
      return;
    }
    db.updateUserReferralPix(tenantId, pixKeyForm.trim(), pixTypeForm);
    loadData();
    setIsPixModalOpen(false);
    alert('Chave PIX atualizada com sucesso!');
  };

  const handleRequestPayout = () => {
    if (!referralData) return;
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      alert('Informe um valor válido para saque.');
      return;
    }
    if (amount > referralData.balanceAvailable) {
      alert('O valor solicitado é maior que seu saldo disponível.');
      return;
    }
    if (!referralData.pixKey) {
      alert('Cadastre sua chave PIX antes de solicitar o resgate.');
      setIsPayoutModalOpen(false);
      setIsPixModalOpen(true);
      return;
    }

    const payout = db.requestUserReferralPayout(tenantId, amount, referralData.pixKey);
    if (payout) {
      loadData();
      setIsPayoutModalOpen(false);
      setPayoutAmount('');
      alert(`🎉 Saque PIX de R$ ${amount.toFixed(2)} registrado com sucesso! O valor será transferido para sua chave cadastrada.`);
    }
  };

  if (!referralData) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Carregando programa de indicações...
      </div>
    );
  }

  // Calculate Gamification Tier
  const totalPaid = referralData.totalPaid || 0;
  let currentTier = {
    name: 'Criador Conector',
    level: 1,
    badge: '🥉 Bronze',
    color: 'from-amber-700 to-amber-900',
    nextLevelAt: 3,
    bonusInfo: `${referralData.userCommissionPercent || 20}% de comissão no PIX`
  };

  if (totalPaid >= 10) {
    currentTier = {
      name: 'Lenda da Ornitologia BIRDPRO',
      level: 4,
      badge: '💎 Diamante',
      color: 'from-cyan-500 to-blue-600',
      nextLevelAt: 10,
      bonusInfo: `${Math.max(25, referralData.userCommissionPercent)}% de comissão + Selo Embaixador Vitalício`
    };
  } else if (totalPaid >= 6) {
    currentTier = {
      name: 'Embaixador de Ouro',
      level: 3,
      badge: '🥇 Ouro',
      color: 'from-amber-400 to-yellow-600',
      nextLevelAt: 10,
      bonusInfo: `${Math.max(22, referralData.userCommissionPercent)}% de comissão + 1 Ano de BIRDPRO Premium Grátis`
    };
  } else if (totalPaid >= 3) {
    currentTier = {
      name: 'Criador Influente',
      level: 2,
      badge: '🥈 Prata',
      color: 'from-slate-300 to-slate-500',
      nextLevelAt: 6,
      bonusInfo: `${referralData.userCommissionPercent}% de comissão + Destaque no Painel`
    };
  }

  const isOfficial = Boolean(referralData.isOfficialPartner || referralData.monthlySalesGoal || referralData.monthlySignupsGoal);
  const isEmbaixador = referralData.partnerType === 'EMBAIXADOR';
  const signupsGoal = referralData.monthlySignupsGoal || 25;
  const salesGoal = referralData.monthlySalesGoal || 5000;
  const currentGoalPct = isEmbaixador 
    ? Math.min(100, Math.round((referralData.totalPaid / signupsGoal) * 100))
    : Math.min(100, Math.round((referralData.totalEarnings / (salesGoal * (referralData.userCommissionPercent / 100))) * 100));

  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(readyMessage)}`;

  return (
    <div className="space-y-6 pb-20 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Indique &amp; Ganhe</span>
      </div>

      {/* Hero Banner with Rewards Accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101720] via-[#1a2330] to-[#0f2e1e] text-white p-6 md:p-8 border border-emerald-500/30 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 opacity-15 pointer-events-none hidden md:block">
          <Gift className="w-56 h-56 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Programa Oficial de Indicação BIRDPRO</span>
            </div>

            {isOfficial && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                {isEmbaixador ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Briefcase className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isEmbaixador ? '👑 Embaixador Oficial' : '💼 Vendedor Comercial'}</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Indique Amigos Criadores e Ganhe <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">{referralData.userCommissionPercent}% de Comissão no PIX!</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Compartilhe seu link exclusivo com amigos criadores, clubes e grupos de pássaros. 
            Seu amigo ganha <strong className="text-amber-300 font-bold">10% de DESCONTO</strong> na assinatura e você recebe <strong className="text-emerald-400 font-bold">{referralData.userCommissionPercent}% de volta em dinheiro via PIX</strong> direto na sua conta!
          </p>

          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <a
              href={whatsAppShareUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950/40 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
              <span>Compartilhar no WhatsApp</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center space-x-2 transition backdrop-blur-xs cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link de Indicação'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Criatórios Indicados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Criatórios Indicados</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-800">{referralData.totalInvited}</span>
              <span className="text-xs text-slate-500 font-medium">amigos</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {referralData.totalClicks} cliques registrados
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Assinaturas Pagas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assinaturas Ativas</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-600">{referralData.totalPaid}</span>
              <span className="text-xs text-slate-500 font-medium">convertidos</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold block">
              Comissões ativas geradas
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Ganho */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Ganho no Programa</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-purple-700">
                R$ {referralData.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              R$ {referralData.totalWithdrawn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} já resgatados
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Saldo Disponível & Botão de Saque */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-xl shadow-md flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Saldo Disponível (PIX)</span>
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              R$ {referralData.balanceAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-100/90 font-medium">
              Pronto para transferência instantânea
            </span>
          </div>
          <button
            onClick={() => {
              setPayoutAmount(referralData.balanceAvailable.toString());
              setIsPayoutModalOpen(true);
            }}
            disabled={referralData.balanceAvailable <= 0}
            className="w-full py-2 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-white text-emerald-800 text-xs font-black rounded-lg transition shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Solicitar Saque PIX</span>
          </button>
        </div>
      </div>

      {/* Official Partner Stipulated Goals Banner (when active) */}
      {isOfficial && (
        <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs p-5 space-y-3 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                <Target className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <span>Suas Metas &amp; Bônus Oficiais ({isEmbaixador ? 'Embaixador' : 'Vendedor'})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">
                    {referralData.userCommissionPercent}% Base
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Estipulado pelo Super Administrador. Bata sua meta mensal para receber bônus exclusivos no PIX.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentGoalPct >= 100 ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🎉 META ATINGIDA!
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {currentGoalPct}% Concluído
                </span>
              )}
            </div>
          </div>

          {/* Goal Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>{isEmbaixador ? `${referralData.totalPaid} criatórios convertidos` : `R$ ${referralData.totalEarnings.toFixed(2)} acumulados`}</span>
              <span className="text-slate-500">Meta: {isEmbaixador ? `${signupsGoal} criatórios` : `R$ ${salesGoal.toFixed(2)}`}</span>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500" 
                style={{ width: `${currentGoalPct}%` }}
              />
            </div>
          </div>

          {/* Incentives */}
          {(referralData.goalBonusPercent || referralData.goalBonusFixed) && (
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              {referralData.goalBonusPercent ? (
                <span className="px-2.5 py-1 bg-amber-100 border border-amber-200 text-amber-900 rounded-lg font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>+{referralData.goalBonusPercent}% Bônus Extra por Meta</span>
                </span>
              ) : null}
              {referralData.goalBonusFixed ? (
                <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-lg font-bold flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+R$ {referralData.goalBonusFixed.toFixed(2)} Bônus Fixo no PIX</span>
                </span>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Share Center & Gamification Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Col Left: Link & Tools (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Seus Links &amp; Cupons de Divulgação</span>
              </h2>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="text-xs text-slate-600 hover:text-emerald-600 flex items-center gap-1 font-bold cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Ver QR Code</span>
              </button>
            </div>

            {/* Referral Link Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Seu Link Exclusivo (Garante 10% de desconto para seu amigo)
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 truncate">
                  <span className="text-emerald-700 font-bold truncate">{referralData.referralUrl}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Coupon Code Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Seu Cupom de Desconto
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-amber-50/70 border border-amber-200 rounded-lg px-3 py-1.5 text-xs font-mono font-black text-amber-800 uppercase tracking-widest text-center">
                    {referralData.couponCode}
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 transition cursor-pointer"
                    title="Copiar Cupom"
                  >
                    {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* PIX Key Setting */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Chave PIX Cadastrada
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 truncate font-mono">
                    {referralData.pixKey ? `${referralData.pixKey} (${referralData.pixKeyType})` : 'Nenhuma chave'}
                  </div>
                  <button
                    onClick={() => setIsPixModalOpen(true)}
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>

            {/* Ready-to-send message */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mensagem Pronta para Grupos e WhatsApp
                </span>
                <button
                  onClick={handleCopyReadyMessage}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedMessage ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMessage ? 'Copiada!' : 'Copiar Texto'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600 whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-200/80 font-sans leading-relaxed">
                {readyMessage}
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <a
                  href={whatsAppShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold rounded-lg flex items-center space-x-1.5 transition shadow-xs"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  <span>Enviar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Col Right: Gamification & Tiers (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Current Level Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTier.color} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Seu Nível Atual</span>
                  <h3 className="text-sm font-black text-slate-800">{currentTier.name}</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                {currentTier.badge}
              </span>
            </div>

            {/* Level Progress */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{totalPaid} indicações pagas</span>
                <span className="text-slate-400">Próxima meta: {currentTier.nextLevelAt}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalPaid / currentTier.nextLevelAt) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                <span>{Math.min(100, Math.round((totalPaid / currentTier.nextLevelAt) * 100))}% concluído</span>
                <span className="text-emerald-700 font-bold">{currentTier.bonusInfo}</span>
              </div>
            </div>

            {/* Tiers List */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escala de Premiações</span>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-800">🥉 Nível Bronze (1-2)</span>
                </div>
                <span className="font-bold text-slate-700">20% no PIX</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">🥈 Nível Prata (3-5)</span>
                </div>
                <span className="font-bold text-slate-700">20% + Destaque</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-700">🥇 Nível Ouro (6-9)</span>
                </div>
                <span className="font-bold text-amber-800">22% + 1 Ano Grátis</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-50/50 border border-cyan-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">💎 Nível Diamante (10+)</span>
                </div>
                <span className="font-bold text-blue-800">25% Vitalício</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* How It Works Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Como Funciona o Indique &amp; Ganhe</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-800">Pegue seu link exclusivo</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Copie seu link ou código de cupom pessoal acima. Ele é único e rastreia todas as visitas do seu criatório.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-800">Compartilhe com amigos</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Envie no WhatsApp de amigos criadores, grupos de torneios, clubes ornitológicos e redes sociais.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-800">Amigo ganha 10% OFF</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Ao criar a conta pelo seu link, seu amigo ganha 30 dias grátis de teste e 10% de desconto na primeira anuidade.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
              4
            </div>
            <h4 className="font-bold text-xs text-slate-800">Você recebe no PIX</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Quando ele assinar qualquer plano do BIRDPRO, 20% do valor cai no seu saldo e você pode sacar via PIX quando quiser!
            </p>
          </div>
        </div>
      </div>

      {/* Referrals History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
              Histórico de Amigos Indicados ({referralData.referrals?.length || 0})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Atualizado em tempo real
          </span>
        </div>

        {(!referralData.referrals || referralData.referrals.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Você ainda não possui amigos indicados.</p>
            <p className="text-slate-400">Compartilhe seu link exclusivo no WhatsApp para começar a ganhar!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-5 py-3">Criador / Criatório</th>
                  <th className="px-4 py-3">Data do Convite</th>
                  <th className="px-4 py-3">Plano Escolhido</th>
                  <th className="px-4 py-3">Status do Amigo</th>
                  <th className="px-4 py-3 text-right">Sua Recompensa</th>
                  <th className="px-5 py-3 text-right">Status do Bônus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referralData.referrals.map((friend) => (
                  <tr key={friend.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800">{friend.friendName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{friend.criatorioName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {new Date(friend.signupDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-700 font-medium">
                        {friend.planName || 'Em Período de Teste'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {friend.status === 'ACTIVE_PAID' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Assinatura Ativa
                        </span>
                      ) : friend.status === 'TRIAL' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Teste Grátis (30 Dias)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Expirado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-slate-800">
                      R$ {friend.rewardAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {friend.rewardStatus === 'PAID' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
                          Pago no PIX
                        </span>
                      ) : friend.rewardStatus === 'AVAILABLE' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                          Disponível p/ Saque
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                          Aguardando Assinatura
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payouts History */}
      {referralData.payouts && referralData.payouts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Histórico de Saques PIX Recebidos</span>
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {referralData.payouts.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    Saque PIX de R$ {p.amount.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Chave: {p.pixKey} • {new Date(p.createdAt).toLocaleDateString('pt-BR')} às {new Date(p.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>PAGO COM SUCESSO</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SOLICITAR SAQUE PIX                                           */}
      {/* ==================================================================== */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Solicitar Resgate de Comissões PIX</span>
              </span>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 space-y-1">
                <div>Saldo Disponível: <strong>R$ {referralData.balanceAvailable.toFixed(2)}</strong></div>
                <div>Chave PIX de Destino: <strong>{referralData.pixKey || 'Não cadastrada'}</strong> ({referralData.pixKeyType})</div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Valor a Sacar (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                💡 O valor será transferido instantaneamente via PIX para sua conta após a confirmação.
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRequestPayout}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
              >
                Confirmar Saque PIX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CONFIGURAR CHAVE PIX                                          */}
      {/* ==================================================================== */}
      {isPixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-[#171b21] text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Configurar Chave PIX para Recebimentos</span>
              </span>
              <button onClick={() => setIsPixModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tipo de Chave PIX</label>
                <select
                  value={pixTypeForm}
                  onChange={(e) => setPixTypeForm(e.target.value as any)}
                  className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-medium"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Telefone Celular</option>
                  <option value="RANDOM">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Sua Chave PIX</label>
                <input
                  type="text"
                  value={pixKeyForm}
                  onChange={(e) => setPixKeyForm(e.target.value)}
                  placeholder="Digite sua chave PIX"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsPixModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePix}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
              >
                Salvar Chave PIX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: QR CODE DE INDICAÇÃO                                          */}
      {/* ==================================================================== */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden text-center p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                QR Code de Indicação BIRDPRO
              </span>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block mx-auto shadow-inner">
              <div className="w-48 h-48 bg-white border-2 border-slate-900 rounded-lg p-2 flex flex-col items-center justify-center space-y-2">
                <QrCode className="w-36 h-36 text-slate-900" />
                <span className="text-[9px] font-mono font-bold text-slate-600">ref={referralData.referralCode}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">Mostre este QR Code para outros criadores</p>
              <p className="text-[11px] text-slate-500">
                Basta apontar a câmera do celular para se cadastrar com seu link e 10% de desconto!
              </p>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width="24" 
      height="24"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}
