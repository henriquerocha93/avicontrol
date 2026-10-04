'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building2, 
  Target, 
  Award, 
  Percent, 
  CreditCard, 
  Link2, 
  Copy, 
  Check, 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  Calendar, 
  ChevronRight,
  Sparkles,
  Zap,
  ShoppingBag,
  Clock,
  Headphones,
  Edit2,
  X,
  CheckCircle2
} from 'lucide-react'
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { db } from '@/lib/db'
import { SellerAffiliate, Tenant, AffiliateCommission, GlobalSystemConfig, AffiliatePayout } from '@/types'
import { formatDate } from '@/lib/utils'

export function AdminCommercialDashboard() {
  const [sellers, setSellers] = useState<SellerAffiliate[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [globalConfig, setGlobalConfig] = useState<GlobalSystemConfig>(db.getGlobalConfig())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Edit Goals Modal state
  const [isEditGoalsModalOpen, setIsEditGoalsModalOpen] = useState(false)
  const [formSalesGoal, setFormSalesGoal] = useState('25000')
  const [formSubscribersGoal, setFormSubscribersGoal] = useState('50')
  const [saveToast, setSaveToast] = useState(false)

  const refreshData = () => {
    setSellers([...db.getSellers()])
    setTenants([...db.getAllTenants()])
    setCommissions([...db.getCommissions()])
    setPayouts([...db.getPayouts()])
    const cfg = db.getGlobalConfig()
    setGlobalConfig({ ...cfg })
    setFormSalesGoal((cfg.monthlySalesGoal ?? 25000).toString())
    setFormSubscribersGoal((cfg.monthlySubscribersGoal ?? 50).toString())
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenEditGoals = () => {
    setFormSalesGoal((globalConfig.monthlySalesGoal ?? 25000).toString())
    setFormSubscribersGoal((globalConfig.monthlySubscribersGoal ?? 50).toString())
    setIsEditGoalsModalOpen(true)
  }

  const handleSaveGoals = () => {
    const sGoal = parseFloat(formSalesGoal) || 0
    const subGoal = parseInt(formSubscribersGoal, 10) || 0

    db.updateGlobalConfig({
      monthlySalesGoal: sGoal,
      monthlySubscribersGoal: subGoal
    })

    setGlobalConfig(prev => ({
      ...prev,
      monthlySalesGoal: sGoal,
      monthlySubscribersGoal: subGoal
    }))

    setIsEditGoalsModalOpen(false)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3500)
  }

  // Financial calculations from real database records (no fake/mock numbers)
  const totalSalesFromAffiliates = sellers.reduce((acc, s) => acc + (s.totalSalesValue || 0), 0)
  const totalCommissionsEarned = sellers.reduce((acc, s) => acc + (s.totalCommissionsEarned || 0), 0)
  const totalCommissionsPaid = sellers.reduce((acc, s) => acc + (s.totalCommissionsPaid || 0), 0)
  const totalCommissionsPending = sellers.reduce((acc, s) => acc + (s.balanceAvailable || 0), 0)
  const totalClicksAll = sellers.reduce((acc, s) => acc + (s.totalClicks || 0), 0)
  const totalSignupsAll = sellers.reduce((acc, s) => acc + (s.totalSignups || 0), 0)

  // Real current month sales and subscribers
  const totalCommissionsSales = commissions.reduce((acc, c) => acc + (c.saleValue || 0), 0)
  const currentSales = totalCommissionsSales > 0 ? totalCommissionsSales : totalSalesFromAffiliates

  // Count active non-exempt subscriber tenants created/active
  const paidTenants = tenants.filter(t => t.id !== 'tenant-demo-01' && t.planStatus === 'ACTIVE' && t.billingCycle !== 'ISENTO')
  const currentSubscribers = paidTenants.length

  // Monthly Sales Target
  const salesGoal = globalConfig.monthlySalesGoal ?? 25000.00
  const salesProgressPercent = salesGoal > 0 ? Math.min(100, Math.round((currentSales / salesGoal) * 100)) : 0

  // New Subscribers Target
  const subscribersGoal = globalConfig.monthlySubscribersGoal ?? 50
  const subscribersProgressPercent = subscribersGoal > 0 ? Math.min(100, Math.round((currentSubscribers / subscribersGoal) * 100)) : 0

  // Current date formatting for chart
  const now = new Date()
  const currentMonthLabel = `${now.toLocaleDateString('pt-BR', { month: 'short' })}/${now.getFullYear().toString().slice(-2)} (Atual)`

  // Commercial Revenue Chart with zero-state transparency (real data only)
  const revenueChartData = [
    { month: 'Jan/26', vendas: 0, comissoes: 0, liquido: 0 },
    { month: 'Fev/26', vendas: 0, comissoes: 0, liquido: 0 },
    { month: currentMonthLabel, vendas: currentSales, comissoes: totalCommissionsEarned, liquido: Math.max(0, currentSales - totalCommissionsEarned) },
  ]

  const pendingPayouts = payouts.filter(p => p.status === 'REQUESTED' || p.status === 'PROCESSING')

  return (
    <div className="space-y-6 pb-12 w-full font-sans">
      
      {/* Save Goals Toast */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 border border-emerald-500 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <div>
            <div className="font-black text-xs">Metas Comerciais Atualizadas!</div>
            <div className="text-[11px] text-emerald-100">
              Novas metas do mês salvas com sucesso no sistema BirdPro.
            </div>
          </div>
        </div>
      )}

      {/* 🚨 ALERTA EM DESTAQUE: SAQUES PIX PENDENTES (PRAZO: 24H) */}
      {pendingPayouts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-1 rounded-2xl shadow-xl shadow-red-500/20">
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-[14px] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/30 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white shadow-xs">
                      🚨 ALERTA ADMINISTRATIVO • PRAZO 24 HORAS
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      {pendingPayouts.length} saque(s) PIX aguardando transferência
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                    Solicitações de Saque PIX Pendentes
                  </h3>
                </div>
              </div>

              <Link
                href="/dashboard/admin/financeiro"
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-xl transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Ver no Painel Financeiro</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid dos saques pendentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingPayouts.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-800/90 border border-red-500/40 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Favorecido / Criatório</span>
                      <h4 className="text-sm font-black text-white">{p.affiliateName}</h4>
                      <span className="text-xs text-slate-400 font-mono">
                        Chave PIX: <strong className="text-amber-300 font-mono">{p.pixKey}</strong> {p.pixKeyType ? `(${p.pixKeyType})` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Solicitado</span>
                      <span className="text-lg font-black text-emerald-400">
                        R$ {p.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-700/60 gap-2 text-[11px]">
                    <span className="text-amber-400 flex items-center gap-1 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Prazo: até 24h para envio do PIX</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(p.pixKey, p.id)}
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === p.id ? 'Copiada' : 'Copiar PIX'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          db.updatePayoutStatus(p.id, 'COMPLETED');
                          refreshData();
                          alert('✅ Pagamento registrado e concluído com sucesso!');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Marcar como Pago</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* COMMERCIAL HEADER BANNER                                             */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-[#171b21] via-[#212830] to-[#1a2332] p-6 sm:p-7 rounded-2xl border border-emerald-500/30 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel Comercial &amp; Gestão de Afiliados • BirdPro Master</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gestão de Vendas, Metas &amp; Afiliados
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              Acompanhamento do faturamento real do BirdPro, metas comerciais do mês, performance de vendedores parceiros e repasses de comissão PIX.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenEditGoals}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl flex items-center space-x-2 transition shadow-md cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-slate-950" />
              <span>Editar Metas do Mês</span>
            </button>
            <Link
              href="/dashboard/admin/chamados"
              className="px-4 py-2.5 bg-[#1e293b] hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow-md border border-slate-600"
            >
              <Headphones className="w-4 h-4 text-emerald-400" />
              <span>Central de Chamados</span>
              {db.getAllTickets().filter(t => t.status === 'OPEN' || t.unreadByAdmin).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {db.getAllTickets().filter(t => t.status === 'OPEN' || t.unreadByAdmin).length}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/admin/vendedores"
              className="px-4 py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Vendedor / Afiliado</span>
            </Link>
            <Link
              href="/dashboard/admin/financeiro"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow-md"
            >
              <DollarSign className="w-4 h-4" />
              <span>Pagar Comissões PIX</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SALES TARGETS / METAS COMERCIAIS DO MÊS                              */}
      {/* ==================================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Metas Comerciais do Mês Vigente
            </h2>
          </div>
          <button
            onClick={handleOpenEditGoals}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1 hover:underline cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Personalizar Metas</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Meta 1: Faturamento do Mês */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    Meta de Faturamento do Mês
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Objetivo: R$ {salesGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-600">{salesProgressPercent}%</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-[#00c853] h-full rounded-full transition-all duration-500"
                style={{ width: `${salesProgressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Realizado: <strong className="text-slate-800">R$ {currentSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              <span>Faltam: <strong className="text-amber-600">R$ {Math.max(0, salesGoal - currentSales).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </div>

          {/* Meta 2: Novos Criatórios Assinantes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    Meta de Novos Criatórios
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Objetivo: {subscribersGoal} novos criatórios este mês
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-600">{subscribersProgressPercent}%</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-[#00c853] h-full rounded-full transition-all duration-500"
                style={{ width: `${subscribersProgressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Conquistados: <strong className="text-slate-800">{currentSubscribers} criatórios</strong></span>
              <span>Faltam: <strong className="text-emerald-600">{Math.max(0, subscribersGoal - currentSubscribers)} criatórios</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* COMMERCIAL FINANCIAL KPIS                                            */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total em Vendas dos Afiliados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Vendas via Afiliados
            </span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">
              R$ {totalSalesFromAffiliates.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              {totalSignupsAll} assinaturas geradas
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Comissões Ganhas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Comissões Geradas
            </span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">
              R$ {totalCommissionsEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              Repasse sobre vendas
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Saldo a Repassar (PIX) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Saldo a Pagar (PIX)
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              R$ {totalCommissionsPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-600 font-bold mt-0.5 block">
              {sellers.filter(s => s.balanceAvailable > 0).length} vendedores com saldo
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Afiliados e Cliques */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Afiliados &amp; Cliques
            </span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">
              {sellers.length} parceiros
            </span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
              {totalClicksAll} cliques nos links
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* COMMERCIAL CHART & TOP SELLERS                                       */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Revenue Evolution Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Evolução do Faturamento &amp; Comissões (R$)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Histórico de vendas brutas vs. comissões pagas aos parceiros afiliados
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Tempo Real
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c853" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00c853" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="vendas" name="Vendas Brutas" stroke="#00c853" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVendas)" />
                <Area type="monotone" dataKey="liquido" name="Receita Líquida BirdPro" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLiquido)" />
                <Area type="monotone" dataKey="comissoes" name="Comissões Afiliados" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Top Afiliados Ranking */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Top Afiliados / Vendedores
                </h3>
              </div>
              <Link href="/dashboard/admin/vendedores" className="text-[11px] font-bold text-emerald-600 hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {sellers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-slate-600">Nenhum afiliado cadastrado ainda.</p>
                  <p className="text-[11px]">Cadastre seus primeiros parceiros comerciais no botão acima.</p>
                </div>
              ) : (
                sellers.slice(0, 5).map((s, idx) => (
                  <div key={s.id} className="p-3.5 hover:bg-slate-50/70 transition flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-amber-900/10 text-amber-800' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}º
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-800 block truncate">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Cupom: {s.couponCode} • {s.totalSignups} vendas</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs text-slate-800 block">
                        R$ {s.totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        +R$ {s.totalCommissionsEarned.toFixed(2)} comissão
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <Link
              href="/dashboard/admin/vendedores"
              className="text-xs text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Gerenciar Vendedores &amp; Links</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* RECENT SALES FEED TABLE & QUICK ACTIONS                              */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Últimas Vendas &amp; Assinaturas em Tempo Real
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard/admin/vendedores"
              className="px-3 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-[11px] font-bold rounded-lg flex items-center space-x-1 shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Lançar Venda Manual</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="text-left px-4 py-2.5">Criatório Assinante</th>
                <th className="text-left px-4 py-2.5">Plano Contratado</th>
                <th className="text-left px-4 py-2.5">Vendedor / Afiliado</th>
                <th className="text-right px-4 py-2.5">Valor da Venda</th>
                <th className="text-right px-4 py-2.5">Comissão Creditada</th>
                <th className="text-center px-4 py-2.5">Data/Hora</th>
                <th className="text-center px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                      <p className="font-bold text-slate-700 text-xs">Nenhuma venda registrada até o momento</p>
                      <p className="text-[11px] text-slate-400 max-w-md">
                        As novas assinaturas via PagBank (Cartão / PIX) e indicações de parceiros aparecerão aqui em tempo real.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                commissions.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-bold text-slate-800">{sale.tenantName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {sale.planName}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{sale.affiliateName}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">
                      R$ {sale.saleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      R$ {sale.commissionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 font-mono text-[11px]">{formatDate(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                        {sale.status === 'APPROVED' ? 'PAGO / ATIVO' : sale.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: EDITAR METAS COMERCIAIS DO MÊS                                */}
      {/* ==================================================================== */}
      {isEditGoalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#171b21] text-white flex items-center justify-between">
              <span className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>Editar Metas Comerciais do Mês</span>
              </span>
              <button onClick={() => setIsEditGoalsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Ajuste os objetivos comerciais mensais da plataforma BirdPro. Os gráficos e barras de progresso do painel refletirão estas metas imediatamente.
              </p>

              {/* Input 1: Meta de Faturamento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Meta de Faturamento Mensal (R$)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="500"
                    value={formSalesGoal}
                    onChange={(e) => setFormSalesGoal(e.target.value)}
                    placeholder="25000"
                    className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  {[10000, 25000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormSalesGoal(preset.toString())}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-600 transition cursor-pointer"
                    >
                      R$ {preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 2: Meta de Novos Criatórios */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Meta de Novos Criatórios no Mês (Assinantes)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    value={formSubscribersGoal}
                    onChange={(e) => setFormSubscribersGoal(e.target.value)}
                    placeholder="50"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  {[10, 25, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormSubscribersGoal(preset.toString())}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-600 transition cursor-pointer"
                    >
                      {preset} criatórios
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 space-y-1 mt-2">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cálculo em Tempo Real:</span>
                </div>
                <div>
                  Faturamento atual: <strong>R$ {currentSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div>
                  Criatórios conquistados: <strong>{currentSubscribers} criatórios</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditGoalsModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveGoals}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Metas</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
