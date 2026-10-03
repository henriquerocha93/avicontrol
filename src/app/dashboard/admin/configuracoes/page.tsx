'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Settings, 
  Save, 
  Globe, 
  CreditCard, 
  Mail, 
  Percent, 
  ShieldCheck, 
  AlertTriangle,
  Check,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { db } from '@/lib/db'
import { GlobalSystemConfig } from '@/types'

export default function AdminConfiguracoesPage() {
  const [config, setConfig] = useState<GlobalSystemConfig>(db.getGlobalConfig())
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [isTestingPagbank, setIsTestingPagbank] = useState(false)
  const [pagbankTestResult, setPagbankTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    setConfig(db.getGlobalConfig())
  }, [])

  const handleTestPagbankConnection = async () => {
    setIsTestingPagbank(true)
    setPagbankTestResult(null)
    try {
      const res = await fetch('/api/payments/pagbank/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.pagbankToken,
          isSandbox: config.pagbankSandbox
        })
      })
      const data = await res.json()
      setPagbankTestResult(data)
    } catch (e: any) {
      setPagbankTestResult({
        success: false,
        message: `Erro na requisição de teste: ${e.message}`
      })
    } finally {
      setIsTestingPagbank(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage('')

    try {
      // Persist to database/localStorage
      db.updateGlobalConfig(config)
      
      // Update local state to ensure synchronization
      const updated = db.getGlobalConfig()
      setConfig({ ...updated })

      setIsSaving(false)
      setSavedSuccess(true)

      // Auto-hide success toast after 4 seconds
      setTimeout(() => {
        setSavedSuccess(false)
      }, 4000)
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err)
      setIsSaving(false)
      setErrorMessage(err.message || 'Ocorreu um erro ao salvar as configurações.')
    }
  }

  return (
    <div className="space-y-6 pb-16 w-full font-sans relative">
      
      {/* ==================================================================== */}
      {/* FLOATING SUCCESS NOTIFICATION TOAST (ALWAYS VISIBLE ON SCREEN)        */}
      {/* ==================================================================== */}
      {savedSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-[#00c853] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-black text-xs">Configurações Salvas com Sucesso!</div>
            <div className="text-[11px] text-emerald-100">
              Todas as credenciais do PagBank, SMTP e regras foram atualizadas.
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setSavedSuccess(false)}
            className="text-white/80 hover:text-white ml-2 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Error Toast */}
      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-rose-600 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 border border-rose-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-black text-xs">Erro ao Salvar!</div>
            <div className="text-[11px] text-rose-100">{errorMessage}</div>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage('')}
            className="text-white/80 hover:text-white ml-2 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <Link href="/dashboard/admin" className="text-[#00c853] hover:underline font-medium">Super Admin</Link>
        <span>/</span>
        <span className="text-slate-400">Configurações Globais</span>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">
              Configurações Globais da Plataforma
            </h1>
            <p className="text-xs text-slate-500">
              Personalize marca, domínio www.birdpro.com.br, comissões de afiliados, gateways de pagamento e SMTP
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Marca & Domínios */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-[#00c853]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Marca &amp; Domínio Oficial
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Nome do Sistema</label>
              <input
                type="text"
                value={config.systemName}
                onChange={(e) => setConfig({ ...config, systemName: e.target.value })}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Slogan / Tagline</label>
              <input
                type="text"
                value={config.systemTagline}
                onChange={(e) => setConfig({ ...config, systemTagline: e.target.value })}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Domínio Oficial</label>
              <input
                type="text"
                value={config.systemDomain}
                onChange={(e) => setConfig({ ...config, systemDomain: e.target.value })}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">URL do Site Público</label>
              <input
                type="text"
                value={config.systemSiteUrl}
                onChange={(e) => setConfig({ ...config, systemSiteUrl: e.target.value })}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Regras de Vendedores & Afiliados */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
            <Percent className="w-4 h-4 text-purple-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Regras de Afiliados &amp; Comissões
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Comissão Padrão Inicial (%)</label>
              <input
                type="number"
                value={config.defaultCommissionPercent}
                onChange={(e) => setConfig({ ...config, defaultCommissionPercent: parseFloat(e.target.value) || 20 })}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Duração do Cookie (Dias)</label>
              <input
                type="number"
                value={config.cookieDurationDays}
                onChange={(e) => setConfig({ ...config, cookieDurationDays: parseInt(e.target.value) || 60 })}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Carência Inicial (Dias)</label>
              <input
                type="number"
                value={config.defaultTrialDays}
                onChange={(e) => setConfig({ ...config, defaultTrialDays: parseInt(e.target.value) || 30 })}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Gateway de Pagamento */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Gateway de Pagamento Automático (PagBank PagSeguro)
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {config.gatewayProvider === 'PAGBANK' ? '⚡ PagBank Ativo' : config.gatewayProvider}
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Provedor de Pagamento</label>
                <select
                  value={config.gatewayProvider || 'PAGBANK'}
                  onChange={(e) => setConfig({ ...config, gatewayProvider: e.target.value as any })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-semibold text-emerald-800 focus:outline-none focus:border-[#00c853]"
                >
                  <option value="PAGBANK">PagBank (PagSeguro) - Recomendado</option>
                  <option value="MERCADOPAGO">Mercado Pago (PIX + Boleto + Cartão)</option>
                  <option value="ASAAS">Asaas (Cobranças &amp; PIX)</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="MANUAL">Manual / Transferência</option>
                </select>
              </div>

              {config.gatewayProvider === 'PAGBANK' ? (
                <>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Token de Acesso / API Token (PagBank PagSeguro)
                    </label>
                    <input
                      type="text"
                      value={config.pagbankToken || ''}
                      onChange={(e) => setConfig({ ...config, pagbankToken: e.target.value })}
                      placeholder="Cole o Token de Acesso gerado no Painel do PagBank/PagSeguro"
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-mono focus:outline-none focus:border-[#00c853]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">E-mail da Conta PagBank</label>
                    <input
                      type="email"
                      value={config.pagbankEmail || ''}
                      onChange={(e) => setConfig({ ...config, pagbankEmail: e.target.value })}
                      placeholder="pagamentos@birdpro.com.br"
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Chave PIX PagBank (Chave do Banco)</label>
                    <input
                      type="text"
                      value={config.pagbankPixKey || ''}
                      onChange={(e) => setConfig({ ...config, pagbankPixKey: e.target.value })}
                      placeholder="Ex: Celular, CNPJ ou E-mail PagBank"
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-mono focus:outline-none focus:border-[#00c853]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 block">Ambiente</label>
                    <select
                      value={config.pagbankSandbox ? 'SANDBOX' : 'PRODUCTION'}
                      onChange={(e) => setConfig({ ...config, pagbankSandbox: e.target.value === 'SANDBOX' })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                    >
                      <option value="PRODUCTION">Produção Oficial (Cobranças Reais)</option>
                      <option value="SANDBOX">Sandbox / Modo de Testes</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[11px] font-medium text-slate-600 block">
                      URL de Webhook para Retorno Automático PagBank
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={config.pagbankWebhookUrl || 'https://www.birdpro.com.br/api/webhooks/pagbank'}
                      className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded font-mono text-slate-600 select-all"
                    />
                    <p className="text-[10px] text-slate-400">
                      Cadastre esta URL nas configurações de Notificações / Webhooks da sua conta PagBank para baixa automática de PIX e Cartão.
                    </p>
                  </div>

                  {/* Test Connection Button & Result */}
                  <div className="sm:col-span-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleTestPagbankConnection}
                      disabled={isTestingPagbank}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      {isTestingPagbank ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testando Conexão com Servidor PagBank...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Testar Autenticação da API PagBank</span>
                        </>
                      )}
                    </button>

                    {pagbankTestResult && (
                      <div className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${
                        pagbankTestResult.success 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        {pagbankTestResult.success ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span>{pagbankTestResult.message}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 block">Access Token / Chave de API</label>
                  <input
                    type="password"
                    value={config.gatewayApiKey || ''}
                    onChange={(e) => setConfig({ ...config, gatewayApiKey: e.target.value })}
                    placeholder="APP_USR-..."
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: SMTP / E-mails */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
            <Mail className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Servidor SMTP / Disparo de E-mails
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-medium text-slate-600 block">Host SMTP</label>
              <input
                type="text"
                value={config.smtpHost || ''}
                onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                placeholder="smtp.birdpro.com.br"
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Porta</label>
              <input
                type="number"
                value={config.smtpPort || 587}
                onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) || 587 })}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">E-mail Remetente</label>
              <input
                type="email"
                value={config.smtpFromEmail || ''}
                onChange={(e) => setConfig({ ...config, smtpFromEmail: e.target.value })}
                placeholder="contato@birdpro.com.br"
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Firebase Cloud Database */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                5. Banco de Dados na Nuvem (Firebase / Firestore)
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Firebase Firestore SDK Ativo
            </span>
          </div>
          <div className="p-5 space-y-4">
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded border border-slate-200">
              <p className="font-semibold text-slate-800 mb-1">Status da Conexão Firebase Cloud:</p>
              <p>
                As credenciais do Firebase são carregadas de variáveis de ambiente (<code className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">NEXT_PUBLIC_FIREBASE_*</code>).
                Ao publicar na Vercel, defina essas variáveis no painel da Vercel para sincronização automática em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* BOTTOM ACTION BAR WITH VISUAL SAVE CONFIRMATION                      */}
        {/* ==================================================================== */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-40">
          <div className="flex items-center gap-2">
            {savedSuccess ? (
              <div className="flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-100/80 px-3.5 py-2 rounded-lg border border-emerald-300 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>✅ Configurações salvas com sucesso!</span>
              </div>
            ) : isSaving ? (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-2 rounded-lg border border-amber-200 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                <span>Gravando alterações no banco...</span>
              </div>
            ) : errorMessage ? (
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-2 rounded-lg border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                Clique no botão ao lado para salvar todas as alterações realizadas.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/dashboard/admin"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Cancelar
            </Link>
            
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2.5 text-white text-xs font-black rounded-lg flex items-center space-x-2 transition shadow-md cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#00c853] hover:bg-[#00b84a]'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Todas as Configurações</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
