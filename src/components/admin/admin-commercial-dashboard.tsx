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
  Headphones
} from 'lucide-react'
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { db } from '@/lib/db'
import { SellerAffiliate, Tenant, AffiliateCommission } from '@/types'
import { formatDate } from '@/lib/utils'

export function AdminCommercialDashboard() {
  const [sellers, setSellers] = useState<SellerAffiliate[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    setSellers(db.getSellers())
    setTenants(db.getAllTenants())
    setCommissions(db.getCommissions())
  }, [])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Financial calculations
  const totalSalesFromAffiliates = sellers.reduce((acc, s) => acc + (s.totalSalesValue || 0), 0)
  const totalCommissionsEarned = sellers.reduce((acc, s) => acc + (s.totalCommissionsEarned || 0), 0)
  const totalCommissionsPaid = sellers.reduce((acc, s) => acc + (s.totalCommissionsPaid || 0), 0)
  const totalCommissionsPending = sellers.reduce((acc, s) => acc + (s.balanceAvailable || 0), 0)
  const totalClicksAll = sellers.reduce((acc, s) => acc + (s.totalClicks || 0), 0)
  const totalSignupsAll = sellers.reduce((acc, s) => acc + (s.totalSignups || 0), 0)

  // Monthly Sales Target
  const salesGoal = 25000.00
  const currentSales = totalSalesFromAffiliates + 14500.00 // Total gross with direct sales
  const salesProgressPercent = Math.min(100, Math.round((currentSales / salesGoal) * 100))

  // New Subscribers Target
  const subscribersGoal = 50
  const currentSubscribers = 38
  const subscribersProgressPercent = Math.min(100, Math.round((currentSubscribers / subscribersGoal) * 100))

  // Commercial Revenue Chart
  const revenueChartData = [
    { month: 'Out/25', vendas: 8500, comissoes: 1700, liquido: 6800 },
    { month: 'Nov/25', vendas: 12300, comissoes: 2460, liquido: 9840 },
    { month: 'Dez/25', vendas: 15800, comissoes: 3160, liquido: 12640 },
    { month: 'Jan/26', vendas: 18400, comissoes: 3680, liquido: 14720 },
    { month: 'Fev/26', vendas: 21900, comissoes: 4380, liquido: 17520 },
    { month: 'Mar/26 (Atual)', vendas: currentSales, comissoes: totalCommissionsEarned, liquido: currentSales - totalCommissionsEarned },
  ]

  // Recent Sales Feed Mock (Privacy-Safe)
  const recentSalesList = [
    { id: '1', tenant: 'Assinatura Nova • Ref #BP-9821 (SP)', plan: 'Plano Anual PRO', value: 169.99, seller: 'Mariana Duarte', commission: 42.50, date: 'Hoje às 14:32', status: 'PAID' },
    { id: '2', tenant: 'Assinatura Nova • Ref #BP-9818 (RS)', plan: 'Plano Anual PRO', value: 169.99, seller: 'Carlos Oliveira', commission: 34.00, date: 'Hoje às 11:15', status: 'PAID' },
    { id: '3', tenant: 'Renovação Anual • Ref #BP-9792 (MG)', plan: 'Plano Anual PRO', value: 169.99, seller: 'Carlos Oliveira', commission: 34.00, date: 'Ontem às 18:40', status: 'PAID' },
    { id: '4', tenant: 'Assinatura Mensal • Ref #BP-9780 (PR)', plan: 'Plano Mensal PRO', value: 14.99, seller: 'Federação Clubes', commission: 2.25, date: 'Ontem às 09:20', status: 'PAID' },
    { id: '5', tenant: 'Assinatura Nova • Ref #BP-9765 (PA)', plan: 'Plano Anual PRO', value: 169.99, seller: 'Mariana Duarte', commission: 42.50, date: '28/02 às 16:10', status: 'PAID' },
  ]

  return (
    <div className="space-y-6 pb-12 w-full font-sans">
      
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
              Acompanhamento do faturamento do BirdPro, metas comerciais do mês, performance de vendedores parceiros e repasses de comissão PIX.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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
            <span className="text-lg font-black text-emerald-600">{salesProgressPercent}%</span>
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
            <span className="text-lg font-black text-emerald-600">{subscribersProgressPercent}%</span>
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
              Média de 20% sobre as vendas
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
              Crescimento +28% M/M
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
              {sellers.map((s, idx) => (
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
              ))}
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
              {recentSalesList.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-bold text-slate-800">{sale.tenant}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {sale.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{sale.seller}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">
                    R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    R$ {sale.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500 font-mono text-[11px]">{sale.date}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                      PAGO / ATIVO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
