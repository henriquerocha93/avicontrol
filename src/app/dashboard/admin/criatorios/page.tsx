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
  FileText,
  Eye,
  EyeOff,
  Key,
  Tag,
  Percent
} from 'lucide-react'
import { db } from '@/lib/db'
import { firebaseSync } from '@/lib/firebase-service'
import { Tenant, PlanType } from '@/types'
import { formatDate } from '@/lib/utils'
import { DateManualInput } from '@/components/ui/date-manual-input'

export default function AdminCriatoriosPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBilling, setFilterBilling] = useState<'ALL' | 'MENSAL' | 'ANUAL' | 'ISENTO'>('ALL')
  
  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [isSubmittingNew, setIsSubmittingNew] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null)

  // New Tenant Form States
  const [formName, setFormName] = useState('')
  const [formResponsible, setFormResponsible] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('123456')
  const [formPhone, setFormPhone] = useState('')
  const [formDocument, setFormDocument] = useState('')
  const [formPlan, setFormPlan] = useState<PlanType>('PREMIUM')
  const [formBillingCycle, setFormBillingCycle] = useState<'MENSAL' | 'ANUAL' | 'ISENTO'>('MENSAL')
  const [formMaxBirds, setFormMaxBirds] = useState('9999')
  const [formCustomExpires, setFormCustomExpires] = useState('')
  const [formPlanStatus, setFormPlanStatus] = useState<'ACTIVE' | 'TRIAL'>('ACTIVE')

  // New Tenant Manual Discount States
  const [formDiscountType, setFormDiscountType] = useState<'NONE' | 'PERCENT' | 'FIXED' | 'CUSTOM_PRICE'>('NONE')
  const [formDiscountValue, setFormDiscountValue] = useState('')
  const [formDiscountReason, setFormDiscountReason] = useState('')

  // Edit form states
  const [editPlan, setEditPlan] = useState<PlanType>('PREMIUM')
  const [editBillingCycle, setEditBillingCycle] = useState<'MENSAL' | 'ANUAL' | 'ISENTO'>('MENSAL')
  const [editPlanStatus, setEditPlanStatus] = useState<'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED' | 'BLOCKED'>('ACTIVE')
  const [editExpiresAt, setEditExpiresAt] = useState('')
  const [editMaxBirds, setEditMaxBirds] = useState(9999)
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Edit Tenant Manual Discount States
  const [editDiscountType, setEditDiscountType] = useState<'NONE' | 'PERCENT' | 'FIXED' | 'CUSTOM_PRICE'>('NONE')
  const [editDiscountValue, setEditDiscountValue] = useState('')
  const [editDiscountReason, setEditDiscountReason] = useState('')

  useEffect(() => {
    refresh()
    let timer: any = null
    const handleDbUpdated = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        refresh()
      }, 150)
    }
    window.addEventListener('birdpro_db_updated', handleDbUpdated)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('birdpro_db_updated', handleDbUpdated)
    }
  }, [])

  const refresh = () => {
    setTenants(prev => {
      const fresh = db.getAllTenants()
      if (prev.length === fresh.length && JSON.stringify(prev) === JSON.stringify(fresh)) {
        return prev
      }
      return [...fresh]
    })
  }

  const getStandardPrice = (cycle: 'MENSAL' | 'ANUAL' | 'ISENTO') => {
    if (cycle === 'MENSAL') return 14.99
    if (cycle === 'ANUAL') return 169.99
    return 0
  }

  const calculateFinalPrice = (
    cycle: 'MENSAL' | 'ANUAL' | 'ISENTO',
    discountType: 'NONE' | 'PERCENT' | 'FIXED' | 'CUSTOM_PRICE',
    discountValueStr: string
  ) => {
    const base = getStandardPrice(cycle)
    if (cycle === 'ISENTO' || discountType === 'NONE') return base
    const val = parseFloat(discountValueStr) || 0
    if (discountType === 'PERCENT') {
      return Math.max(0, base * (1 - val / 100))
    }
    if (discountType === 'FIXED') {
      return Math.max(0, base - val)
    }
    if (discountType === 'CUSTOM_PRICE') {
      return Math.max(0, val)
    }
    return base
  }

  const resetNewForm = () => {
    setFormName('')
    setFormResponsible('')
    setFormEmail('')
    setFormPassword('123456')
    setFormPhone('')
    setFormDocument('')
    setFormPlan('PREMIUM')
    setFormBillingCycle('MENSAL')
    setFormMaxBirds('9999')
    setFormCustomExpires('')
    setFormPlanStatus('ACTIVE')
    setFormDiscountType('NONE')
    setFormDiscountValue('')
    setFormDiscountReason('')
  }

  const handleOpenNew = () => {
    resetNewForm()
    setIsNewModalOpen(true)
  }

  const handleSaveNew = async () => {
    const cleanName = formName.trim();
    const cleanEmail = formEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      alert('Nome do criatório e e-mail são obrigatórios.');
      return;
    }

    setIsSubmittingNew(true);
    try {
      let calculatedExpires: string | undefined = undefined;
      if (formCustomExpires) {
        try {
          const d = new Date(formCustomExpires);
          if (!isNaN(d.getTime())) {
            calculatedExpires = d.toISOString();
          }
        } catch {
          calculatedExpires = undefined;
        }
      }

      const originalPrice = getStandardPrice(formBillingCycle);
      const cleanDiscountStr = formDiscountValue.replace(',', '.').trim();
      const finalPrice = calculateFinalPrice(formBillingCycle, formDiscountType, cleanDiscountStr);
      const numDiscountValue = cleanDiscountStr ? parseFloat(cleanDiscountStr) : undefined;
      const initialPassword = formPassword.trim() || '123456';

      const result = db.createTenantManual({
        name: cleanName,
        responsibleName: formResponsible.trim() || undefined,
        email: cleanEmail,
        password: initialPassword,
        phone: formPhone.trim() || undefined,
        document: formDocument.trim() || undefined,
        plan: 'PREMIUM',
        billingCycle: formBillingCycle,
        maxBirds: parseInt(formMaxBirds, 10) || 9999,
        expiresAt: calculatedExpires,
        planStatus: formPlanStatus,
        customDiscountType: formDiscountType,
        customDiscountValue: isNaN(numDiscountValue as any) ? undefined : numDiscountValue,
        customDiscountReason: formDiscountReason.trim() || undefined,
        originalPrice,
        finalPrice
      });

      // Explicitly await cloud save to guarantee instant availability across all devices
      if (firebaseSync.isAvailable()) {
        await Promise.allSettled([
          firebaseSync.saveTenant(result.tenant),
          firebaseSync.saveUser(result.user)
        ]);
      }

      refresh();
      setIsNewModalOpen(false);
      resetNewForm();
      alert(`✅ Criatório e usuário cadastrados com sucesso!\n\nDados de Acesso:\n• E-mail: ${cleanEmail}\n• Senha: ${initialPassword}\n\nO acesso já está ativo e sincronizado com a nuvem, liberado para entrar pelo celular ou pelo computador!`);
    } catch (err: any) {
      console.error('Erro ao cadastrar criatório:', err);
      alert(`Erro ao cadastrar criatório: ${err?.message || 'Verifique os dados e tente novamente.'}`);
    } finally {
      setIsSubmittingNew(false);
    }
  }

  const handleOpenEdit = (t: Tenant) => {
    if (!t) return
    setEditingTenant(t)
    setEditPlan(t.plan || 'PREMIUM')
    setEditBillingCycle(t.billingCycle || 'ANUAL')
    setEditPlanStatus(t.planStatus || 'ACTIVE')
    let expStr = ''
    if (t.expiresAt) {
      if (typeof t.expiresAt === 'string') {
        expStr = t.expiresAt.split('T')[0]
      } else {
        try {
          expStr = new Date(t.expiresAt).toISOString().split('T')[0]
        } catch {
          expStr = ''
        }
      }
    }
    setEditExpiresAt(expStr)
    setEditMaxBirds(Number(t.maxBirds) || 9999)

    // Load discount states
    setEditDiscountType(t.customDiscountType || 'NONE')
    setEditDiscountValue(t.customDiscountValue !== undefined ? String(t.customDiscountValue) : '')
    setEditDiscountReason(t.customDiscountReason || '')

    // Load linked user credentials
    const linkedUser = db.getTenantOwnerUser(t.id)
    setEditEmail(linkedUser?.email || t.email || '')
    setEditPassword(linkedUser?.password || '')
    setShowEditPassword(false)
  }

  const handleSaveEdit = async () => {
    if (!editingTenant) return
    const cleanEmail = editEmail.trim().toLowerCase();
    if (!cleanEmail) {
      alert('O e-mail de login é obrigatório.')
      return
    }

    setIsSubmittingEdit(true);
    try {
      let expDate = editingTenant.expiresAt;
      if (editExpiresAt) {
        try {
          const d = new Date(editExpiresAt);
          if (!isNaN(d.getTime())) {
            expDate = d.toISOString();
          }
        } catch {
          // keep existing
        }
      }
      if (editBillingCycle === 'ISENTO') {
        expDate = '2099-12-31T23:59:59Z'
      }

      const originalPrice = getStandardPrice(editBillingCycle);
      const cleanDiscountStr = editDiscountValue.replace(',', '.').trim();
      const finalPrice = calculateFinalPrice(editBillingCycle, editDiscountType, cleanDiscountStr);
      const numDiscountValue = cleanDiscountStr ? parseFloat(cleanDiscountStr) : undefined;

      db.updateTenantAndCredentials(editingTenant.id, {
        email: cleanEmail,
        password: editPassword.trim() || undefined,
        plan: 'PREMIUM',
        billingCycle: editBillingCycle,
        planStatus: editPlanStatus,
        expiresAt: expDate,
        maxBirds: editMaxBirds,
        customDiscountType: editDiscountType,
        customDiscountValue: isNaN(numDiscountValue as any) ? undefined : numDiscountValue,
        customDiscountReason: editDiscountReason.trim() || undefined,
        originalPrice,
        finalPrice
      });

      refresh();
      setEditingTenant(null);
      alert('✅ Alterações e credenciais salvas e sincronizadas na nuvem com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar alterações:', err);
      alert(`Erro ao salvar alterações: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setIsSubmittingEdit(false);
    }
  }

  const handleQuickRenew = (t: Tenant, months = 1) => {
    if (!t) return
    const updated = db.renewTenantPlan(t.id, months)
    if (updated) {
      refresh()
      let expStr = '-'
      try {
        expStr = new Date(updated.expiresAt).toLocaleDateString('pt-BR')
      } catch {
        expStr = String(updated.expiresAt || '-')
      }
      alert(`🎉 Plano renovado por +${months} mês(es)! Novo vencimento: ${expStr}`)
    }
  }

  const handleDeleteTenant = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir permanentemente o criatório "${name || id}" e todos os seus dados na nuvem?`)) {
      setDeletingTenantId(id)
      try {
        await db.deleteTenantAsync(id)
        refresh()
      } catch (err) {
        console.error('Erro ao excluir criatório:', err)
        alert('Erro ao excluir criatório. Tente novamente.')
      } finally {
        setDeletingTenantId(null)
      }
    }
  }

  const safeTenants = (tenants || []).filter(Boolean)

  const filteredTenants = safeTenants.filter(t => {
    if (filterBilling !== 'ALL' && (t.billingCycle || 'ANUAL') !== filterBilling) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return ((t.name || '').toLowerCase().includes(q)) || 
           (t.document && String(t.document).toLowerCase().includes(q)) || 
           (t.email && String(t.email).toLowerCase().includes(q))
  })

  // Summary counts
  const totalTenants = safeTenants.length
  const totalMensal = safeTenants.filter(t => (t.billingCycle || 'ANUAL') === 'MENSAL').length
  const totalAnual = safeTenants.filter(t => (t.billingCycle || 'ANUAL') === 'ANUAL').length
  const totalIsento = safeTenants.filter(t => t.billingCycle === 'ISENTO').length

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
                <th className="text-center px-4 py-3">Cobrança &amp; Valor</th>
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
                filteredTenants.map((t, idx) => {
                  const isIsento = (t.billingCycle || 'ANUAL') === 'ISENTO';
                  let diffDays = 999;
                  if (!isIsento) {
                    try {
                      const expiresDate = t.expiresAt ? new Date(t.expiresAt) : new Date();
                      if (!isNaN(expiresDate.getTime())) {
                        diffDays = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      }
                    } catch {
                      diffDays = 999;
                    }
                  }
                  
                  // Status calculation
                  const isBlocked = !isIsento && diffDays < -10;
                  const isPastDueGrace = !isIsento && diffDays <= 0 && diffDays >= -10;
                  const isExpiringSoon = !isIsento && diffDays > 0 && diffDays <= 10;
                  const isNormal = isIsento || diffDays > 10;

                  const mensalVal = Number(t.finalPrice ?? 14.99);
                  const displayMensal = isNaN(mensalVal) ? 14.99 : mensalVal;

                  const anualVal = Number(t.finalPrice ?? 169.99);
                  const displayAnual = isNaN(anualVal) ? 169.99 : anualVal;

                  const maxBirdsNum = Number(t.maxBirds) || 0;

                  return (
                    <tr key={t.id || `tenant-${idx}`} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{t.name || 'Sem nome'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {t.id}</span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="font-medium text-slate-800">{t.document || 'Sem documento'}</div>
                        <div className="text-[11px] text-slate-400">{t.email || '-'}</div>
                        {t.phone && <div className="text-[10px] text-slate-400">{t.phone}</div>}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          t.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          t.plan === 'PRO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {t.plan || 'PREMIUM'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isIsento ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 inline-block">
                            🛡️ Isento / Cortesia
                          </span>
                        ) : t.billingCycle === 'MENSAL' ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-block">
                              📅 Mensal
                            </span>
                            {t.customDiscountType && t.customDiscountType !== 'NONE' ? (
                              <div className="text-[11px] font-black text-emerald-700 flex items-center justify-center gap-1" title={t.customDiscountReason || 'Desconto manual aplicado'}>
                                <span>R$ {displayMensal.toFixed(2)}</span>
                                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-200">
                                  {t.customDiscountType === 'PERCENT' ? `-${t.customDiscountValue}%` : `R$ ${t.customDiscountValue} OFF`}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500 font-medium">R$ 14,99 /mês</div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                              🗓️ Anual
                            </span>
                            {t.customDiscountType && t.customDiscountType !== 'NONE' ? (
                              <div className="text-[11px] font-black text-emerald-700 flex items-center justify-center gap-1" title={t.customDiscountReason || 'Desconto manual aplicado'}>
                                <span>R$ {displayAnual.toFixed(2)}</span>
                                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-200">
                                  {t.customDiscountType === 'PERCENT' ? `-${t.customDiscountValue}%` : `R$ ${t.customDiscountValue} OFF`}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500 font-medium">R$ 169,99 /ano</div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-700 font-mono">
                        {maxBirdsNum >= 9999 ? 'Ilimitado' : `${maxBirdsNum} aves`}
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
                                <span>BLOQUEADO ({isNaN(diffDays) ? '?' : Math.abs(diffDays)}d atraso)</span>
                              </span>
                            )}

                            {isPastDueGrace && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200 flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Atrasado ({isNaN(diffDays) ? '?' : Math.abs(diffDays)}d)</span>
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

                          <button
                            onClick={() => handleDeleteTenant(t.id, t.name)}
                            disabled={deletingTenantId === t.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Excluir criatório"
                          >
                            {deletingTenantId === t.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-[#171b21] text-white flex items-center justify-between shrink-0">
              <span className="font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00c853]" />
                <span>Cadastrar Criatório &amp; Usuário Manualmente</span>
              </span>
              <button onClick={() => !isSubmittingNew && setIsNewModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain">
              
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
                  <label className="text-[11px] font-bold text-slate-700 block">E-mail de Login <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="criador@email.com"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Senha de Acesso Inicial <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-medium font-mono"
                  />
                </div>
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

              {/* Plan parameters */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Configuração da Licença</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Plano</label>
                    <select
                      value="PREMIUM"
                      disabled
                      className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none font-bold text-emerald-800"
                    >
                      <option value="PREMIUM">PLANO COMPLETO BIRDPRO (Tudo Incluso: Genealogia, SISPASS, Pedigree A4, QR Code, Ilimitado)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Limite de Aves</label>
                    <input
                      type="number"
                      value={formMaxBirds}
                      onChange={(e) => setFormMaxBirds(e.target.value)}
                      placeholder="9999"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {formBillingCycle !== 'ISENTO' && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-medium text-slate-600 block">
                      Data Inicial de Vencimento (Opcional - Padrão automático)
                    </label>
                    <DateManualInput
                      value={formCustomExpires}
                      onChange={(val) => setFormCustomExpires(val)}
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* BLOCO DE DESCONTO MANUAL / PREÇO ESPECIAL */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Desconto Manual / Preço Especial (Opcional)</span>
                  </span>
                  {formDiscountType !== 'NONE' && (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Desconto Ativo
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Desconto</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setFormDiscountType('NONE'); setFormDiscountValue(''); }}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        formDiscountType === 'NONE'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Sem Desconto
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDiscountType('PERCENT')}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        formDiscountType === 'PERCENT'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      % Porcentagem
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDiscountType('FIXED')}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        formDiscountType === 'FIXED'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      R$ Abatimento
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDiscountType('CUSTOM_PRICE')}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        formDiscountType === 'CUSTOM_PRICE'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Preço Fixo
                    </button>
                  </div>
                </div>

                {formDiscountType !== 'NONE' && (
                  <div className="space-y-3 pt-2 border-t border-emerald-200/70">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          {formDiscountType === 'PERCENT' && 'Porcentagem de Desconto (%)'}
                          {formDiscountType === 'FIXED' && 'Valor do Abatimento (R$)'}
                          {formDiscountType === 'CUSTOM_PRICE' && 'Novo Preço Final Cobrado (R$)'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={formDiscountValue}
                          onChange={(e) => setFormDiscountValue(e.target.value)}
                          placeholder={formDiscountType === 'PERCENT' ? 'Ex: 20' : 'Ex: 10.00'}
                          className="w-full h-8.5 px-3 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-800"
                        />
                      </div>

                      {formDiscountType === 'PERCENT' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-slate-500 block">Atalhos rápidos:</label>
                          <div className="flex gap-1 pt-0.5">
                            {[10, 20, 30, 50].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setFormDiscountValue(String(pct))}
                                className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded transition cursor-pointer"
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resumo do cálculo */}
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Preço Original de Tabela:</span>
                        <span className="font-semibold text-slate-600 line-through">
                          R$ {(Number(getStandardPrice(formBillingCycle)) || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-700 block text-[10px] font-bold">Valor Final a Cobrar:</span>
                        <span className="font-black text-emerald-700 text-sm">
                          R$ {(Number(calculateFinalPrice(formBillingCycle, formDiscountType, formDiscountValue)) || 0).toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-500 ml-1">
                            /{formBillingCycle === 'MENSAL' ? 'mês' : formBillingCycle === 'ANUAL' ? 'ano' : 'cortesia'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 block">
                        Motivo / Justificativa do Desconto (opcional)
                      </label>
                      <input
                        type="text"
                        value={formDiscountReason}
                        onChange={(e) => setFormDiscountReason(e.target.value)}
                        placeholder="Ex: Negociado no WhatsApp, Amigo do criador, etc."
                        className="w-full h-8 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0 z-10">
              <button
                type="button"
                disabled={isSubmittingNew}
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-bold rounded-lg disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmittingNew}
                onClick={handleSaveNew}
                className="px-5 py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-lg transition shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingNew ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando &amp; Sincronizando...</span>
                  </>
                ) : (
                  <span>Cadastrar Criatório</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EDITAR / GERENCIAR CRIATÓRIO EXISTENTE                         */}
      {/* ==================================================================== */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-[#171b21] text-white flex items-center justify-between shrink-0">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#00c853]" />
                <span>Configurar Licença do Criatório</span>
              </span>
              <button onClick={() => !isSubmittingEdit && setEditingTenant(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div>Criatório: <strong>{editingTenant.name}</strong></div>
                <div className="text-slate-500">ID: {editingTenant.id}</div>
              </div>

              {/* Login Email & Password Fields */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Credenciais de Acesso do Criatório</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                    Login do Criador
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    E-mail de Login <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="criador@email.com"
                      className="w-full h-8.5 pl-8 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#00c853] font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Senha de Acesso (Login)
                  </label>
                  <div className="relative flex items-center">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Digite a nova senha do criador"
                      className="w-full h-8.5 pl-8 pr-18 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#00c853] font-mono font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-1.5 px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition cursor-pointer"
                    >
                      {showEditPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    O criador utilizará este e-mail e senha para acessar o painel do criatório.
                  </p>
                </div>
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
                  value="PREMIUM"
                  disabled
                  className="w-full h-8.5 px-3 text-xs bg-slate-100 border border-slate-300 rounded-lg focus:outline-none font-bold text-emerald-800"
                >
                  <option value="PREMIUM">PLANO COMPLETO BIRDPRO (Tudo Incluso: Genealogia, SISPASS, Pedigree A4, QR Code, Ilimitado)</option>
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
                    <DateManualInput
                      value={editExpiresAt}
                      onChange={(val) => setEditExpiresAt(val)}
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#00c853]"
                    />
                  </div>
                )}
              </div>

              {/* BLOCO DE DESCONTO MANUAL / PREÇO ESPECIAL */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Desconto Manual / Preço Especial</span>
                  </span>
                  {editDiscountType !== 'NONE' && (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Desconto Ativo
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Desconto</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setEditDiscountType('NONE'); setEditDiscountValue(''); }}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        editDiscountType === 'NONE'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Sem Desconto
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDiscountType('PERCENT')}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        editDiscountType === 'PERCENT'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      % Porcentagem
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDiscountType('FIXED')}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        editDiscountType === 'FIXED'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      R$ Abatimento
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDiscountType('CUSTOM_PRICE')}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        editDiscountType === 'CUSTOM_PRICE'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Preço Fixo
                    </button>
                  </div>
                </div>

                {editDiscountType !== 'NONE' && (
                  <div className="space-y-3 pt-2 border-t border-emerald-200/70">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          {editDiscountType === 'PERCENT' && 'Porcentagem de Desconto (%)'}
                          {editDiscountType === 'FIXED' && 'Valor do Abatimento (R$)'}
                          {editDiscountType === 'CUSTOM_PRICE' && 'Novo Preço Final Cobrado (R$)'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={editDiscountValue}
                          onChange={(e) => setEditDiscountValue(e.target.value)}
                          placeholder={editDiscountType === 'PERCENT' ? 'Ex: 20' : 'Ex: 10.00'}
                          className="w-full h-8.5 px-3 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-800"
                        />
                      </div>

                      {editDiscountType === 'PERCENT' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-slate-500 block">Atalhos rápidos:</label>
                          <div className="flex gap-1 pt-0.5">
                            {[10, 20, 30, 50].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setEditDiscountValue(String(pct))}
                                className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded transition cursor-pointer"
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resumo do cálculo */}
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Preço Original de Tabela:</span>
                        <span className="font-semibold text-slate-600 line-through">
                          R$ {(Number(getStandardPrice(editBillingCycle)) || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-700 block text-[10px] font-bold">Valor Final a Cobrar:</span>
                        <span className="font-black text-emerald-700 text-sm">
                          R$ {(Number(calculateFinalPrice(editBillingCycle, editDiscountType, editDiscountValue)) || 0).toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-500 ml-1">
                            /{editBillingCycle === 'MENSAL' ? 'mês' : editBillingCycle === 'ANUAL' ? 'ano' : 'cortesia'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 block">
                        Motivo / Justificativa do Desconto (opcional)
                      </label>
                      <input
                        type="text"
                        value={editDiscountReason}
                        onChange={(e) => setEditDiscountReason(e.target.value)}
                        placeholder="Ex: Negociado no WhatsApp, Amigo do criador, etc."
                        className="w-full h-8 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0 z-10">
              <button
                type="button"
                disabled={isSubmittingEdit}
                onClick={() => setEditingTenant(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-bold rounded-lg disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmittingEdit}
                onClick={handleSaveEdit}
                className="px-5 py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-lg transition shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingEdit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Alterações</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
