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
  X
} from 'lucide-react'
import { db } from '@/lib/db'
import { SellerAffiliate, AffiliateCommission, AffiliatePayout } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminFinanceiroPage() {
  const [sellers, setSellers] = useState<SellerAffiliate[]>([])
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([])
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([])

  useEffect(() => {
    refresh()
  }, [])

  const refresh = () => {
    setSellers([...db.getSellers()])
    setCommissions([...db.getCommissions()])
    setPayouts([...db.getPayouts()])
  }

  const handleApprovePayout = (id: string) => {
    db.updatePayoutStatus(id, 'COMPLETED')
    refresh()
  }

  const handleRejectPayout = (id: string) => {
    db.updatePayoutStatus(id, 'REJECTED')
    refresh()
  }

  const totalSales = sellers.reduce((acc, s) => acc + s.totalSalesValue, 0)
  const totalEarned = sellers.reduce((acc, s) => acc + s.totalCommissionsEarned, 0)
  const totalPaid = sellers.reduce((acc, s) => acc + s.totalCommissionsPaid, 0)
  const totalPending = sellers.reduce((acc, s) => acc + s.balanceAvailable, 0)

  return (
    <div className="space-y-6 pb-12 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <Link href="/dashboard/admin" className="text-[#00c853] hover:underline font-medium">Super Admin</Link>
        <span>/</span>
        <span className="text-slate-400">Financeiro &amp; Comissões</span>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">
              Financeiro &amp; Comissões de Afiliados
            </h1>
            <p className="text-xs text-slate-500">
              Extrato global de vendas, comissões acumuladas e solicitações de repasse PIX
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Vendido</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">
            R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Comissões Geradas</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">
            R$ {totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Comissões Repassadas</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Saldo Pendente (A Pagar)</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">
            R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Vendedores Saldos Table */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Saldos e Contas de Vendedores
          </h2>
          <Link href="/dashboard/admin/vendedores" className="text-xs text-[#00c853] font-bold hover:underline">
            Gerenciar Vendedores
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="text-left px-4 py-2 font-semibold">Vendedor</th>
                <th className="text-left px-4 py-2 font-semibold">Chave PIX</th>
                <th className="text-center px-4 py-2 font-semibold">% Comissão</th>
                <th className="text-right px-4 py-2 font-semibold">Total Vendas</th>
                <th className="text-right px-4 py-2 font-semibold">Total Ganho</th>
                <th className="text-right px-4 py-2 font-semibold">Total Pago</th>
                <th className="text-right px-4 py-2 font-semibold">Saldo Disponível</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-800">{s.name}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">{s.pixKey} ({s.pixKeyType})</td>
                  <td className="px-4 py-2.5 text-center font-bold text-purple-700">{s.commissionPercent}%</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-700">
                    R$ {s.totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-purple-700">
                    R$ {s.totalCommissionsEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">
                    R$ {s.totalCommissionsPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right font-black text-amber-600">
                    R$ {s.balanceAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

