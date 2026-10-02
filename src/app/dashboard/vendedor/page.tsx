'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Award, 
  Zap, 
  Sparkles, 
  Copy, 
  Check, 
  Gift, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  Crown, 
  Briefcase, 
  ArrowRight, 
  CheckCheck, 
  Flame, 
  QrCode, 
  X,
  CreditCard,
  MessageCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/db'
import { SellerAffiliate, AffiliateCommission, AffiliatePayout } from '@/types'

export default function VendedorDashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const [seller, setSeller] = useState<SellerAffiliate | null>(null)
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCoupon, setCopiedCoupon] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)

  // Modals
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [isPixModalOpen, setIsPixModalOpen] = useState(false)
  
  // Forms
  const [payoutAmount, setPayoutAmount] = useState('')
  const [pixKeyForm, setPixKeyForm] = useState('')
  const [pixTypeForm, setPixTypeForm] = useState<'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'>('CPF')

  useEffect(() => {
    loadSellerData()
  }, [user])

  const loadSellerData = () => {
    const sellers = db.getSellers()
    const userEmail = user?.email?.toLowerCase().trim() || ''
    
    // Find seller by email or linked user or fallback to first seller for demo
    let found = sellers.find(s => s.email.toLowerCase().trim() === userEmail)
    if (!found && user?.id) {
      found = sellers.find(s => s.linkedUserId === user.id || s.id === user.tenantId?.replace('seller-tenant-', ''))
    }
    if (!found) {
      found = sellers[0] // Fallback to demo seller
    }

    if (found) {
      setSeller({ ...found })
      setPixKeyForm(found.pixKey || '')
      setPixTypeForm(found.pixKeyType || 'CPF')
      setCommissions(db.getCommissions(found.id))
      setPayouts(db.getPayouts(found.id))
    }
  }

  const handleCopyLink = () => {
    if (!seller) return
    navigator.clipboard.writeText(seller.affiliateUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyCoupon = () => {
    if (!seller) return
    navigator.clipboard.writeText(seller.couponCode)
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2000)
  }

  const readyMessage = seller 
    ? `Olá amigo criador! 🐦\n\nConheça o BIRDPRO, o sistema mais completo do Brasil para gestão de criatórios de pássaros, anilhas, matrizes, filhotes e genealogia oficial.\n\nAcesse pelo meu link exclusivo para testar GRÁTIS e garantir seu desconto especial:\n👉 ${seller.affiliateUrl}\n\nOu utilize meu cupom no checkout: ${seller.couponCode}`
    : ''

  const handleCopyReadyMessage = () => {
    navigator.clipboard.writeText(readyMessage)
    setCopiedMessage(true)
    setTimeout(() => setCopiedMessage(false), 2000)
  }

  const handleSavePix = () => {
    if (!seller) return
    if (!pixKeyForm.trim()) {
      alert('Informe sua chave PIX.')
      return
    }
    const updated: SellerAffiliate = {
      ...seller,
      pixKey: pixKeyForm.trim(),
      pixKeyType: pixTypeForm
    }
    db.updateSeller(updated)
    setSeller(updated)
    setIsPixModalOpen(false)
    alert('Chave PIX atualizada com sucesso!')
  }

  const handleRequestPayout = () => {
    if (!seller) return
    const amount = parseFloat(payoutAmount)
    if (!amount || amount <= 0) {
      alert('Informe um valor válido para resgate.')
      return
    }
    if (amount > seller.balanceAvailable) {
      alert('O valor solicitado é maior que seu saldo disponível.')
      return
    }
    if (!seller.pixKey) {
      alert('Cadastre sua chave PIX antes de solicitar o resgate.')
      setIsPayoutModalOpen(false)
      setIsPixModalOpen(true)
      return
    }

    const payout: AffiliatePayout = {
      id: `pay-${Date.now()}`,
      affiliateId: seller.id,
      affiliateName: seller.name,
      amount,
      pixKey: seller.pixKey,
      status: 'COMPLETED',
      receiptUrl: `https://comprovante.pix.birdpro.com.br/tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }

    db.requestPayout(payout)
    loadSellerData()
    setIsPayoutModalOpen(false)
    setPayoutAmount('')
    alert(`🎉 Saque PIX de R$ ${amount.toFixed(2)} registrado com sucesso! O valor foi debitado do seu saldo e transferido para sua chave cadastrada.`)
  }

  if (!seller) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Carregando painel de vendas...
      </div>
    )
  }

  const isEmbaixador = seller.type === 'EMBAIXADOR'
  const salesGoal = seller.monthlySalesGoal || (isEmbaixador ? 10000 : 5000)
  const signupsGoal = seller.monthlySignupsGoal || (isEmbaixador ? 50 : 25)

  // Goal progress
  const primaryGoalPct = isEmbaixador
    ? Math.min(100, Math.round((seller.totalSignups / signupsGoal) * 100))
    : Math.min(100, Math.round((seller.totalSalesValue / salesGoal) * 100))

  const isGoalReached = isEmbaixador 
    ? seller.totalSignups >= signupsGoal 
    : seller.totalSalesValue >= salesGoal

  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(readyMessage)}`

  return (
    <div className="space-y-6 pb-20 w-full font-sans max-w-7xl mx-auto">
      
      {/* Top Welcome & Partner Level Header */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
            isEmbaixador 
              ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-amber-500/20' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/20'
          }`}>
            {isEmbaixador ? <Crown className="w-7 h-7" /> : <Briefcase className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-800">
                Olá, {seller.name}
              </h1>
              <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                isEmbaixador 
                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {isEmbaixador ? '👑 Embaixador Oficial BIRDPRO' : '💼 Vendedor Comercial BIRDPRO'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ATIVO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Acompanhe seu desempenho de vendas, faturamento gerado, metas do mês e solicite saques de comissões via PIX.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPixModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span>Chave PIX</span>
          </button>

          <button
            onClick={() => {
              setPayoutAmount(seller.balanceAvailable.toString())
              setIsPayoutModalOpen(true)
            }}
            disabled={seller.balanceAvailable <= 0}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Solicitar Saque PIX</span>
          </button>
        </div>
      </div>

      {/* Main Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento Gerado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Gerado</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-800">
                R$ {seller.totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {seller.totalSignups} criatórios ativos
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Comissão Base & Bônus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sua Comissão Oficial</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-purple-700">{seller.commissionPercent}%</span>
              <span className="text-xs text-slate-500 font-semibold">no PIX</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <Zap className="w-3 h-3" />
              <span>+{seller.goalBonusPercent || 0}% extra ao bater meta</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Ganho Acumulado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Ganho Acumulado</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-700">
                R$ {seller.totalCommissionsEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              R$ {seller.totalCommissionsPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} já pagos
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Saldo Disponível para Saque */}
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-teal-50 p-5 rounded-2xl border border-emerald-300/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Saldo Disponível</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-emerald-700">
                R$ {seller.balanceAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => {
                setPayoutAmount(seller.balanceAvailable.toString())
                setIsPayoutModalOpen(true)
              }}
              disabled={seller.balanceAvailable <= 0}
              className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1 pt-0.5 cursor-pointer disabled:opacity-40"
            >
              <span>Resgatar agora via PIX</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Goal & Bonus Performance Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4" id="metas">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Meta do Mês &amp; Bônus de Performance
              </h2>
              <p className="text-xs text-slate-400">
                Bata as metas estipuladas para desbloquear comissões extras e premiações em dinheiro no PIX.
              </p>
            </div>
          </div>

          {isGoalReached ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>🎉 PARABÉNS! META ATINGIDA</span>
            </span>
          ) : primaryGoalPct >= 70 ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 self-start sm:self-auto">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Na reta final ({primaryGoalPct}%)</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
              {primaryGoalPct}% concluído
            </span>
          )}
        </div>

        {/* Progress Bar & Indicators */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            {isEmbaixador ? (
              <>
                <span>Progresso: <strong>{seller.totalSignups}</strong> criatórios cadastrados</span>
                <span className="text-slate-500">Meta: <strong>{signupsGoal}</strong> criatórios</span>
              </>
            ) : (
              <>
                <span>Progresso: <strong>R$ {seller.totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> em vendas</span>
                <span className="text-slate-500">Meta: <strong>R$ {salesGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              </>
            )}
          </div>

          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
            <div 
              className={`h-3 rounded-full transition-all duration-700 ${
                isGoalReached 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/50' 
                  : isEmbaixador 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
              }`}
              style={{ width: `${primaryGoalPct}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>{primaryGoalPct}% da meta mensal atingida</span>
            {isGoalReached ? (
              <span className="text-emerald-700 font-bold">Incentivos e bônus desbloqueados com sucesso!</span>
            ) : (
              <span>Faltam {isEmbaixador ? `${Math.max(0, signupsGoal - seller.totalSignups)} criatórios` : `R$ ${Math.max(0, salesGoal - seller.totalSalesValue).toFixed(2)}`} para bater a meta</span>
            )}
          </div>
        </div>

        {/* Incentives Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-start space-x-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">Bônus de Comissão Extra</div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                {seller.goalBonusPercent 
                  ? `+${seller.goalBonusPercent}% adicional em todas as vendas do mês (totalizando ${(seller.commissionPercent + seller.goalBonusPercent)}%).`
                  : 'Nenhum bônus percentual adicional configurado.'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">Bônus Fixo em Dinheiro</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                {seller.goalBonusFixed 
                  ? `R$ ${seller.goalBonusFixed.toFixed(2)} transferidos diretamente no seu PIX ao finalizar o mês com meta batida.`
                  : 'Nenhum bônus fixo em dinheiro configurado.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Links, Coupons & 1-Click WhatsApp Share Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="links">
        {/* Left: Referral Link & Coupon (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Seus Links &amp; Cupons Oficiais
              </h2>
              <p className="text-xs text-slate-400">
                Divulgue seu link e cupom para atribuir novas assinaturas e comissões automaticamente a você.
              </p>
            </div>
          </div>

          {/* Link box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Seu Link Exclusivo de Indicação
            </label>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs">
              <span className="text-emerald-600 font-medium truncate flex-1 pl-2">
                {seller.affiliateUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Coupon and Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Cupom de Desconto (Cliente)
              </label>
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs font-bold text-slate-800">
                <span className="truncate flex-1 pl-2">{seller.couponCode}</span>
                <button
                  onClick={handleCopyCoupon}
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition cursor-pointer"
                  title="Copiar Cupom"
                >
                  {copiedCoupon ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Código de Afiliado
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs text-slate-700">
                {seller.affiliateCode}
              </div>
            </div>
          </div>

          {/* WhatsApp 1-Click Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <a
              href={whatsAppShareUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Compartilhar no WhatsApp</span>
            </a>

            <button
              onClick={handleCopyReadyMessage}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMessage ? 'Texto Copiado!' : 'Copiar Texto Pronto'}</span>
            </button>
          </div>
        </div>

        {/* Right: PIX Details & Payout History (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4" id="financeiro">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">
                Dados Bancários &amp; PIX
              </h2>
            </div>
            <button
              onClick={() => setIsPixModalOpen(true)}
              className="text-xs text-emerald-600 hover:underline font-bold cursor-pointer"
            >
              Editar
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tipo de Chave:</span>
              <span className="font-bold text-slate-700">{seller.pixKeyType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chave PIX:</span>
              <span className="font-mono font-bold text-slate-800 truncate max-w-[190px]">{seller.pixKey || 'Não informada'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Titular / E-mail:</span>
              <span className="text-slate-700 truncate max-w-[190px]">{seller.email}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Últimos Saques Realizados
            </span>
            {payouts.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded-xl">
                Nenhum saque realizado ainda.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {payouts.map(p => (
                  <div key={p.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-emerald-600 block">R$ {p.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      PIX PAGO
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Sales & Commission Feed Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Extrato de Vendas &amp; Comissões
              </h2>
              <p className="text-xs text-slate-400">
                Histórico de criatórios que assinaram através dos seus links e cupons.
              </p>
            </div>
          </div>
        </div>

        {commissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">Nenhuma venda registrada ainda no seu código.</p>
            <p className="text-slate-400">Compartilhe seu link exclusivo de indicação para começar a comissionar!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Criatório / Assinante</th>
                  <th className="py-2.5 px-3">Plano</th>
                  <th className="py-2.5 px-3 text-right">Valor da Venda</th>
                  <th className="py-2.5 px-3 text-right">% Comissão</th>
                  <th className="py-2.5 px-3 text-right">Sua Comissão</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {c.tenantName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {c.planName}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700">
                      R$ {c.saleValue.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-purple-700">
                      {c.commissionPercent}%
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-600">
                      R$ {c.commissionAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        APROVADO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: SOLICITAR SAQUE PIX                                           */}
      {/* ==================================================================== */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <span className="font-bold text-sm flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Solicitar Saque PIX</span>
              </span>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
                <div>Saldo Disponível: <strong className="text-base text-emerald-700 font-black">R$ {seller.balanceAvailable.toFixed(2)}</strong></div>
                <div>Chave PIX de Destino: <strong>{seller.pixKey}</strong> ({seller.pixKeyType})</div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Valor do Saque (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                O valor será transferido instantaneamente via PIX para sua chave cadastrada após confirmação.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                Confirmar Saque PIX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDITAR CHAVE PIX                                              */}
      {/* ==================================================================== */}
      {isPixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Configurar Chave PIX</span>
              </span>
              <button onClick={() => setIsPixModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Tipo de Chave</label>
                <select
                  value={pixTypeForm}
                  onChange={(e) => setPixTypeForm(e.target.value as any)}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-medium"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Telefone / Celular</option>
                  <option value="RANDOM">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Chave PIX</label>
                <input
                  type="text"
                  value={pixKeyForm}
                  onChange={(e) => setPixKeyForm(e.target.value)}
                  placeholder="Informe sua chave PIX"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                Salvar Chave PIX
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
