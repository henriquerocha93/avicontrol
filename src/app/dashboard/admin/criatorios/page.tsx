'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Search, 
  Edit2, 
  Check, 
  X, 
  ShieldAlert, 
  Calendar, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Plus,
  Users,
  Clock,
  Lock,
  Sparkles,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  FileText
} from 'lucide-react'
import { db } from '@/lib/db'
import { Tenant, PlanType } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminCriatoriosPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBilling, setFilterBilling] = useState<'ALL' | 'MENSAL' | 'ANUAL' | 'ISENTO'>('ALL')
  
  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)

  // New Tenant Form States
  const [formName, setFormName] = useState('')
  const [formResponsible, setFormResponsible] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formDocument, setFormDocument] = useState('')
  const [formPlan, setFormPlan] = useState<PlanType>('PRO')
  const [formBillingCycle, setFormBillingCycle] = useState<'MENSAL' | 'ANUAL' | 'ISENTO'>('MENSAL')
  const [formMaxBirds, setFormMaxBirds] = useState('200')
  const [formCustomExpires, setFormCustomExpires] = useState('')
  const [formPlanStatus, setFormPlanStatus] = useState<'ACTIVE' | 'TRIAL'>('ACTIVE')

  // Edit form states
  const [editPlan, setEditPlan] = useState<PlanType>('PRO')
  const [editBillingCycle, setEditBillingCycle] = useState<'MENSAL' | 'ANUAL' | 'ISENTO'>('MENSAL')
  const [editPlanStatus, setEditPlanStatus] = useState<'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED' | 'BLOCKED'>('ACTIVE')
  const [editExpiresAt, setEditExpiresAt] = useState('')
  const [editMaxBirds, setEditMaxBirds] = useState(100)

  useEffect(() => {
    refresh()
  }, [])

  const refresh = () => {
    setTenants([...db.getAllTenants()])
  }

  const resetNewForm = () => {
    setFormName('')
    setFormResponsible('')
    setFormEmail('')
    setFormPhone('')
    setFormDocument('')
    setFormPlan('PRO')
    setFormBillingCycle('MENSAL')
    setFormMaxBirds('200')
    setFormCustomExpires('')
    setFormPlanStatus('ACTIVE')
  }

  const handleOpenNew = () => {
    resetNewForm()
    setIsNewModalOpen(true)
  }

  const handleSaveNew = () => {
    if (!formName.trim() || !formEmail.trim()) {
      alert('Nome do criatório e e-mail são obrigatórios.')
      return
    }

    let calculatedExpires = formCustomExpires ? new Date(formCustomExpires).toISOString() : undefined;

    db.createTenantManual({
      name: formName.trim(),
      responsibleName: formResponsible.trim() || undefined,
      email: formEmail.trim(),
      phone: formPhone.trim() || undefined,
      document: formDocument.trim() || undefined,
      plan: formPlan,
      billingCycle: formBillingCycle,
      maxBirds: parseInt(formMaxBirds, 10) || 200,
      expiresAt: calculatedExpires,
      planStatus: formPlanStatus
    })

    refresh()
    setIsNewModalOpen(false)
    resetNewForm()
    alert('✅ Criatório e usuário cadastrados com sucesso!')
  }

  const handleOpenEdit = (t: Tenant) => {
    setEditingTenant(t)
    setEditPlan(t.plan)
    setEditBillingCycle(t.billingCycle || 'ANUAL')
    setEditPlanStatus(t.planStatus || 'ACTIVE')
    setEditExpiresAt(t.expiresAt ? t.expiresAt.split('T')[0] : '')
    setEditMaxBirds(t.maxBirds || 100)
  }

  const handleSaveEdit = () => {
    if (!editingTenant) return
    let expDate = editExpiresAt ? new Date(editExpiresAt).toISOString() : editingTenant.expiresAt
    if (editBillingCycle === 'ISENTO') {
      expDate = '2099-12-31T23:59:59Z'
    }
    db.updateTenantPlan(editingTenant.id, editPlan, editBillingCycle, editPlanStatus, expDate, editMaxBirds)
    refresh()
    setEditingTenant(null)
    alert('Alterações salvas com sucesso!')
  }

  const handleQuickRenew = (t: Tenant, months = 1) => {
    const updated = db.renewTenantPlan(t.id, months)
    if (updated) {
      refresh()
      alert(`🎉 Plano renovado por +${months} mês(es)! Novo vencimento: ${new Date(updated.expiresAt).toLocaleDateString('pt-BR')}`)
    }
  }

  const handleDeleteTenant = (id: string, name: string) => {
    if (id === 'tenant-demo-01') {
      alert('O criatório principal de demonstração não pode ser excluído.')
      return
    }
    if (confirm(`Tem certeza que deseja excluir o criatório "${name}" e todos os seus dados?`)) {
      db.deleteTenant(id)
      refresh()
    }
  }

  const filteredTenants = tenants.filter(t => {
    if (filterBilling !== 'ALL' && (t.billingCycle || 'ANUAL') !== filterBilling) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return t.name.toLowerCase().includes(q) || 
           (t.document && t.document.includes(q)) || 
           (t.email && t.email.toLowerCase().includes(q))
  })

  // Summary counts
  const totalTenants = tenants.length
  const totalMensal = tenants.filter(t => (t.billingCycle || 'ANUAL') === 'MENSAL').length
  const totalAnual = tenants.filter(t => (t.billingCycle || 'ANUAL') === 'ANUAL').length
  const totalIsento = tenants.filter(t => t.billingCycle === 'ISENTO').length

  return (
    <div className="space-y-6 pb-16 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <Link href="/dashboard/admin" className="text-[#00c853] hover:underline font-medium">Super Admin</Link>
        <span>/</span>
        <span className="text-slate-400">Criatórios &amp; Licenças</span>
      </div>

      {/* Header Banner with "+ Cadastrar Manualmente" Button */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
            <Building2 className="w-6 h-6 text-[#00c853]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-800">
                Gestão Global de Criatórios (Tenants)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {totalTenants} Criatórios
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle de mensalidades, anuidades, isenções, bloqueios automáticos por inadimplência e limites de aves.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-lg flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Criatório Manualmente</span>
        </button>
      </div>

      {/* Quick Billing Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterBilling('ALL')} 
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition ${
            filterBilling === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Todos os Criatórios</span>
          <div className="text-2xl font-black mt-1">{totalTenants}</div>
          <span className="text-[11px] opacity-80 mt-0.5 block">Total de contas registradas</span>
        </div>

        <div 
          onClick={() => setFilterBilling('MENSAL')} 
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition ${
            filterBilling === 'MENSAL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">📅 Planos Mensais</span>
          <div className="text-2xl font-black mt-1">{totalMensal}</div>
          <span className="text-[11px] opacity-80 mt-0.5 block">Vencimento a cada 30 dias</span>
        </div>

        <div 
          onClick={() => setFilterBilling('ANUAL')} 
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition ${
            filterBilling === 'ANUAL' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">🗓️ Planos Anuais</span>
          <div className="text-2xl font-black mt-1">{totalAnual}</div>
          <span className="text-[11px] opacity-80 mt-0.5 block">Vencimento a cada 365 dias</span>
        </div>

        <div 
          onClick={() => setFilterBilling('ISENTO')} 
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition ${
            filterBilling === 'ISENTO' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">🛡️ Isentos / Vitalícios</span>
          <div className="text-2xl font-black mt-1">{totalIsento}</div>
          <span className="text-[11px] opacity-80 mt-0.5 block">Sem bloqueio ou cobrança</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar criatório por nome, CPF/CNPJ ou e-mail..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#00c853] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold tracking-wider">
                <th className="text-left px-5 py-3">Criatório / Titular</th>
                <th className="text-left px-4 py-3">Documento / Contato</th>
                <th className="text-center px-4 py-3">Plano</th>
                <th className="text-center px-4 py-3">Tipo Cobrança</th>
                <th className="text-center px-4 py-3">Limite Aves</th>
                <th className="text-center px-4 py-3">Vencimento &amp; Situação</th>
                <th className="text-center px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-500">
                    Nenhum criatório encontrado.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const isIsento = t.billingCycle === 'ISENTO';
                  const expiresDate = t.expiresAt ? new Date(t.expiresAt) : new Date();
                  const diffDays = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  // Status calculation
                  const isBlocked = !isIsento && diffDays < -10;
                  const isPastDueGrace = !isIsento && diffDays <= 0 && diffDays >= -10;
                  const isExpiringSoon = !isIsento && diffDays > 0 && diffDays <= 10;
                  const isNormal = isIsento || diffDays > 10;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {t.id}</span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="font-medium text-slate-800">{t.document || 'Sem documento'}</div>
                        <div className="text-[11px] text-slate-400">{t.email}</div>
                        {t.phone && <div className="text-[10px] text-slate-400">{t.phone}</div>}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          t.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          t.plan === 'PRO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {t.plan}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isIsento ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            🛡️ Isento / Cortesia
                          </span>
                        ) : t.billingCycle === 'MENSAL' ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            📅 Mensal
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            🗓️ Anual
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-700 font-mono">
                        {t.maxBirds >= 9999 ? 'Ilimitado' : `${t.maxBirds} aves`}
                      </td>

                      {/* Expiration & Expiration Warnings */}
                      <td className="px-4 py-3.5 text-center">
                        {isIsento ? (
                          <div className="space-y-0.5">
                            <span className="text-slate-500 font-mono">Sem expiração</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 block">
                              Vitalício Liberado
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-slate-700 font-mono font-bold block">
                              {formatDate(t.expiresAt)}
                            </span>
                            
                            {isBlocked && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>BLOQUEADO ({Math.abs(diffDays)}d atraso)</span>
                              </span>
                            )}

                            {isPastDueGrace && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200 flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Atrasado ({Math.abs(diffDays)}d)</span>
                              </span>
                            )}

                            {isExpiringSoon && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Vence em {diffDays}d</span>
                              </span>
                            )}

                            {isNormal && !isExpiringSoon && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                ✅ Em dia
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#00c853] hover:text-white text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                            title="Gerenciar plano e licença"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Gerenciar</span>
                          </button>

                          {!isIsento && (
                            <button
                              onClick={() => handleQuickRenew(t, t.billingCycle === 'MENSAL' ? 1 : 12)}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition cursor-pointer"
                              title={`Renovar +${t.billingCycle === 'MENSAL' ? '1 Mês' : '1 Ano'} (Confirmar PIX)`}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {t.id !== 'tenant-demo-01' && (
                            <button
                              onClick={() => handleDeleteTenant(t.id, t.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Excluir criatório"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: CADASTRAR CRIATÓRIO & USUÁRIO MANUALMENTE                     */}
      {/* ==================================================================== */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#171b21] text-white flex items-center justify-between">
              <span className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00c853]" />
                <span>Cadastrar Criatório &amp; Usuário Manualmente</span>
              </span>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Type of Billing Cycle Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Modalidade de Cobrança / Licença <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFormBillingCycle('MENSAL')
                      setFormPlan('PRO')
                      setFormMaxBirds('200')
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formBillingCycle === 'MENSAL'
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-black text-slate-800">📅 Mensal</span>
                    <span className="text-[10px] text-slate-500 mt-1">A cada 30 dias (R$ 14,99)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormBillingCycle('ANUAL')
                      setFormPlan('PREMIUM')
                      setFormMaxBirds('9999')
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formBillingCycle === 'ANUAL'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-black text-slate-800">🗓️ Anual</span>
                    <span className="text-[10px] text-slate-500 mt-1">A cada 365 dias (R$ 169,99)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormBillingCycle('ISENTO')
                      setFormPlan('PREMIUM')
                      setFormMaxBirds('9999')
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formBillingCycle === 'ISENTO'
                        ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-black text-slate-800">🛡️ Isento</span>
                    <span className="text-[10px] text-slate-500 mt-1">Cortesia / Sem bloqueio</span>
                  </button>
                </div>
              </div>

              {/* Criatório & Titular info */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Nome do Criatório <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Criatório Canto Real"
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Nome do Responsável</label>
                  <input
                    type="text"
                    value={formResponsible}
                    onChange={(e) => setFormResponsible(e.target.value)}
                    placeholder="Ex: Marcos Silva"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={formDocument}
                    onChange={(e) => setFormDocument(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">E-mail de Acesso <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="criador@email.com"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Plan parameters */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Configuração da Licença</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Plano</label>
                    <select
                      value={formPlan}
                      onChange={(e) => setFormPlan(e.target.value as PlanType)}
                      className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="PRO">PRO (Plantel, Anilhas, Reprodução, SISPASS)</option>
                      <option value="PREMIUM">PREMIUM VIP (Genealogia, A4, QR Code, Ilimitado)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Limite de Aves</label>
                    <input
                      type="number"
                      value={formMaxBirds}
                      onChange={(e) => setFormMaxBirds(e.target.value)}
                      placeholder="200"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {formBillingCycle !== 'ISENTO' && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-medium text-slate-600 block">
                      Data Inicial de Vencimento (Opcional - Padrão automático)
                    </label>
                    <input
                      type="date"
                      value={formCustomExpires}
                      onChange={(e) => setFormCustomExpires(e.target.value)}
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNew}
                className="px-5 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-lg transition shadow-xs cursor-pointer"
              >
                Cadastrar Criatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDITAR / GERENCIAR CRIATÓRIO EXISTENTE                         */}
      {/* ==================================================================== */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#171b21] text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#00c853]" />
                <span>Configurar Licença do Criatório</span>
              </span>
              <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div>Criatório: <strong>{editingTenant.name}</strong></div>
                <div className="text-slate-500">ID: {editingTenant.id} • {editingTenant.email}</div>
              </div>

              {/* Billing Cycle Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Modalidade de Cobrança</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditBillingCycle('MENSAL')}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition cursor-pointer ${
                      editBillingCycle === 'MENSAL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    📅 Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditBillingCycle('ANUAL')}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition cursor-pointer ${
                      editBillingCycle === 'ANUAL' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🗓️ Anual
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditBillingCycle('ISENTO')}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition cursor-pointer ${
                      editBillingCycle === 'ISENTO' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🛡️ Isento
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Plano de Assinatura</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value as PlanType)}
                  className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#00c853]"
                >
                  <option value="PRO">Plano PRO (Gestão &amp; SISPASS)</option>
                  <option value="PREMIUM">Plano PREMIUM (Genealogia VIP &amp; A4)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Status da Assinatura</label>
                <select
                  value={editPlanStatus}
                  onChange={(e) => setEditPlanStatus(e.target.value as any)}
                  className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#00c853]"
                >
                  <option value="ACTIVE">Ativo (Liberado)</option>
                  <option value="TRIAL">Carência / Teste</option>
                  <option value="PAST_DUE">Pagamento Pendente / Atrasado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Limite Máximo de Aves</label>
                  <input
                    type="number"
                    value={editMaxBirds}
                    onChange={(e) => setEditMaxBirds(parseInt(e.target.value) || 0)}
                    className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#00c853]"
                  />
                </div>

                {editBillingCycle !== 'ISENTO' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Data de Expiração</label>
                    <input
                      type="date"
                      value={editExpiresAt}
                      onChange={(e) => setEditExpiresAt(e.target.value)}
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#00c853]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-lg transition shadow-xs cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
