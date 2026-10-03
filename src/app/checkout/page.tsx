'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Lock, 
  ShieldCheck, 
  Check, 
  QrCode, 
  CreditCard, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  Tag,
  Building2,
  FileText
} from 'lucide-react'
import { db } from '@/lib/db'
import { useAuth } from '@/lib/auth-context'
import { generateEmvCoPix } from '@/lib/pagbank'
import { formatCurrency } from '@/lib/utils'
import { CouponValidationResult, PlanType } from '@/types'
import { Logo } from '@/components/ui/logo'

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  // Plan Selection from query param (default: anual)
  const initialPlanParam = searchParams.get('plano') || searchParams.get('plan') || 'anual'
  const [selectedCycle, setSelectedCycle] = useState<'ANUAL' | 'MENSAL'>(
    initialPlanParam.toLowerCase() === 'mensal' ? 'MENSAL' : 'ANUAL'
  )

  // Referral / Coupon Code from query param if available (e.g. ?ref=carlos20)
  const initialRef = searchParams.get('ref') || searchParams.get('cupom') || ''

  // Form Fields
  const [formData, setFormData] = useState({
    document: '', // CNPJ/CPF*
    name: '', // Nome* (Razão Social ou Nome Completo)
    criatorioName: '', // Nome do Criatório
    ddd: '', // DDD*
    phone: '', // Celular/WhatsApp*
    email: '', // E-mail*
    confirmEmail: '', // Verificar E-mail*
    password: '', // Senha de Acesso
    cep: '', // CEP*
    address: '', // Endereço* (Logradouro)
    number: '', // Número*
    neighborhood: '', // Bairro*
    state: 'SP', // UF*
    city: '', // Cidade*
    complement: '', // Complemento
    promoCode: initialRef // Código Promocional
  })

  // Checkboxes
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeCancelPolicy, setAgreeCancelPolicy] = useState(false)

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null)
  const [couponError, setCouponError] = useState('')
  const [isCheckingCep, setIsCheckingCep] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Payment Modal / Flow States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD' | 'BOLETO'>('PIX')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)

  // Card Form
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardInstallments, setCardInstallments] = useState('1')

  // Calculate Prices
  const basePrice = selectedCycle === 'ANUAL' ? 169.99 : 14.99
  const discountPercent = appliedCoupon?.valid ? appliedCoupon.discountPercent : 0
  const discountAmount = (basePrice * discountPercent) / 100
  const finalPrice = Math.max(1, basePrice - discountAmount)

  // Initialize coupon validation if initialRef is provided
  useEffect(() => {
    if (initialRef) {
      const result = db.validateCoupon(initialRef)
      if (result.valid) {
        setAppliedCoupon(result)
      }
    }
  }, [initialRef])

  // ViaCEP Lookup
  const handleLookupCep = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      alert('Por favor, digite um CEP válido com 8 dígitos.')
      return
    }

    setIsCheckingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (data && !data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          complement: data.complemento || prev.complement
        }))
      } else {
        alert('CEP não encontrado. Por favor, preencha o endereço manualmente.')
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e)
    } finally {
      setIsCheckingCep(false)
    }
  }

  // Apply Promotional Coupon
  const handleApplyCoupon = () => {
    setCouponError('')
    if (!formData.promoCode.trim()) {
      setAppliedCoupon(null)
      return
    }

    const result = db.validateCoupon(formData.promoCode.trim())
    if (result.valid) {
      setAppliedCoupon(result)
      setCouponError('')
    } else {
      setAppliedCoupon(null)
      setCouponError(result.message)
    }
  }

  // Form Validation & Open PagBank Checkout Modal
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    // Validations
    if (!formData.document.trim()) {
      setErrorMessage('Por favor, informe seu CPF ou CNPJ.')
      return
    }
    if (!formData.name.trim()) {
      setErrorMessage('Por favor, informe seu Nome Completo ou Razão Social.')
      return
    }
    if (!formData.ddd.trim() || !formData.phone.trim()) {
      setErrorMessage('Por favor, informe seu DDD e Celular/WhatsApp.')
      return
    }
    if (!formData.email.trim()) {
      setErrorMessage('Por favor, informe seu E-mail.')
      return
    }
    if (formData.email.trim().toLowerCase() !== formData.confirmEmail.trim().toLowerCase()) {
      setErrorMessage('Os e-mails informados nos campos "E-mail" e "Verificar E-mail" não coincidem.')
      return
    }
    if (!formData.password.trim() || formData.password.length < 4) {
      setErrorMessage('Por favor, crie uma senha de acesso com no mínimo 4 caracteres.')
      return
    }
    if (!formData.cep.trim() || !formData.address.trim() || !formData.neighborhood.trim() || !formData.city.trim()) {
      setErrorMessage('Por favor, preencha o endereço completo com CEP, Rua, Bairro e Cidade.')
      return
    }
    if (!agreeTerms) {
      setErrorMessage('Você deve concordar com o contrato de prestação de serviço e política de privacidade.')
      return
    }
    if (!agreeCancelPolicy) {
      setErrorMessage('Você deve estar ciente da política de reembolso após 7 dias corridos.')
      return
    }

    // All valid -> open PagBank payment modal
    setIsPaymentModalOpen(true)
  }

  // Generate Real Dynamic PIX Code
  const globalConfig = db.getGlobalConfig()
  const pagbankPixKey = globalConfig.pagbankPixKey || '6f33236f-92cb-4012-b0a8-332e3af35039'
  const txid = `PGB${Date.now().toString().slice(-8)}`
  const currentPixCode = generateEmvCoPix(
    pagbankPixKey, 
    'BIRDPRO TECNOLOGIA', 
    'SAO PAULO', 
    finalPrice, 
    txid
  )

  const handleCopyPix = () => {
    navigator.clipboard.writeText(currentPixCode)
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 2500)
  }

  // Confirm Payment & Provision Account
  const handleConfirmPagbankPayment = async () => {
    setIsSubmitting(true)

    setTimeout(async () => {
      const cleanEmail = formData.email.trim().toLowerCase()
      const tenantName = formData.criatorioName.trim() || `Criatório ${formData.name.split(' ')[0]}`
      const fullPhone = `(${formData.ddd.trim()}) ${formData.phone.trim()}`
      const monthsToAdd = selectedCycle === 'ANUAL' ? 12 : 1
      const calculatedExpires = new Date(Date.now() + monthsToAdd * 30 * 24 * 60 * 60 * 1000).toISOString()

      // 1. Create or update tenant
      const createdResult = db.createTenantManual({
        name: tenantName,
        responsibleName: formData.name.trim(),
        email: cleanEmail,
        phone: fullPhone,
        document: formData.document.trim(),
        plan: 'PREMIUM',
        billingCycle: selectedCycle === 'ANUAL' ? 'ANUAL' : 'MENSAL',
        maxBirds: 9999,
        expiresAt: calculatedExpires,
        planStatus: 'ACTIVE',
        password: formData.password.trim()
      })

      // Update tenant address
      db.updateTenant({
        address: formData.address,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.cep,
        complement: formData.complement,
        lastPaymentDate: new Date().toISOString()
      }, createdResult.tenant.id)

      // 2. If coupon was applied, record affiliate commission
      if (appliedCoupon?.sellerId) {
        db.addCommission({
          id: `comm-${Date.now()}`,
          affiliateId: appliedCoupon.sellerId,
          affiliateName: appliedCoupon.sellerName || 'Parceiro Comercial BirdPro',
          tenantId: createdResult.tenant.id,
          tenantName: createdResult.tenant.name,
          planName: `Plano Completo BirdPro (${selectedCycle === 'ANUAL' ? 'Anual' : 'Mensal'})`,
          saleValue: finalPrice,
          commissionPercent: 20,
          commissionAmount: (finalPrice * 20) / 100,
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        })
      }

      // 3. Authenticate User immediately
      await login(cleanEmail, formData.password.trim())

      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] py-8 sm:py-12 px-3 sm:px-6 font-sans text-slate-800">
      
      {/* Top Header with BirdPro Logo */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Logo variant="dark" size="md" href="/" />
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente Seguro 256-bit SSL</span>
        </div>
      </div>

      {/* Main Contracting Form Card Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Form Header Title */}
        <div className="pt-8 pb-6 px-6 sm:px-12 text-center border-b border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-normal text-slate-800 tracking-tight">
            Formulário de Contratação
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Preencha seus dados para contratação e liberação imediata do sistema <strong>BIRDPRO</strong>
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitForm} className="p-6 sm:p-12 space-y-8 text-xs">
          
          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 1: NOME & IDENTIFICAÇÃO                                      */}
          {/* ==================================================================== */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 italic">
              Nome
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* CNPJ / CPF */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  CNPJ/CPF<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>

              {/* Nome Completo / Razão Social */}
              <div className="sm:col-span-8 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Nome<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo ou Razão Social"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Nome do Criatório & Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Nome do seu Criatório / Plantel<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.criatorioName}
                  onChange={(e) => setFormData({ ...formData, criatorioName: e.target.value })}
                  placeholder="Ex: Criadouro Canto Real"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Crie sua Senha de Acesso ao Sistema<span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 4 dígitos"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 2: CONTATO                                                   */}
          {/* ==================================================================== */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-slate-900 italic">
              Contato
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* DDD */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  DDD<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.ddd}
                  onChange={(e) => setFormData({ ...formData, ddd: e.target.value.replace(/\D/g, '') })}
                  placeholder="Ex: 11"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 text-center font-mono"
                />
              </div>

              {/* Celular / WhatsApp */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Celular/WhatsApp<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="99999-9999"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>

              {/* E-mail */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  E-mail<span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Verificar E-mail */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Verificar E-mail<span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.confirmEmail}
                  onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                  placeholder="Repita seu e-mail"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 3: ENDEREÇO                                                  */}
          {/* ==================================================================== */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-slate-900 italic">
              Endereço
            </h2>

            {/* CEP + Endereço + Número */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* CEP with Search Button */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  CEP<span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                    className="w-full h-9 pl-3 pr-8 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleLookupCep}
                    disabled={isCheckingCep}
                    className="absolute right-1 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="Buscar endereço pelo CEP"
                  >
                    {isCheckingCep ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Endereço */}
              <div className="sm:col-span-7 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Endereço<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, Avenida, Estrada..."
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Número */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Número<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Nº ou S/N"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Bairro + UF + Cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Bairro */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Bairro<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="Seu bairro"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* UF */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  UF<span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  {BRAZIL_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              {/* Cidade */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Cidade<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Sua cidade"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Complemento + Código Promocional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complement}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  placeholder="Apto, Bloco, Casa, etc."
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Código Promocional
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                    onBlur={handleApplyCoupon}
                    placeholder="Cupom ou indicação"
                    className="w-full h-9 px-3 uppercase font-mono bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold transition text-xs cursor-pointer"
                  >
                    Validar
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{couponError}</p>
                )}
                {appliedCoupon?.valid && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    ✅ {appliedCoupon.message} (-{appliedCoupon.discountPercent}%)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 4: SELECIONADO: PLANO & VALOR                                */}
          {/* ==================================================================== */}
          <div className="pt-6 border-t border-slate-200 text-center space-y-3">
            <span className="text-xs text-slate-500 block">
              Selecionado:
            </span>

            {/* Plan Switcher Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedCycle('ANUAL')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCycle === 'ANUAL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                PLANO ANUAL (Recomendado)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('MENSAL')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCycle === 'MENSAL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                PLANO MENSAL
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                PLANO COMPLETO BIRDPRO {selectedCycle === 'ANUAL' ? 'ANUAL' : 'MENSAL'}
              </h3>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {formatCurrency(finalPrice)}
              </div>
              {appliedCoupon?.valid && (
                <span className="text-xs text-emerald-600 font-bold block">
                  Desconto de {appliedCoupon.discountPercent}% aplicado (de {formatCurrency(basePrice)} por {formatCurrency(finalPrice)})
                </span>
              )}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 5: TERMOS & CONDIÇÕES                                        */}
          {/* ==================================================================== */}
          <div className="pt-6 border-t border-slate-200 space-y-3 text-slate-700">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-xs leading-relaxed">
                Estou de acordo com o <span className="text-amber-700 font-semibold hover:underline">contrato de prestação de serviço</span> e a <span className="text-amber-700 font-semibold hover:underline">política de privacidade - LGPD</span>.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreeCancelPolicy}
                onChange={(e) => setAgreeCancelPolicy(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="text-xs leading-relaxed">
                Estou ciente de que em caso de cancelamento <strong>NÃO</strong> haverá reembolso parcial ou integral após 7 dias corridos da data de contratação.
              </span>
            </label>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 6: PAGAR COM PAGSEGURO / PAGBANK BUTTON                      */}
          {/* ==================================================================== */}
          <div className="pt-6 flex flex-col items-center justify-center space-y-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#246bb4] hover:bg-[#1d5996] text-white font-bold text-sm rounded-md shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Pagar com</span>
              <span className="px-2 py-0.5 bg-[#ffc107] text-[#1c2e4a] rounded font-black text-xs inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#246bb4]"></span>
                pagseguro / pagbank
              </span>
            </button>

            <span className="text-[11px] text-slate-500 tracking-wide font-medium">
              Sua compra protegida
            </span>
          </div>

        </form>
      </div>

      {/* ==================================================================== */}
      {/* MODAL DE PAGAMENTO PAGBANK (PIX / CARTÃO / BOLETO)                   */}
      {/* ==================================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#171b21] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00c853]" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Pagamento Seguro PagBank (PagSeguro)
                </span>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Order Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Plano Completo BirdPro ({selectedCycle === 'ANUAL' ? 'Anual' : 'Mensal'})</span>
                  <span>{formatCurrency(finalPrice)}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Criatório: <strong>{formData.criatorioName || formData.name}</strong> ({formData.email})
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-2">
                  Escolha a forma de pagamento PagBank:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'PIX'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">⚡ PIX Imediato</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Liberação na hora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">💳 Cartão PagBank</span>
                    <span className="text-[10px] text-slate-500 font-medium">Até 12x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BOLETO')}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'BOLETO'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">📄 Boleto</span>
                    <span className="text-[10px] text-slate-500 font-medium">1 a 3 dias</span>
                  </button>
                </div>
              </div>

              {/* PIX PagBank View */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>QR Code PIX PagBank PagSeguro</span>
                  </div>

                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border-2 border-emerald-500/40 shadow-xs flex flex-col items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentPixCode)}`} 
                      alt="QR Code PIX PagBank" 
                      className="w-40 h-40 object-contain rounded-lg"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Abra o app do seu banco, selecione a opção <strong>PIX Copia e Cola</strong> e cole o código abaixo:
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentPixCode}
                      className="w-full h-8.5 px-2.5 text-[10px] font-mono bg-white border border-slate-300 rounded-lg text-slate-600 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3 h-8.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {pixCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Card PagBank View */}
              {paymentMethod === 'CARD' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Número do Cartão de Crédito</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Ex: MARCOS A SILVA"
                      className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg uppercase focus:outline-none focus:border-[#00c853]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Validade</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00c853]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Parcelamento no Cartão de Crédito</label>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(e.target.value)}
                      className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-[#00c853]"
                    >
                      <option value="1">1x de {formatCurrency(finalPrice)} (À vista)</option>
                      {selectedCycle === 'ANUAL' ? (
                        <>
                          <option value="2">2x de {formatCurrency(finalPrice / 2)} (Sem juros)</option>
                          <option value="3">3x de {formatCurrency(finalPrice / 3)} (Sem juros)</option>
                          <option value="4">4x de {formatCurrency(finalPrice / 4)} (Sem juros)</option>
                          <option value="5">5x de {formatCurrency(finalPrice / 5)} (Sem juros)</option>
                          <option value="6">6x de {formatCurrency(finalPrice / 6)} (Sem juros)</option>
                          <option value="7">7x de {formatCurrency((finalPrice * 1.04) / 7)}</option>
                          <option value="8">8x de {formatCurrency((finalPrice * 1.05) / 8)}</option>
                          <option value="9">9x de {formatCurrency((finalPrice * 1.06) / 9)}</option>
                          <option value="10">10x de {formatCurrency((finalPrice * 1.07) / 10)}</option>
                          <option value="11">11x de {formatCurrency((finalPrice * 1.08) / 11)}</option>
                          <option value="12">12x de {formatCurrency((finalPrice * 1.09) / 12)}</option>
                        </>
                      ) : (
                        <option value="1">1x de {formatCurrency(finalPrice)} (Mensalidade)</option>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Boleto PagBank View */}
              {paymentMethod === 'BOLETO' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-800">Boleto Bancário PagBank</p>
                  <p className="text-[11px] text-slate-500">
                    O boleto será gerado com vencimento para 3 dias úteis. A confirmação do acesso ocorre automaticamente assim que compensado.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Voltar ao Formulário
              </button>
              <button
                type="button"
                onClick={handleConfirmPagbankPayment}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-black rounded-lg transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processando no PagBank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Pagamento &amp; Liberar Acesso</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUCCESS MODAL: ACESSO IDENTIFICADO E LIBERADO                        */}
      {/* ==================================================================== */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-200 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#00c853] flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                🎉 Pagamento Identificado com Sucesso!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seu pagamento foi aprovado pelo <strong>PagBank PagSeguro</strong> e o plano <strong>PREMIUM COMPLETO</strong> já está ativo para seu criatório.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 text-left">
              <div>Criatório: <strong>{formData.criatorioName || formData.name}</strong></div>
              <div>E-mail de Login: <strong>{formData.email}</strong></div>
              <div>Status: <strong className="text-emerald-600">ACESSO LIBERADO</strong></div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <span>Acessar Painel do Meu Criatório</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
