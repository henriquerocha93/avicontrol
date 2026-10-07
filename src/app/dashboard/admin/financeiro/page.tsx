'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  X,
  AlertTriangle,
  Copy,
  Zap,
  Bell,
  ArrowUpRight,
  ShieldAlert,
  Users,
  Wallet
} from 'lucide-react'
import { db } from '@/lib/db'
import { SellerAffiliate, AffiliateCommission, AffiliatePayout } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminFinanceiroPage() {
  const [sellers, setSellers] = useState<SellerAffiliate[]>([])
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [payoutFilter, setPayoutFilter] = useState<'PENDING' | 'COMPLETED' | 'ALL'>('PENDING')

  useEffect(() => {
    refresh()
  }, [])

  const refresh = () => {
    setSellers([...db.getSellers()])
    setCommissions([...db.getCommissions()])
    setPayouts([...db.getPayouts()])
  }

  const handleApprovePayout = (id: string) => {
    if (confirm('Confirmar pagamento do PIX e marcar como CONCLUÍDO?')) {
      db.updatePayoutStatus(id, 'COMPLETED')
      refresh()
    }
  }

  const handleRejectPayout = (id: string) => {
    if (confirm('Deseja realmente rejeitar esta solicitação? O saldo será estornado imediatamente para o usuário/afiliado.')) {
      db.updatePayoutStatus(id, 'REJECTED')
      refresh()
    }
  }

  const copyPixKey = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKeyId(id)
    setTimeout(() => setCopiedKeyId(null), 2500)
  }

  const totalSales = sellers.reduce((acc, s) => acc + s.totalSalesValue, 0)
  const totalEarned = sellers.reduce((acc, s) => acc + s.totalCommissionsEarned, 0)
  const totalPaid = sellers.reduce((acc, s) => acc + s.totalCommissionsPaid, 0)
  const totalPending = sellers.reduce((acc, s) => acc + s.balanceAvailable, 0)

  // Pending Payouts (REQUESTED / PROCESSING)
  const pendingPayouts = payouts.filter(p => p.status === 'REQUESTED' || p.status === 'PROCESSING')

  const filteredPayouts = payouts.filter(p => {
    if (payoutFilter === 'PENDING') return p.status === 'REQUESTED' || p.status === 'PROCESSING'
    if (payoutFilter === 'COMPLETED') return p.status === 'COMPLETED'
    return true
  })

  return (
    <div className="space-y-6 pb-16 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <Link href="/dashboard/admin" className="text-[#00c853] hover:underline font-medium">Super Admin</Link>
        <span>/</span>
        <span className="text-slate-400">Financeiro &amp; Saques PIX</span>
      </div>

      {/* ========================================================================= */}
      {/* ALERTA EM DESTAQUE: SOLICITAÇÕES DE SAQUE PIX PENDENTES (PRAZO 24 HORAS) */}
      {/* ========================================================================= */}
      {pendingPayouts.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-500/15 border-2 border-red-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black tracking-wide uppercase">
                    🚨 ATENÇÃO: {pendingPayouts.length} SOLICITAÇÃO(ÕES) DE SAQUE PIX PENDENTE(S)!
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-red-700 tracking-wider">
                    PRAZO LIMITE: 24 HORAS
                  </span>
                </div>
                <p className="text-xs text-white/90 mt-1 max-w-3xl leading-relaxed">
                  O usuário solicitou o resgate via PIX. De acordo com as diretrizes do sistema, a transferência deve ser efetuada em até <strong>24 horas</strong>. Copie a chave abaixo e clique em confirmar após a realização do pagamento no seu aplicativo bancário.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 shrink-0 text-right">
              <span className="text-[10px] uppercase font-bold text-white/80 block">Total a Pagar Agora</span>
              <span className="text-2xl font-black text-white">
                R$ {pendingPayouts.reduce((acc, p) => acc + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Lista rápida de saques no próprio banner */}
          <div className="mt-4 pt-4 border-t border-white/20 space-y-2.5">
            {pendingPayouts.map((p) => {
              const createdDate = new Date(p.createdAt)
              const dueDate = p.dueAt ? new Date(p.dueAt) : new Date(createdDate.getTime() + 24 * 60 * 60 * 1000)
              const remainingMs = dueDate.getTime() - Date.now()
              const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)))
              const remainingMinutes = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)))

              return (
                <div key={p.id} className="p-3 bg-black/20 rounded-xl border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{p.affiliateName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white">
                        {p.type === 'REFERRAL_USER' ? '🎁 Indique & Ganhe' : '💼 Vendedor Afiliado'}
                      </span>
                    </div>
                    <div className="text-white/80 flex items-center gap-3">
                      <span>Solicitado: {formatDate(p.createdAt)}</span>
                      <span>•</span>
                      <span className="text-amber-200 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Prazo Restante: {remainingHours}h {remainingMinutes}min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Chave PIX e Copiar */}
                    <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2 font-mono">
                      <span className="text-[11px] font-bold">{p.pixKey}</span>
                      {p.pixKeyType && <span className="text-[9px] text-white/70">({p.pixKeyType})</span>}
                      <button
                        onClick={() => copyPixKey(p.pixKey, p.id)}
                        className="p-1 hover:bg-white/20 rounded text-white transition cursor-pointer"
                        title="Copiar Chave PIX"
                      >
                        {copiedKeyId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="text-base font-black text-white px-2">
                      R$ {(Number(p.amount) || 0).toFixed(2)}
                    </div>

                    <button
                      onClick={() => handleApprovePayout(p.id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-lg transition shadow cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Marcar como Pago</span>
                    </button>

                    <button
                      onClick={() => handleRejectPayout(p.id)}
                      className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg transition cursor-pointer"
                      title="Rejeitar e Estornar Saldo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800">
              Painel Financeiro &amp; Saques PIX
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Extrato global de vendas, comissões de parceiros e solicitações de repasse PIX em até 24h.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/vendedores"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Gerenciar Vendedores</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Vendido</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">
            R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Vendas geradas por parceiros</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Comissões Geradas</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">
            R$ {totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Acumulado em comissões</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Comissões Pagas</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Transferências PIX efetuadas</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Aguardando Pagamento</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">
            R$ {pendingPayouts.reduce((acc, p) => acc + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
            {pendingPayouts.length} saque(s) pendente(s) (24h)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABELA DE SOLICITAÇÕES DE SAQUE PIX (COM CONTADOR DE 24H)                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Solicitações de Saque &amp; Repasses PIX</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Prazo limite padrão de 24 horas para liquidação bancária via PIX
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPayoutFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                payoutFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Pendentes ({pendingPayouts.length})
            </button>
            <button
              onClick={() => setPayoutFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                payoutFilter === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Pagos Concluídos
            </button>
            <button
              onClick={() => setPayoutFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                payoutFilter === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todos ({payouts.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold tracking-wider">
                <th className="text-left px-5 py-3">Beneficiário</th>
                <th className="text-left px-4 py-3">Origem</th>
                <th className="text-left px-4 py-3">Chave PIX</th>
                <th className="text-right px-4 py-3">Valor</th>
                <th className="text-center px-4 py-3">Prazo (24h)</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-500">
                    Nenhuma solicitação de saque encontrada para este filtro.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => {
                  const isPending = p.status === 'REQUESTED' || p.status === 'PROCESSING'
                  const createdDate = new Date(p.createdAt)
                  const dueDate = p.dueAt ? new Date(p.dueAt) : new Date(createdDate.getTime() + 24 * 60 * 60 * 1000)
                  const remainingMs = dueDate.getTime() - Date.now()
                  const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)))
                  const remainingMinutes = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)))

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{p.affiliateName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.type === 'REFERRAL_USER' ? 'bg-pink-100 text-pink-800 border border-pink-200' : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {p.type === 'REFERRAL_USER' ? '🎁 Indique & Ganhe' : '💼 Vendedor'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-700 font-bold">{p.pixKey}</span>
                          {p.pixKeyType && <span className="text-[10px] text-slate-400">({p.pixKeyType})</span>}
                          <button
                            onClick={() => copyPixKey(p.pixKey, p.id)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                            title="Copiar Chave PIX"
                          >
                            {copiedKeyId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-black text-slate-900 text-sm">
                        R$ {(Number(p.amount) || 0).toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isPending ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              {remainingHours}h {remainingMinutes}m restantes
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Limite: {dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({formatDate(dueDate.toISOString())})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {p.completedAt ? formatDate(p.completedAt) : 'Finalizado'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {p.status === 'COMPLETED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1 w-fit mx-auto">
                            <Check className="w-3 h-3" />
                            <span>Pago</span>
                          </span>
                        ) : p.status === 'REJECTED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center justify-center gap-1 w-fit mx-auto">
                            <X className="w-3 h-3" />
                            <span>Rejeitado</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 flex items-center justify-center gap-1 w-fit mx-auto animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Pendente PIX</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleApprovePayout(p.id)}
                              className="px-2.5 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                              title="Marcar transferência como efetuada"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Pagar PIX</span>
                            </button>
                            <button
                              onClick={() => handleRejectPayout(p.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Rejeitar e Estornar Saldo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendedores Saldos Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Saldos e Contas de Vendedores Cadastrados</span>
          </h2>
          <Link href="/dashboard/admin/vendedores" className="text-xs text-[#00c853] font-bold hover:underline">
            Gerenciar Vendedores →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold tracking-wider">
                <th className="text-left px-5 py-3">Vendedor</th>
                <th className="text-left px-4 py-3">Chave PIX</th>
                <th className="text-center px-4 py-3">% Comissão</th>
                <th className="text-right px-4 py-3">Total Vendas</th>
                <th className="text-right px-4 py-3">Total Ganho</th>
                <th className="text-right px-4 py-3">Total Pago</th>
                <th className="text-right px-5 py-3">Saldo Disponível</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-500">
                    Nenhum vendedor cadastrado ainda.
                  </td>
                </tr>
              ) : (
                sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{s.name}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{s.pixKey} ({s.pixKeyType})</td>
                    <td className="px-4 py-3.5 text-center font-bold text-purple-700">{s.commissionPercent}%</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-700">
                      R$ {s.totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-purple-700">
                      R$ {s.totalCommissionsEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-emerald-600">
                      R$ {s.totalCommissionsPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-amber-600">
                      R$ {s.balanceAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
