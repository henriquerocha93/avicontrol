'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  DollarSign, 
  CreditCard, 
  Percent, 
  TrendingUp, 
  X, 
  CheckCircle2, 
  QrCode,
  ArrowRight,
  ShieldCheck,
  Send,
  Award,
  Crown,
  Briefcase,
  Target,
  Sparkles,
  MessageCircle,
  BarChart3,
  Filter,
  CheckCheck,
  Zap,
  Flame
} from 'lucide-react'
import { db } from '@/lib/db'
import { SellerAffiliate, AffiliateCommission, AffiliatePayout, PartnerType, Tenant } from '@/types'

export default function AdminVendedoresPage() {
  const [sellers, setSellers] = useState<SellerAffiliate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMode, setSelectedMode] = useState<'ALL' | 'VENDEDOR' | 'EMBAIXADOR'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL')
  const [sortBy, setSortBy] = useState<'sales' | 'goal' | 'signups' | 'name'>('sales')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Modals
  const [isNewSellerModalOpen, setIsNewSellerModalOpen] = useState(false)
  const [editingSeller, setEditingSeller] = useState<SellerAffiliate | null>(null)
  
  // Manual sale modal
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const [targetSellerForSale, setTargetSellerForSale] = useState<SellerAffiliate | null>(null)
  const [saleTenantName, setSaleTenantName] = useState('')
  const [salePlanName, setSalePlanName] = useState('Plano Anual PRO')
  const [saleAmount, setSaleAmount] = useState('169.99')

  // Payout modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [targetSellerForPayout, setTargetSellerForPayout] = useState<SellerAffiliate | null>(null)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutReceipt, setPayoutReceipt] = useState('')

  // Form states for new/edit seller
  const [partnerSource, setPartnerSource] = useState<'LINKED_CREATOR' | 'INDEPENDENT_SELLER'>('LINKED_CREATOR')
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [creatorSearch, setCreatorSearch] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formType, setFormType] = useState<PartnerType>('VENDEDOR')
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formPixKey, setFormPixKey] = useState('')
  const [formPixType, setFormPixType] = useState<'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'>('CPF')
  const [formCommission, setFormCommission] = useState('20')
  const [formMonthlySalesGoal, setFormMonthlySalesGoal] = useState('5000')
  const [formMonthlySignupsGoal, setFormMonthlySignupsGoal] = useState('25')
  const [formGoalBonusPercent, setFormGoalBonusPercent] = useState('5')
  const [formGoalBonusFixed, setFormGoalBonusFixed] = useState('0')
  const [formInstagram, setFormInstagram] = useState('')
  const [formYoutube, setFormYoutube] = useState('')
  const [formCoupon, setFormCoupon] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE' | 'BLOCKED'>('ACTIVE')

  useEffect(() => {
    refreshSellers()
  }, [])

  const refreshSellers = () => {
    setSellers([...db.getSellers()])
  }

  const allTenants: Tenant[] = useMemo(() => {
    return db.getAllTenants()
  }, [isNewSellerModalOpen])

  const filteredTenantsForSelect: Tenant[] = useMemo(() => {
    if (!creatorSearch.trim()) return allTenants
    const q = creatorSearch.toLowerCase()
    return allTenants.filter((t: Tenant) => 
      t.name.toLowerCase().includes(q) || 
      t.email.toLowerCase().includes(q) || 
      (t.slug && t.slug.toLowerCase().includes(q)) ||
      (t.document && t.document.toLowerCase().includes(q))
    )
  }, [allTenants, creatorSearch])

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const resetForm = () => {
    setPartnerSource('LINKED_CREATOR')
    setSelectedTenantId('')
    setCreatorSearch('')
    setFormPassword('')
    setFormType('VENDEDOR')
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormPixKey('')
    setFormPixType('CPF')
    setFormCommission('20')
    setFormMonthlySalesGoal('5000')
    setFormMonthlySignupsGoal('25')
    setFormGoalBonusPercent('5')
    setFormGoalBonusFixed('0')
    setFormInstagram('')
    setFormYoutube('')
    setFormCoupon('')
    setFormCode('')
    setFormNotes('')
    setFormStatus('ACTIVE')
    setEditingSeller(null)
  }

  const handleSelectCreator = (t: any) => {
    setSelectedTenantId(t.id)
    setFormName(t.name)
    setFormEmail(t.email)
    setFormPhone(t.phone || t.cellphone || t.whatsapp || '')
    setFormPixKey(t.email || '')
    setFormPixType('EMAIL')
    const cleanSlug = (t.slug || t.name).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)
    setFormCode(`${cleanSlug}10`)
    setFormCoupon(`${cleanSlug.toUpperCase()}10`)
  }

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#'
    let pass = ''
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormPassword(pass)
  }

  const handleOpenNew = (defaultMode: PartnerType = 'VENDEDOR') => {
    resetForm()
    setFormType(defaultMode)
    if (defaultMode === 'EMBAIXADOR') {
      setFormCommission('25')
      setFormMonthlySalesGoal('10000')
      setFormMonthlySignupsGoal('50')
      setFormGoalBonusFixed('500')
    } else {
      setFormCommission('20')
      setFormMonthlySalesGoal('5000')
      setFormMonthlySignupsGoal('25')
      setFormGoalBonusPercent('5')
    }
    setIsNewSellerModalOpen(true)
  }

  const handleEdit = (s: SellerAffiliate) => {
    setEditingSeller(s)
    if (s.linkedTenantId) {
      setPartnerSource('LINKED_CREATOR')
      setSelectedTenantId(s.linkedTenantId)
    } else {
      setPartnerSource('INDEPENDENT_SELLER')
      setSelectedTenantId('')
    }
    setFormPassword(s.password || '')
    setFormType(s.type || 'VENDEDOR')
    setFormName(s.name)
    setFormEmail(s.email)
    setFormPhone(s.phone)
    setFormPixKey(s.pixKey)
    setFormPixType(s.pixKeyType)
    setFormCommission(s.commissionPercent.toString())
    setFormMonthlySalesGoal((s.monthlySalesGoal ?? 5000).toString())
    setFormMonthlySignupsGoal((s.monthlySignupsGoal ?? 25).toString())
    setFormGoalBonusPercent((s.goalBonusPercent ?? 0).toString())
    setFormGoalBonusFixed((s.goalBonusFixed ?? 0).toString())
    setFormInstagram(s.instagram || '')
    setFormYoutube(s.youtube || '')
    setFormCoupon(s.couponCode)
    setFormCode(s.affiliateCode)
    setFormNotes(s.notes || '')
    setFormStatus(s.status)
    setIsNewSellerModalOpen(true)
  }

  const handleSaveSeller = () => {
    if (!formName.trim() || !formEmail.trim()) {
      alert('Nome e E-mail são obrigatórios.')
      return
    }

    if (partnerSource === 'INDEPENDENT_SELLER' && !editingSeller && !formPassword.trim()) {
      alert('Por favor, defina uma senha de acesso para o parceiro independente.')
      return
    }

    const cleanCode = formCode.trim() 
      ? formCode.toLowerCase().replace(/[^a-z0-9_-]+/g, '')
      : formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 15)

    const cleanCoupon = formCoupon.trim()
      ? formCoupon.toUpperCase().replace(/[^A-Z0-9]+/g, '')
      : `${cleanCode.toUpperCase().slice(0, 6)}20`

    const affiliateUrl = `https://www.birdpro.com.br/?ref=${cleanCode}`

    const commPct = parseFloat(formCommission) || (formType === 'EMBAIXADOR' ? 25 : 20)
    const salesGoal = parseFloat(formMonthlySalesGoal) || 5000
    const signupsGoal = parseInt(formMonthlySignupsGoal, 10) || 25
    const bonusPct = parseFloat(formGoalBonusPercent) || 0
    const bonusFixed = parseFloat(formGoalBonusFixed) || 0

    if (editingSeller) {
      const updated: SellerAffiliate = {
        ...editingSeller,
        type: formType,
        name: formName,
        email: formEmail,
        phone: formPhone,
        pixKey: formPixKey,
        pixKeyType: formPixType,
        linkedTenantId: partnerSource === 'LINKED_CREATOR' ? selectedTenantId : undefined,
        isIndependentSeller: partnerSource === 'INDEPENDENT_SELLER',
        password: partnerSource === 'INDEPENDENT_SELLER' ? formPassword : editingSeller.password,
        commissionPercent: commPct,
        monthlySalesGoal: salesGoal,
        monthlySignupsGoal: signupsGoal,
        goalBonusPercent: bonusPct,
        goalBonusFixed: bonusFixed,
        instagram: formInstagram.trim() || undefined,
        youtube: formYoutube.trim() || undefined,
        couponCode: cleanCoupon,
        affiliateCode: cleanCode,
        affiliateUrl,
        notes: formNotes,
        status: formStatus
      }
      db.updateSeller(updated)
    } else {
      const newSeller: SellerAffiliate = {
        id: `seller-${Date.now()}`,
        type: formType,
        name: formName,
        email: formEmail,
        phone: formPhone,
        pixKey: formPixKey,
        pixKeyType: formPixType,
        linkedTenantId: partnerSource === 'LINKED_CREATOR' ? selectedTenantId : undefined,
        isIndependentSeller: partnerSource === 'INDEPENDENT_SELLER',
        password: partnerSource === 'INDEPENDENT_SELLER' ? formPassword : undefined,
        commissionPercent: commPct,
        monthlySalesGoal: salesGoal,
        monthlySignupsGoal: signupsGoal,
        goalBonusPercent: bonusPct,
        goalBonusFixed: bonusFixed,
        instagram: formInstagram.trim() || undefined,
        youtube: formYoutube.trim() || undefined,
        couponCode: cleanCoupon,
        affiliateCode: cleanCode,
        affiliateUrl,
        totalClicks: 0,
        totalSignups: 0,
        totalSalesValue: 0,
        totalCommissionsEarned: 0,
        totalCommissionsPaid: 0,
        balanceAvailable: 0,
        status: formStatus,
        createdAt: new Date().toISOString(),
        notes: formNotes
      }
      db.addSeller(newSeller)
    }

    refreshSellers()
    setIsNewSellerModalOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este parceiro?')) {
      db.deleteSeller(id)
      refreshSellers()
    }
  }

  // Handle Manual Sale Credit
  const handleLaunchSale = () => {
    if (!targetSellerForSale) return
    const saleVal = parseFloat(saleAmount) || 0
    if (saleVal <= 0) return

    // Base commission
    let commPct = targetSellerForSale.commissionPercent
    
    // Check if goal was reached
    const currentSales = targetSellerForSale.totalSalesValue + saleVal
    const goal = targetSellerForSale.monthlySalesGoal || 5000
    if (currentSales >= goal && targetSellerForSale.goalBonusPercent) {
      commPct += targetSellerForSale.goalBonusPercent
    }

    let commAmt = (saleVal * commPct) / 100

    const commRecord: AffiliateCommission = {
      id: `comm-${Date.now()}`,
      affiliateId: targetSellerForSale.id,
      affiliateName: targetSellerForSale.name,
      tenantId: 'tenant-demo-01',
      tenantName: saleTenantName || 'Criatório Novo Assinante',
      planName: salePlanName,
      saleValue: saleVal,
      commissionPercent: commPct,
      commissionAmount: commAmt,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString()
    }

    db.addCommission(commRecord)
    refreshSellers()
    setIsSaleModalOpen(false)
    setTargetSellerForSale(null)
    setSaleTenantName('')
    alert(`Venda creditada com sucesso! Comissão de R$ ${commAmt.toFixed(2)} (${commPct}%) creditada ao parceiro.`)
  }

  // Handle Payout
  const handleLaunchPayout = () => {
    if (!targetSellerForPayout) return
    const amountVal = parseFloat(payoutAmount) || 0
    if (amountVal <= 0) return

    const payout: AffiliatePayout = {
      id: `pay-${Date.now()}`,
      affiliateId: targetSellerForPayout.id,
      affiliateName: targetSellerForPayout.name,
      amount: amountVal,
      pixKey: targetSellerForPayout.pixKey,
      status: 'COMPLETED',
      receiptUrl: payoutReceipt || 'https://comprovante-pix-demo',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }

    db.requestPayout(payout)
    refreshSellers()
    setIsPayoutModalOpen(false)
    setTargetSellerForPayout(null)
    setPayoutAmount('')
    alert(`Pagamento PIX de R$ ${amountVal.toFixed(2)} registrado e debitado com sucesso!`)
  }

  // Stats calculation
  const stats = useMemo(() => {
    const totalSellers = sellers.filter(s => (s.type || 'VENDEDOR') === 'VENDEDOR').length
    const totalEmbaixadores = sellers.filter(s => s.type === 'EMBAIXADOR').length
    const totalRevenue = sellers.reduce((acc, s) => acc + (s.totalSalesValue || 0), 0)
    const totalCommissionsEarned = sellers.reduce((acc, s) => acc + (s.totalCommissionsEarned || 0), 0)
    const totalBalanceToPay = sellers.reduce((acc, s) => acc + (s.balanceAvailable || 0), 0)
    const totalSignups = sellers.reduce((acc, s) => acc + (s.totalSignups || 0), 0)

    // Goals achieved count
    const goalsAchieved = sellers.filter(s => {
      const isSeller = (s.type || 'VENDEDOR') === 'VENDEDOR'
      if (isSeller) {
        const goal = s.monthlySalesGoal || 5000
        return s.totalSalesValue >= goal
      } else {
        const goal = s.monthlySignupsGoal || 50
        return s.totalSignups >= goal
      }
    }).length

    return {
      totalSellers,
      totalEmbaixadores,
      totalAll: sellers.length,
      totalRevenue,
      totalCommissionsEarned,
      totalBalanceToPay,
      totalSignups,
      goalsAchieved
    }
  }, [sellers])

  // Filtered and Sorted Sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      // Mode filter
      const type = s.type || 'VENDEDOR'
      if (selectedMode !== 'ALL' && type !== selectedMode) return false

      // Status filter
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesText = 
          s.name.toLowerCase().includes(q) || 
          s.email.toLowerCase().includes(q) || 
          s.affiliateCode.toLowerCase().includes(q) || 
          s.couponCode.toLowerCase().includes(q) ||
          (s.instagram && s.instagram.toLowerCase().includes(q)) ||
          (s.youtube && s.youtube.toLowerCase().includes(q))
        if (!matchesText) return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'sales') {
        return b.totalSalesValue - a.totalSalesValue
      }
      if (sortBy === 'signups') {
        return b.totalSignups - a.totalSignups
      }
      if (sortBy === 'goal') {
        const pctA = ((a.type === 'EMBAIXADOR') 
          ? (a.totalSignups / (a.monthlySignupsGoal || 50)) 
          : (a.totalSalesValue / (a.monthlySalesGoal || 5000))) * 100
        const pctB = ((b.type === 'EMBAIXADOR') 
          ? (b.totalSignups / (b.monthlySignupsGoal || 50)) 
          : (b.totalSalesValue / (b.monthlySalesGoal || 5000))) * 100
        return pctB - pctA
      }
      return a.name.localeCompare(b.name)
    })
  }, [sellers, selectedMode, statusFilter, searchQuery, sortBy])

  return (
    <div className="space-y-6 pb-16 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <Link href="/dashboard/admin" className="text-[#00c853] hover:underline font-medium">Super Admin</Link>
        <span>/</span>
        <span className="text-slate-400">Vendedores &amp; Embaixadores</span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/10 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-slate-800">
                Gestão de Parceiros Comerciais
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Vendedores &amp; Embaixadores
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina metas individuais, comissões percentuais, bônus de performance e links de indicação para sua equipe e influenciadores da marca.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenNew('VENDEDOR')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>+ Novo Vendedor</span>
          </button>

          <button
            onClick={() => handleOpenNew('EMBAIXADOR')}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>+ Novo Embaixador</span>
          </button>
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Parceiros */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rede de Parceiros</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-800">{stats.totalAll}</span>
              <span className="text-xs text-slate-500 font-medium">cadastrados</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 pt-0.5">
              <span className="text-emerald-700 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {stats.totalSellers} Vendedores
              </span>
              <span>•</span>
              <span className="text-amber-700 flex items-center gap-1">
                <Crown className="w-3 h-3" /> {stats.totalEmbaixadores} Embaixadores
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Faturamento Gerado */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vendas Totais Geradas</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-emerald-600">
                R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {stats.totalSignups} criatórios convertidos
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Comissões Geradas & Saldo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Comissões &amp; Saldo</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-purple-700">
                R$ {stats.totalCommissionsEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <span>Saldo a Pagar:</span>
              <span className="text-emerald-600 font-bold">R$ {stats.totalBalanceToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Performance de Metas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Metas Atingidas no Mês</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-amber-600">{stats.goalsAchieved}</span>
              <span className="text-xs text-slate-500 font-medium">de {stats.totalAll} parceiros</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Bônus e incentivos liberados</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mode Filter Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedMode('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              selectedMode === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Todos os Parceiros</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedMode === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {stats.totalAll}
            </span>
          </button>

          <button
            onClick={() => setSelectedMode('VENDEDOR')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              selectedMode === 'VENDEDOR'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>💼 Vendedores Comerciais</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedMode === 'VENDEDOR' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {stats.totalSellers}
            </span>
          </button>

          <button
            onClick={() => setSelectedMode('EMBAIXADOR')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
              selectedMode === 'EMBAIXADOR'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>👑 Embaixadores BIRDPRO</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedMode === 'EMBAIXADOR' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {stats.totalEmbaixadores}
            </span>
          </button>
        </div>

        {/* Right Sort & Search Filters */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-8.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="sales">Ordenar por: Maior Faturamento</option>
            <option value="goal">Ordenar por: % Atingimento da Meta</option>
            <option value="signups">Ordenar por: Mais Cadastros</option>
            <option value="name">Ordenar por: Nome</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-8.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Status: Todos</option>
            <option value="ACTIVE">Apenas Ativos</option>
            <option value="BLOCKED">Apenas Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, email, código de afiliado, cupom, @instagram ou canal no YouTube..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Sellers & Ambassadors List */}
      <div className="space-y-4">
        {filteredSellers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="font-bold text-slate-700 text-sm">Nenhum parceiro encontrado nesta categoria.</p>
              <p className="text-slate-400 mt-0.5">Tente ajustar seus termos de busca ou cadastrar um novo vendedor/embaixador.</p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => handleOpenNew('VENDEDOR')}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold"
              >
                + Cadastrar Vendedor
              </button>
              <button
                onClick={() => handleOpenNew('EMBAIXADOR')}
                className="px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-bold"
              >
                + Cadastrar Embaixador
              </button>
            </div>
          </div>
        ) : (
          filteredSellers.map((s) => {
            const isEmbaixador = s.type === 'EMBAIXADOR'
            const salesGoal = s.monthlySalesGoal || (isEmbaixador ? 10000 : 5000)
            const signupsGoal = s.monthlySignupsGoal || (isEmbaixador ? 50 : 25)
            
            // Goal progress percentage
            const primaryGoalPct = isEmbaixador
              ? Math.min(100, Math.round((s.totalSignups / signupsGoal) * 100))
              : Math.min(100, Math.round((s.totalSalesValue / salesGoal) * 100))
            
            const isGoalReached = isEmbaixador 
              ? s.totalSignups >= signupsGoal 
              : s.totalSalesValue >= salesGoal

            // Clean phone for WhatsApp URL
            const cleanPhone = s.phone ? s.phone.replace(/\D/g, '') : ''
            const whatsAppUrl = cleanPhone 
              ? `https://wa.me/55${cleanPhone.startsWith('55') ? cleanPhone.slice(2) : cleanPhone}?text=${encodeURIComponent(`Olá ${s.name}, tudo bem? Aqui é da equipe da BIRDPRO!`)}` 
              : null

            return (
              <div 
                key={s.id} 
                className={`bg-white rounded-xl border shadow-xs overflow-hidden transition-all duration-200 ${
                  isEmbaixador 
                    ? 'border-amber-200/80 hover:border-amber-400 hover:shadow-md' 
                    : 'border-slate-200 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                {/* Card Header */}
                <div className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
                  isEmbaixador 
                    ? 'bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white border-amber-100' 
                    : 'bg-slate-50/80 border-slate-200'
                }`}>
                  {/* Left: Mode Badge, Name & Status */}
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    {/* Mode Tag */}
                    {isEmbaixador ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs flex items-center space-x-1">
                        <Crown className="w-3.5 h-3.5" />
                        <span>EMBAIXADOR BIRDPRO</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-emerald-700 text-white shadow-xs flex items-center space-x-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>VENDEDOR COMERCIAL</span>
                      </span>
                    )}

                    <span className="font-bold text-sm text-slate-800">{s.name}</span>

                    {/* Linkage badge */}
                    {s.linkedTenantId ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <span>🔗 Criador Vinculado:</span>
                        <strong className="truncate max-w-[130px]">{allTenants.find((t: Tenant) => t.id === s.linkedTenantId)?.name || 'Criatório'}</strong>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <span>🔐 Login Independente</span>
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status === 'ACTIVE' ? 'ATIVO' : 'BLOQUEADO'}
                    </span>

                    {/* Commission Rate & Bonus Badge */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        {s.commissionPercent}% de Comissão Base
                      </span>
                      {s.goalBonusPercent ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>+{s.goalBonusPercent}% bônus meta</span>
                        </span>
                      ) : null}
                      {s.goalBonusFixed ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                          <GiftIcon className="w-3 h-3 text-emerald-600" />
                          <span>+R$ {s.goalBonusFixed} bônus fixo</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-1.5">
                    {whatsAppUrl && (
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-bold rounded-lg flex items-center space-x-1 transition shadow-xs"
                        title="Abrir WhatsApp com este parceiro"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setTargetSellerForSale(s)
                        setSaleAmount('169.99')
                        setIsSaleModalOpen(true)
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg flex items-center space-x-1 transition shadow-xs cursor-pointer"
                      title="Lançar venda manual comissionada"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Lançar Venda</span>
                    </button>

                    <button
                      onClick={() => {
                        setTargetSellerForPayout(s)
                        setPayoutAmount(s.balanceAvailable.toString())
                        setIsPayoutModalOpen(true)
                      }}
                      disabled={s.balanceAvailable <= 0}
                      className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-[11px] font-bold rounded-lg flex items-center space-x-1 transition shadow-xs cursor-pointer"
                      title="Pagar comissão via PIX"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Pagar PIX</span>
                    </button>

                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Editar parceiro e metas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Excluir parceiro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Col 1: Metas & Progresso (Span 4) */}
                  <div className="md:col-span-4 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-xs">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span>Meta do Mês ({isEmbaixador ? 'Cadastros' : 'Faturamento'})</span>
                      </div>
                      {isGoalReached ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                          <span>META ATINGIDA!</span>
                        </span>
                      ) : primaryGoalPct >= 70 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-600" />
                          <span>Na reta final</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Em andamento
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        {isEmbaixador ? (
                          <>
                            <span>{s.totalSignups} criatórios</span>
                            <span className="text-slate-400">Meta: {signupsGoal}</span>
                          </>
                        ) : (
                          <>
                            <span>R$ {s.totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span className="text-slate-400">Meta: R$ {salesGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isGoalReached 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                              : isEmbaixador 
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                                : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          }`}
                          style={{ width: `${primaryGoalPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                        <span>{primaryGoalPct}% concluído</span>
                        {isGoalReached ? (
                          <span className="text-emerald-700 font-bold">🎉 Superou a meta</span>
                        ) : (
                          <span>Faltam {isEmbaixador ? `${Math.max(0, signupsGoal - s.totalSignups)} criatórios` : `R$ ${Math.max(0, salesGoal - s.totalSalesValue).toFixed(2)}`}</span>
                        )}
                      </div>
                    </div>

                    {/* Bonus Explanation Box */}
                    <div className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Incentivo por Meta:
                      </span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {s.goalBonusPercent ? `• +${s.goalBonusPercent}% comissão extra em todas as vendas do mês.` : ''}
                        {s.goalBonusFixed ? ` • Bônus fixo de R$ ${s.goalBonusFixed.toFixed(2)} no PIX.` : ''}
                        {!s.goalBonusPercent && !s.goalBonusFixed ? '• Reconhecimento padrão sem bônus financeiro estipulado.' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Col 2: Links, Códigos & Redes (Span 4) */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Link Exclusivo de Indicação
                      </label>
                      <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono">
                        <span className="text-[#00c853] truncate flex-1">{s.affiliateUrl}</span>
                        <button
                          onClick={() => handleCopyLink(s.affiliateUrl, s.id)}
                          className="p-1 text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                          title="Copiar Link"
                        >
                          {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Cupom de Desconto
                        </label>
                        <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-700">
                          <span className="flex-1 truncate">{s.couponCode}</span>
                          <button
                            onClick={() => handleCopyLink(s.couponCode, `c-${s.id}`)}
                            className="p-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                            title="Copiar Cupom"
                          >
                            {copiedId === `c-${s.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Código Ref
                        </label>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-700 truncate">
                          {s.affiliateCode}
                        </div>
                      </div>
                    </div>

                    {/* Social Channels (Instagram / YouTube) */}
                    {(s.instagram || s.youtube) && (
                      <div className="pt-1 flex items-center gap-2 flex-wrap text-[11px]">
                        {s.instagram && (
                          <span className="px-2 py-0.5 bg-pink-50 border border-pink-200 text-pink-700 rounded-md flex items-center gap-1 font-medium">
                            <Instagram className="w-3 h-3 text-pink-600" />
                            <span>{s.instagram}</span>
                          </span>
                        )}
                        {s.youtube && (
                          <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-1 font-medium truncate max-w-[180px]">
                            <Youtube className="w-3 h-3 text-red-600" />
                            <span className="truncate">{s.youtube}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notes if present */}
                    {s.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                        "{s.notes}"
                      </p>
                    )}
                  </div>

                  {/* Col 3: Financeiro & PIX (Span 4) */}
                  <div className="md:col-span-4 flex flex-col justify-between space-y-3">
                    {/* Performance metrics grid */}
                    <div className="grid grid-cols-2 gap-2 bg-gradient-to-br from-slate-50 to-slate-100/80 p-3 rounded-lg border border-slate-200">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Cliques / Criatórios</span>
                        <span className="text-sm font-black text-slate-700">{s.totalClicks} / {s.totalSignups}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Vendas Totais</span>
                        <span className="text-sm font-black text-slate-800">
                          R$ {s.totalSalesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Comissões</span>
                        <span className="text-sm font-black text-purple-700">
                          R$ {s.totalCommissionsEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-emerald-600 block uppercase font-bold">Saldo Disponível</span>
                        <span className="text-sm font-black text-emerald-600">
                          R$ {s.balanceAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* PIX Key and Contact box */}
                    <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Chave PIX ({s.pixKeyType}):</span>
                        <span className="font-mono font-bold text-slate-800 truncate max-w-[150px]">{s.pixKey}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 text-[11px]">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-slate-700 truncate max-w-[170px]">{s.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 text-[11px]">
                        <span className="text-slate-400">Telefone:</span>
                        <span className="text-slate-700">{s.phone || 'Não informado'}</span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: NOVO / EDITAR PARCEIRO (VENDEDOR OU EMBAIXADOR)               */}
      {/* ==================================================================== */}
      {isNewSellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden my-8">
            <div className="px-5 py-4 bg-[#171b21] text-white flex items-center justify-between">
              <span className="font-bold text-sm flex items-center space-x-2">
                {formType === 'EMBAIXADOR' ? (
                  <Crown className="w-5 h-5 text-amber-400" />
                ) : (
                  <Briefcase className="w-5 h-5 text-[#00c853]" />
                )}
                <span>
                  {editingSeller 
                    ? `Editar ${formType === 'EMBAIXADOR' ? 'Embaixador' : 'Vendedor'}` 
                    : `Cadastrar Novo ${formType === 'EMBAIXADOR' ? 'Embaixador' : 'Vendedor'}`}
                </span>
              </span>
              <button onClick={() => { setIsNewSellerModalOpen(false); resetForm() }} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* ============================================================ */}
              {/* ORIGEM DO PARCEIRO: CRIADOR EXISTENTE vs ACESSO INDEPENDENTE */}
              {/* ============================================================ */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Origem do Parceiro Comercial <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-normal text-slate-500">Selecione se já possui criatório no sistema</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPartnerSource('LINKED_CREATOR')
                      if (allTenants.length > 0 && !selectedTenantId) {
                        handleSelectCreator(allTenants[0])
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                      partnerSource === 'LINKED_CREATOR'
                        ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white/70'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${partnerSource === 'LINKED_CREATOR' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Vincular Criador Existente</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Criador já cadastrado no BIRDPRO. As metas e comissões aparecerão no <strong>Indique &amp; Ganhe</strong> dele.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPartnerSource('INDEPENDENT_SELLER')
                      setSelectedTenantId('')
                      if (!formPassword) handleGeneratePassword()
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                      partnerSource === 'INDEPENDENT_SELLER'
                        ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white/70'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${partnerSource === 'INDEPENDENT_SELLER' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Novo Parceiro Independente</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Não é criador. Criar login e senha com acesso <strong>estritamente a vendas e ganhos</strong>.
                      </div>
                    </div>
                  </button>
                </div>

                {/* Conditional Subsection for LINKED_CREATOR */}
                {partnerSource === 'LINKED_CREATOR' && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Pesquisar &amp; Selecionar Criador Cadastrado <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={creatorSearch}
                          onChange={(e) => setCreatorSearch(e.target.value)}
                          placeholder="Buscar por nome do criatório, criador ou email..."
                          className="flex-1 h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <select
                        value={selectedTenantId}
                        onChange={(e) => {
                          const target = allTenants.find((t: Tenant) => t.id === e.target.value)
                          if (target) handleSelectCreator(target)
                        }}
                        className="w-full h-9 px-3 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-slate-800"
                      >
                        <option value="">-- Selecione o Criatório --</option>
                        {filteredTenantsForSelect.map((t: Tenant) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.email}) • {t.billingCycle || 'Plano'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedTenantId && (
                      <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            Criador vinculado: <strong>{formName}</strong> ({formEmail})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          Sincronização Ativa
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional Subsection for INDEPENDENT_SELLER */}
                {partnerSource === 'INDEPENDENT_SELLER' && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Este parceiro acessará o <strong>Portal de Vendas &amp; Ganhos</strong> (sem ferramentas de criatório).
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Senha de Acesso ao Painel <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            placeholder="Defina a senha"
                            className="flex-1 h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 cursor-pointer whitespace-nowrap"
                          >
                            Gerar Senha
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">E-mail de Login <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="vendedor@email.com"
                          className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode Selection Tiles */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Tipo de Parceria <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('VENDEDOR')
                      if (!editingSeller) {
                        setFormCommission('20')
                        setFormMonthlySalesGoal('5000')
                        setFormMonthlySignupsGoal('25')
                        setFormGoalBonusPercent('5')
                      }
                    }}
                    className={`p-3 rounded-lg border text-left transition flex items-start space-x-3 cursor-pointer ${
                      formType === 'VENDEDOR'
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formType === 'VENDEDOR' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Vendedor Comercial</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Foco em prospecção direta, fechamento de planos e meta financeira (R$).
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('EMBAIXADOR')
                      if (!editingSeller) {
                        setFormCommission('25')
                        setFormMonthlySalesGoal('10000')
                        setFormMonthlySignupsGoal('50')
                        setFormGoalBonusFixed('500')
                      }
                    }}
                    className={`p-3 rounded-lg border text-left transition flex items-start space-x-3 cursor-pointer ${
                      formType === 'EMBAIXADOR'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formType === 'EMBAIXADOR' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Embaixador da Marca</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Influenciador, criador de conteúdo ou clube com meta de novos criatórios.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Nome Completo / Razão Social / Nome do Canal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={formType === 'EMBAIXADOR' ? 'Ex: Mariana Duarte (Canal Ornitologia)' : 'Ex: Carlos Oliveira (Comercial Sul)'}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">E-mail <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="parceiro@email.com"
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

              {/* Goals and Commissions Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Estipulação de Metas &amp; Comissões ({formType === 'EMBAIXADOR' ? 'Embaixador' : 'Vendedor'})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Comissão Base (%)</label>
                    <input
                      type="number"
                      value={formCommission}
                      onChange={(e) => setFormCommission(e.target.value)}
                      placeholder="20"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Meta Mensal (R$)</label>
                    <input
                      type="number"
                      value={formMonthlySalesGoal}
                      onChange={(e) => setFormMonthlySalesGoal(e.target.value)}
                      placeholder="5000"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Meta Novos Criatórios</label>
                    <input
                      type="number"
                      value={formMonthlySignupsGoal}
                      onChange={(e) => setFormMonthlySignupsGoal(e.target.value)}
                      placeholder="25"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Performance Bonus inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Bônus Extra por Meta Atingida (%)</span>
                    </label>
                    <input
                      type="number"
                      value={formGoalBonusPercent}
                      onChange={(e) => setFormGoalBonusPercent(e.target.value)}
                      placeholder="Ex: 5 (% adicionado à comissão)"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-600" />
                      <span>Bônus Fixo por Meta Atingida (R$)</span>
                    </label>
                    <input
                      type="number"
                      value={formGoalBonusFixed}
                      onChange={(e) => setFormGoalBonusFixed(e.target.value)}
                      placeholder="Ex: 500 (R$ pago no PIX)"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels (Instagram & YouTube) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram do Parceiro</span>
                  </label>
                  <input
                    type="text"
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    placeholder="@perfil.aves"
                    className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                    <Youtube className="w-3.5 h-3.5 text-red-600" />
                    <span>Canal no YouTube / Mídia</span>
                  </label>
                  <input
                    type="text"
                    value={formYoutube}
                    onChange={(e) => setFormYoutube(e.target.value)}
                    placeholder="Nome do Canal"
                    className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* PIX Key for payouts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 block">Chave PIX para Pagamento</label>
                  <input
                    type="text"
                    value={formPixKey}
                    onChange={(e) => setFormPixKey(e.target.value)}
                    placeholder="Chave PIX do parceiro"
                    className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Tipo</label>
                  <select
                    value={formPixType}
                    onChange={(e) => setFormPixType(e.target.value as any)}
                    className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="PHONE">Telefone</option>
                    <option value="RANDOM">Aleatória</option>
                  </select>
                </div>
              </div>

              {/* Custom Link code & Coupon */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Código Ref Link</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="ex: mari-aves ou carlos-sul"
                    className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Cupom Desconto</label>
                  <input
                    type="text"
                    value={formCoupon}
                    onChange={(e) => setFormCoupon(e.target.value)}
                    placeholder="ex: MARI25 ou CARLOS20"
                    className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Status da Parceria</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACTIVE">Ativo (Pode indicar, comissionar e receber bônus)</option>
                  <option value="INACTIVE">Inativo (Pausado temporariamente)</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Observações Internas</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Informações sobre audiência, região de atuação, acordo especial..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setIsNewSellerModalOpen(false); resetForm() }}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSeller}
                className="px-5 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
              >
                {editingSeller ? 'Salvar Alterações' : 'Cadastrar Parceiro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: LANÇAR VENDA MANUAL COMISSIONADA                               */}
      {/* ==================================================================== */}
      {isSaleModalOpen && targetSellerForSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Lançar Venda Comissionada</span>
              </span>
              <button onClick={() => setIsSaleModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 space-y-1">
                <div>Parceiro: <strong>{targetSellerForSale.name}</strong></div>
                <div className="text-[11px] text-emerald-700">
                  Tipo: <strong>{targetSellerForSale.type === 'EMBAIXADOR' ? 'Embaixador da Marca' : 'Vendedor Comercial'}</strong> • Comissão Base: <strong>{targetSellerForSale.commissionPercent}%</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Nome do Criatório / Assinante</label>
                <input
                  type="text"
                  value={saleTenantName}
                  onChange={(e) => setSaleTenantName(e.target.value)}
                  placeholder="Ex: Criatório Canto Dourado"
                  className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Plano Vendido</label>
                <select
                  value={salePlanName}
                  onChange={(e) => {
                    setSalePlanName(e.target.value)
                    if (e.target.value === 'Plano Mensal PRO') setSaleAmount('14.99')
                    if (e.target.value === 'Plano Anual PRO') setSaleAmount('169.99')
                  }}
                  className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                >
                  <option value="Plano Mensal PRO">Plano Mensal PRO (R$ 14,99)</option>
                  <option value="Plano Anual PRO">Plano Anual PRO (R$ 169,99)</option>
                  <option value="Serviço de Genealogia Avulso">Serviço de Genealogia Avulso (R$ 49,90)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Valor da Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500">Comissão a creditar:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  R$ {((parseFloat(saleAmount) || 0) * targetSellerForSale.commissionPercent / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsSaleModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLaunchSale}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Confirmar Venda &amp; Creditar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: PAGAR COMISSÃO PIX                                            */}
      {/* ==================================================================== */}
      {isPayoutModalOpen && targetSellerForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-purple-700 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>Registrar Pagamento PIX</span>
              </span>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-900 space-y-1">
                <div>Favorecido: <strong>{targetSellerForPayout.name}</strong></div>
                <div>Chave PIX: <strong>{targetSellerForPayout.pixKey}</strong> ({targetSellerForPayout.pixKeyType})</div>
                <div>Saldo Disponível: <strong>R$ {targetSellerForPayout.balanceAvailable.toFixed(2)}</strong></div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Valor do Pagamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Comprovante / ID da Transação (opcional)</label>
                <input
                  type="text"
                  value={payoutReceipt}
                  onChange={(e) => setPayoutReceipt(e.target.value)}
                  placeholder="Ex: E2E1234567890 ou link"
                  className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
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
                onClick={handleLaunchPayout}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Confirmar Pagamento PIX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="8" width="18" height="4" rx="1"/>
      <path d="M12 8v13"/>
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
    </svg>
  )
}

function Instagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

function Youtube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
    </svg>
  )
}
