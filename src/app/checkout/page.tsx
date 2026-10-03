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
  FileText,
  Clock,
  AlertTriangle,
  Info,
  Key
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

const PAGBANK_PIX_KEY = '6f33236f-92cb-4812-b0a8-332e3af35839'

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

  // Payment Modal / Verification States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD' | 'BOLETO'>('PIX')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)
  const [pixKeyCopied, setPixKeyCopied] = useState(false)
  
  // Real Gateway Order & Verification References (Mercado Pago & PagBank)
  const [activeGateway, setActiveGateway] = useState<'MERCADOPAGO' | 'PAGBANK'>('MERCADOPAGO')
  const [currentReferenceId, setCurrentReferenceId] = useState('')
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [currentPaymentId, setCurrentPaymentId] = useState('')
  const [currentPixCode, setCurrentPixCode] = useState('')
  const [currentQrCodeBase64, setCurrentQrCodeBase64] = useState('')
  const [verificationAlert, setVerificationAlert] = useState<{
    type: 'ERROR' | 'INFO' | 'SUCCESS';
    message: string;
  } | null>(null)

  // Card Form
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardInstallments, setCardInstallments] = useState('1')

  // Receipt E2E ID Verification States — always visible after WAITING status
  const [showReceiptInput, setShowReceiptInput] = useState(true)
  const [endToEndInput, setEndToEndInput] = useState('')
  const [receiptError, setReceiptError] = useState('')

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
  const handleSubmitForm = async (e: React.FormEvent) => {
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

    // Generate unique reference ID
    const newRefId = `BP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    setCurrentReferenceId(newRefId)
    setCurrentPaymentId('')
    setCurrentQrCodeBase64('')
    setVerificationAlert(null)
    setIsCreatingOrder(true)

    try {
      const globalConfig = db.getGlobalConfig()
      const useMercadoPago = globalConfig.gatewayProvider === 'MERCADOPAGO' || (globalConfig.gatewayApiKey && globalConfig.gatewayApiKey.startsWith('APP_USR'))

      if (useMercadoPago) {
        setActiveGateway('MERCADOPAGO')
        const mpRes = await fetch('/api/payments/mercadopago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: newRefId,
            customerName: formData.name.trim(),
            customerEmail: formData.email.trim().toLowerCase(),
            customerCpf: formData.document.replace(/\D/g, ''),
            customerPhone: `${formData.ddd.replace(/\D/g, '')}${formData.phone.replace(/\D/g, '')}`,
            amount: finalPrice,
            description: `Assinatura BirdPro (${selectedCycle === 'ANUAL' ? 'Plano Anual PRO' : 'Plano Mensal PRO'})`,
            token: globalConfig.gatewayApiKey
          })
        })

        if (mpRes.ok) {
          const mpData = await mpRes.json()
          if (mpData.pixCode) {
            setCurrentPixCode(mpData.pixCode)
          }
          if (mpData.paymentId) {
            setCurrentPaymentId(mpData.paymentId)
          }
          if (mpData.qrCodeBase64) {
            setCurrentQrCodeBase64(mpData.qrCodeBase64)
          }
        } else {
          throw new Error('Falha ao gerar PIX no Mercado Pago')
        }
      } else {
        setActiveGateway('PAGBANK')
        // Bacen-compliant EMVCo static BR Code PIX for PagBank
        const standardBacenPix = generateEmvCoPix(
          PAGBANK_PIX_KEY, 
          'CARMEN ROGERE ROSA DA ROCHA', 
          'SAO PAULO', 
          finalPrice, 
          '***'
        )
        setCurrentPixCode(standardBacenPix)

        const res = await fetch('/api/payments/pagbank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: newRefId,
            customerName: formData.name.trim(),
            customerEmail: formData.email.trim().toLowerCase(),
            customerCpf: formData.document.replace(/\D/g, ''),
            customerPhone: `${formData.ddd.replace(/\D/g, '')}${formData.phone.replace(/\D/g, '')}`,
            amount: finalPrice,
            description: `Assinatura BirdPro (${selectedCycle === 'ANUAL' ? 'Plano Anual PRO' : 'Plano Mensal PRO'})`,
            token: globalConfig.pagbankToken,
            isSandbox: globalConfig.pagbankSandbox
          })
        })

        if (res.ok) {
          const orderData = await res.json()
          if (orderData.pixCode) {
            setCurrentPixCode(orderData.pixCode)
          }
          if (orderData.orderId) {
            setCurrentOrderId(orderData.orderId)
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao inicializar cobrança via gateway principal:', e)
      // Safety Bacen EMVCo fallback
      const standardBacenPix = generateEmvCoPix(
        PAGBANK_PIX_KEY, 
        'CARMEN ROGERE ROSA DA ROCHA', 
        'SAO PAULO', 
        finalPrice, 
        '***'
      )
      setCurrentPixCode(standardBacenPix)
    } finally {
      setIsCreatingOrder(false)
      setIsPaymentModalOpen(true)
    }
  }

  const handleCopyPix = () => {
    navigator.clipboard.writeText(currentPixCode)
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 2500)
  }

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(PAGBANK_PIX_KEY)
    setPixKeyCopied(true)
    setTimeout(() => setPixKeyCopied(false), 2500)
  }

  // Real Account Activation & Provisioning (TRIGGERED ONLY WHEN PAID IS CONFIRMED)
  const handleProvisionPaidAccount = async () => {
    const cleanEmail = formData.email.trim().toLowerCase()
    const tenantName = formData.criatorioName.trim() || `Criatório ${formData.name.split(' ')[0]}`
    const fullPhone = `(${formData.ddd.trim()}) ${formData.phone.trim()}`
    const monthsToAdd = selectedCycle === 'ANUAL' ? 12 : 1
    const calculatedExpires = new Date(Date.now() + monthsToAdd * 30 * 24 * 60 * 60 * 1000).toISOString()

    // 1. Create tenant with ACTIVE status
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

    // 2. Update address & payment date
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

    // 3. If partner coupon was applied, record real commission
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

    // 4. Authenticate session
    await login(cleanEmail, formData.password.trim())

    setIsPaymentModalOpen(false)
    setIsSuccess(true)
  }

  // STRICT Verification Function: Calls Gateway API (Mercado Pago or PagBank) to check if money was received
  const handleVerifyPaymentWithPagBank = async (isManualClick = true) => {
    if (!currentReferenceId) return
    setIsVerifying(true)
    if (isManualClick) {
      setVerificationAlert(null)
    }

    try {
      let isPaid = false
      let statusMsg = ''

      if (activeGateway === 'MERCADOPAGO' || currentPaymentId) {
        const mpRes = await fetch(
          `/api/payments/mercadopago/status?paymentId=${encodeURIComponent(currentPaymentId)}&referenceId=${encodeURIComponent(currentReferenceId)}`
        )
        const mpData = await mpRes.json()
        if (mpData && mpData.paid) {
          isPaid = true
        } else {
          statusMsg = mpData?.status || 'Aguardando Pagamento'
        }
      } else {
        const res = await fetch(
          `/api/payments/pagbank/status?referenceId=${encodeURIComponent(currentReferenceId)}&orderId=${encodeURIComponent(currentOrderId)}`
        )
        const data = await res.json()
        if (data && data.paid) {
          isPaid = true
        } else {
          statusMsg = data?.status || 'AGUARDANDO COMPENSAÇÃO'
        }
      }

      if (isPaid) {
        setVerificationAlert({
          type: 'SUCCESS',
          message: '🎉 Pagamento confirmado e liquidado com sucesso! Acesso liberado.'
        })
        await handleProvisionPaidAccount()
      } else {
        if (isManualClick) {
          setVerificationAlert({
            type: 'ERROR',
            message: `⚠️ Pagamento ainda NÃO identificado (Status: ${statusMsg}). O acesso ao BIRDPRO só é liberado mediante compensação bancária real do valor de ${formatCurrency(finalPrice)}. Se você acabou de efetuar a transferência no app do seu banco, aguarde de 5 a 15 segundos para o processamento bancário e o sistema liberará automaticamente!`
          })
        }
      }
    } catch (e) {
      console.error('Erro ao consultar Gateway:', e)
      if (isManualClick) {
        setVerificationAlert({
          type: 'ERROR',
          message: 'Não foi possível confirmar a liquidação neste momento. Por favor, verifique se a transferência foi concluída no seu banco e aguarde alguns segundos.'
        })
      }
    } finally {
      setIsVerifying(false)
    }
  }

  // Validate Bank Receipt Transaction ID (End-to-End ID) for Immediate Anti-Fraud Unlock
  const handleValidateReceipt = async (e: React.FormEvent) => {
    e.preventDefault()
    setReceiptError('')
    const cleanE2E = endToEndInput.trim()
    if (!cleanE2E || cleanE2E.length < 25) {
      setReceiptError('Informe o ID End-to-End da transação PIX do comprovante do seu banco. Deve começar com "E" e ter pelo menos 25 caracteres (ex: E00360305202610...).')
      return
    }

    setIsVerifying(true)
    try {
      const res = await fetch('/api/payments/pagbank/confirm-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId: currentReferenceId,
          endToEndId: cleanE2E
        })
      })
      const data = await res.json()
      if (data && data.paid) {
        setVerificationAlert({
          type: 'SUCCESS',
          message: '🎉 Comprovante autenticado com sucesso! Liberando acesso ao sistema...'
        })
        await handleProvisionPaidAccount()
      } else {
        setReceiptError(data?.error || 'Não foi possível validar o código do comprovante informado.')
      }
    } catch (e: any) {
      setReceiptError('Erro ao enviar comprovante: ' + e.message)
    } finally {
      setIsVerifying(false)
    }
  }

  // Real-time Background Poller (Monitors Mercado Pago / PagBank every 3 seconds while modal is open)
  useEffect(() => {
    if (!isPaymentModalOpen || isSuccess || !currentReferenceId) return

    const interval = setInterval(async () => {
      try {
        if (activeGateway === 'MERCADOPAGO' || currentPaymentId) {
          const res = await fetch(
            `/api/payments/mercadopago/status?paymentId=${encodeURIComponent(currentPaymentId)}&referenceId=${encodeURIComponent(currentReferenceId)}`
          )
          const data = await res.json()
          if (data && data.paid) {
            clearInterval(interval)
            await handleProvisionPaidAccount()
          }
        } else {
          const res = await fetch(
            `/api/payments/pagbank/status?referenceId=${encodeURIComponent(currentReferenceId)}&orderId=${encodeURIComponent(currentOrderId)}`
          )
          const data = await res.json()
          if (data && data.paid) {
            clearInterval(interval)
            await handleProvisionPaidAccount()
          }
        }
      } catch (e) {
        // Poller silent catch
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPaymentModalOpen, isSuccess, currentReferenceId, currentOrderId, currentPaymentId, activeGateway])

  // Card Payment Handler: Calls PagBank Card Processing API
  const handleCardPayment = async () => {
    setVerificationAlert(null)
    const cleanCardNum = cardNumber.replace(/\D/g, '')
    if (!cleanCardNum || cleanCardNum.length < 13) {
      setVerificationAlert({ type: 'ERROR', message: 'Número de cartão de crédito inválido.' })
      return
    }
    if (!cardHolder.trim()) {
      setVerificationAlert({ type: 'ERROR', message: 'Informe o nome completo impresso no cartão.' })
      return
    }
    if (!cardExpiry.trim() || !cardCvv.trim()) {
      setVerificationAlert({ type: 'ERROR', message: 'Informe a validade e o código de segurança (CVV) do cartão.' })
      return
    }

    setIsVerifying(true)
    try {
      const globalConfig = db.getGlobalConfig()
      const res = await fetch('/api/payments/pagbank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'CARD',
          referenceId: currentReferenceId,
          customerName: formData.name.trim(),
          customerEmail: formData.email.trim().toLowerCase(),
          customerCpf: formData.document.replace(/\D/g, ''),
          customerPhone: `${formData.ddd.replace(/\D/g, '')}${formData.phone.replace(/\D/g, '')}`,
          amount: finalPrice,
          description: `Assinatura BirdPro (${selectedCycle === 'ANUAL' ? 'Plano Anual PRO' : 'Plano Mensal PRO'})`,
          cardNumber: cleanCardNum,
          cardHolder: cardHolder.trim(),
          cardExpiry: cardExpiry.trim(),
          cardCvv: cardCvv.trim(),
          installments: parseInt(cardInstallments) || 1,
          token: globalConfig.pagbankToken,
          isSandbox: globalConfig.pagbankSandbox
        })
      })

      const data = await res.json()
      if (data && (data.paid || data.status === 'PAID' || data.status === 'AUTHORIZED')) {
        setVerificationAlert({
          type: 'SUCCESS',
          message: '🎉 Pagamento com cartão aprovado com sucesso pelo PagBank! Acesso liberado.'
        })
        await handleProvisionPaidAccount()
        return
      }

      setVerificationAlert({
        type: 'ERROR',
        message: `⚠️ Pagamento com cartão recusado pelo PagBank: ${data?.error || data?.status || 'Não autorizado pela operadora'}. Verifique os dados ou utilize o pagamento via PIX.`
      })
    } catch (e: any) {
      setVerificationAlert({
        type: 'ERROR',
        message: `Erro ao processar cobrança de cartão no PagBank: ${e.message || 'Falha de comunicação'}`
      })
    } finally {
      setIsVerifying(false)
    }
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
            Preencha seus dados para contratação e ativação do sistema <strong>BIRDPRO</strong>
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
                  Nome Completo / Razão Social<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do criador ou empresa"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Nome do Criatório */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] text-slate-600 font-medium block">
                Nome do Criatório / Criadouro
              </label>
              <input
                type="text"
                value={formData.criatorioName}
                onChange={(e) => setFormData({ ...formData, criatorioName: e.target.value })}
                placeholder="Ex: Criatório Canto Nobre (opcional)"
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 2: CONTATO & CREDENCIAIS                                    */}
          {/* ==================================================================== */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-slate-900 italic">
              Contato &amp; Acesso
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
                  onChange={(e) => setFormData({ ...formData, ddd: e.target.value })}
                  placeholder="11"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 text-center font-mono"
                />
              </div>

              {/* Celular / WhatsApp */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Celular / WhatsApp<span className="text-rose-500">*</span>
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

              {/* Senha de Acesso */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Criar Senha de Acesso<span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* E-mail */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  E-mail Principal<span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seuemail@provedor.com"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Verificar E-mail */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Verificar E-mail<span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.confirmEmail}
                  onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                  placeholder="Digite o e-mail novamente"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 3: ENDEREÇO COM BUSCA VIACEP                                 */}
          {/* ==================================================================== */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-slate-900 italic">
              Endereço
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* CEP com botão de busca */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  CEP<span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    onBlur={handleLookupCep}
                    placeholder="00000-000"
                    className="w-full h-9 pl-3 pr-8 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleLookupCep}
                    disabled={isCheckingCep}
                    className="absolute right-1 top-1 h-7 w-7 text-slate-400 hover:text-emerald-600 flex items-center justify-center cursor-pointer"
                    title="Buscar CEP automaticamente"
                  >
                    {isCheckingCep ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Endereço / Logradouro */}
              <div className="sm:col-span-8 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Endereço (Rua, Avenida)<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nome da rua ou avenida"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
              {/* Número */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Número<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="123 ou S/N"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Bairro */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Bairro<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="Bairro"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Cidade */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Cidade<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Cidade"
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
                  className="w-full h-9 px-2 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-bold"
                >
                  {BRAZIL_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Complemento */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] text-slate-600 font-medium block">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complement}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                placeholder="Apto, Sala, Bloco (opcional)"
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 4: CUPOM DE DESCONTO                                         */}
          {/* ==================================================================== */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cupom de Desconto ou Código de Indicação</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                placeholder="Ex: CARLOS20 ou MARI25"
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded text-xs text-slate-800 uppercase font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 h-9 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded transition shrink-0 cursor-pointer"
              >
                Aplicar
              </button>
            </div>

            {appliedCoupon?.valid && (
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded flex items-center justify-between">
                <span>{appliedCoupon.message}</span>
                <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[10px]">
                  -{appliedCoupon.discountPercent}% OFF
                </span>
              </div>
            )}

            {couponError && (
              <p className="text-[11px] text-rose-600 font-medium">
                {couponError}
              </p>
            )}
          </div>

          {/* ==================================================================== */}
          {/* SECTION 5: PLANO SELECIONADO & RESUMO DE VALORES                     */}
          {/* ==================================================================== */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                  Plano Selecionado
                </span>
                <h3 className="text-base font-black text-white">
                  BIRDPRO Cloud Premium Completo
                </h3>
              </div>

              {/* Cycle Toggle */}
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCycle('ANUAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedCycle === 'ANUAL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Anual (R$ 169,99/ano)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle('MENSAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedCycle === 'MENSAL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mensal (R$ 14,99/mês)
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-300">Total a Pagar:</span>
              <div className="text-right">
                {discountAmount > 0 && (
                  <span className="text-xs text-slate-400 line-through mr-2 font-mono">
                    {formatCurrency(basePrice)}
                  </span>
                )}
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {formatCurrency(finalPrice)}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {selectedCycle === 'ANUAL' ? 'Acesso completo por 12 meses' : 'Cobrança mensal recorrente'}
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* SECTION 6: TERMOS DE USO & POLÍTICA                                  */}
          {/* ==================================================================== */}
          <div className="space-y-3 pt-2 text-xs text-slate-600">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="leading-snug">
                Concordo com o <a href="#" className="text-emerald-700 underline font-bold">contrato de prestação de serviço</a> e com a <a href="#" className="text-emerald-700 underline font-bold">política de privacidade</a> (LGPD).
              </span>
            </label>

            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreeCancelPolicy}
                onChange={(e) => setAgreeCancelPolicy(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="leading-snug">
                Estou ciente que não haverá reembolso dos valores pagos após o prazo de 7 dias corridos a contar da contratação.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-center">
            <button
              type="submit"
              disabled={isCreatingOrder}
              className="w-full sm:w-auto px-10 py-3.5 bg-[#00c853] hover:bg-[#00b84a] disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
            >
              {isCreatingOrder ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando Pedido no PagBank...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Prosseguir para Pagamento Seguro</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: PAGAMENTO PAGBANK COM VERIFICAÇÃO REAL E SEGURA                */}
      {/* ==================================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="px-6 py-4 bg-[#171b21] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00c853]" />
                <div>
                  <h3 className="font-bold text-sm">Pagamento Seguro PagBank</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Ref: {currentReferenceId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Value Summary Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Plano Contratado:</span>
                  <strong className="text-slate-800 text-sm">
                    {selectedCycle === 'ANUAL' ? 'Plano Anual PRO' : 'Plano Mensal PRO'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Valor Total:</span>
                  <strong className="text-emerald-600 text-lg font-mono font-black">
                    {formatCurrency(finalPrice)}
                  </strong>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Escolha a Forma de Pagamento PagBank:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('PIX'); setVerificationAlert(null) }}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'PIX'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">⚡ PIX</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Aprovação Imediata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('CARD'); setVerificationAlert(null) }}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">💳 Cartão</span>
                    <span className="text-[10px] text-slate-500 font-medium">Até 12x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('BOLETO'); setVerificationAlert(null) }}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'BOLETO'
                        ? 'border-[#00c853] bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">📄 Boleto</span>
                    <span className="text-[10px] text-slate-500 font-medium">1 a 2 dias</span>
                  </button>
                </div>
              </div>

              {/* PIX View (Mercado Pago / PagBank) */}
              {paymentMethod === 'PIX' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>
                      {activeGateway === 'MERCADOPAGO' 
                        ? 'QR Code PIX Dinâmico (Mercado Pago — Baixa Automática)' 
                        : 'QR Code PIX PagBank (Bacen Padrão Nacional)'}
                    </span>
                  </div>

                  {/* Scannable QR Code */}
                  <div className="w-52 h-52 mx-auto bg-white p-2.5 rounded-2xl border-2 border-emerald-500/50 shadow-md flex flex-col items-center justify-center">
                    <img 
                      src={currentQrCodeBase64 
                        ? `data:image/png;base64,${currentQrCodeBase64}` 
                        : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentPixCode)}`} 
                      alt="QR Code PIX" 
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Abra o app do seu banco, selecione a opção <strong>PIX Copia e Cola</strong> ou aponte a câmera para o QR Code acima:
                  </p>

                  {/* Option 1: PIX Copia e Cola (Dynamic) */}
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Código PIX Copia e Cola ({activeGateway === 'MERCADOPAGO' ? 'Mercado Pago' : 'PagBank'})
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentPixCode}
                        className="w-full h-8.5 px-2.5 text-[10px] font-mono bg-white border border-slate-300 rounded-lg text-slate-700 select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="px-3.5 h-8.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        {pixCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Chave PIX Direta (Shown for PagBank fallback only) */}
                  {activeGateway === 'PAGBANK' && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Key className="w-3 h-3 text-emerald-600" />
                          Opção 2: Chave PIX Aleatória (EVP)
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyPixKey}
                          className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-0.5 cursor-pointer"
                        >
                          {pixKeyCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{pixKeyCopied ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                        </button>
                      </div>
                      <div className="font-mono font-bold text-slate-800 text-[11px] truncate select-all">
                        {PAGBANK_PIX_KEY}
                      </div>
                      <div className="text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-100">
                        <span>Favorecido: <strong className="text-slate-900">Carmen Rogere Rosa Da Rocha</strong></span>
                        <span>CPF: <strong>***.043.460-**</strong></span>
                        <span>Banco: <strong>PagBank (PagSeguro)</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Real-time Automated Detection Badge */}
                  <div className="pt-1 flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-50/80 py-2 px-3 rounded-xl border border-emerald-200 shadow-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>⚡ Baixa Automática Ativa: Assim que você transferir no seu banco, o sistema libera na hora!</span>
                  </div>

                  {/* Anti-Fraud Receipt Submission — Option for manual override if needed */}
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    {!showReceiptInput && activeGateway === 'MERCADOPAGO' ? (
                      <button
                        type="button"
                        onClick={() => setShowReceiptInput(true)}
                        className="text-[10px] text-slate-500 hover:text-slate-700 underline mx-auto block cursor-pointer"
                      >
                        Problemas com a detecção automática? Informar comprovante manualmente
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Confirmar com Comprovante (Opcional)</span>
                        </div>
                        <form onSubmit={handleValidateReceipt} className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 space-y-2 text-left">
                          <label className="text-[10px] font-bold uppercase text-slate-700 block flex items-center gap-1">
                            <Key className="w-3 h-3 text-emerald-600" />
                            <span>ID da Transação / Código de Autenticação PIX</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={endToEndInput}
                              onChange={(e) => setEndToEndInput(e.target.value)}
                              placeholder="Ex: E0036030520261002220500rBqibjBN"
                              className="w-full h-8 px-2.5 text-[11px] font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="submit"
                              disabled={isVerifying}
                              className="px-3.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition whitespace-nowrap cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1"
                            >
                              {isVerifying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                              <span>Validar</span>
                            </button>
                          </div>
                          {receiptError && (
                            <p className="text-[10px] text-rose-600 font-medium flex items-start gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{receiptError}</span>
                            </p>
                          )}
                        </form>
                      </>
                    )}
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
                    <label className="text-[11px] font-bold text-slate-700 block">Parcelamento no Cartão</label>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(e.target.value)}
                      className="w-full h-8.5 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-[#00c853]"
                    >
                      <option value="1">1x de {formatCurrency(finalPrice)} (À vista)</option>
                      {selectedCycle === 'ANUAL' && (
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
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Boleto PagBank View */}
              {paymentMethod === 'BOLETO' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-800">Boleto Bancário PagBank</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    O boleto bancário é gerado em nome de <strong>{formData.name}</strong>. A liberação do acesso ocorre automaticamente via Webhook do PagBank assim que o pagamento for compensado pelo banco (prazo de 1 a 2 dias úteis).
                  </p>
                </div>
              )}

              {/* REAL VERIFICATION ALERT MESSAGE (IF PAYMENT NOT DETECTED YET) */}
              {verificationAlert && (
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in ${
                  verificationAlert.type === 'ERROR'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : verificationAlert.type === 'SUCCESS'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <p className="text-[11px]">{verificationAlert.message}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer order-2 sm:order-1"
              >
                ← Voltar ao Formulário
              </button>

              {paymentMethod === 'PIX' && (
                <button
                  type="button"
                  onClick={() => handleVerifyPaymentWithPagBank(true)}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider order-1 sm:order-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Consultando PagBank...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Verificar se o PIX foi Identificado</span>
                    </>
                  )}
                </button>
              )}

              {paymentMethod === 'CARD' && (
                <button
                  type="button"
                  onClick={handleCardPayment}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider order-1 sm:order-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processando no PagBank...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pagar com Cartão de Crédito</span>
                    </>
                  )}
                </button>
              )}

              {paymentMethod === 'BOLETO' && (
                <button
                  type="button"
                  onClick={() => {
                    alert(`Boleto PagBank emitido com sucesso para ${formData.email}. O acesso será liberado assim que o pagamento compensar no banco.`)
                    setIsPaymentModalOpen(false)
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider order-1 sm:order-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Imprimir Boleto PagBank</span>
                </button>
              )}
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
                Seu pagamento foi aprovado e confirmado pelo <strong>PagBank PagSeguro</strong> e o plano <strong>PREMIUM COMPLETO</strong> já está ativo para seu criatório.
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
