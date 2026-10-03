'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Smartphone,
  CreditCard,
  Check
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function RecuperarSenhaPage() {
  const router = useRouter();

  // Current Step: 1 = Email, 2 = Identity Verification, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [accountInfo, setAccountInfo] = useState<{
    email: string;
    name: string;
    hasDocument: boolean;
    hasPhone: boolean;
    phoneHint?: string;
    documentHint?: string;
  } | null>(null);

  // Verification Inputs (Confirmação segura de titularidade)
  const [documentInput, setDocumentInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // STEP 1: Search Account
  const handleSearchAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const clean = identifier.trim();

    if (!clean) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setIsLoading(true);

    try {
      const result = db.findAccountForPasswordReset(clean);

      if (!result.found) {
        setErrorMessage('Nenhuma conta encontrada com este e-mail. Verifique se digitou corretamente.');
        setIsLoading(false);
        return;
      }

      setAccountInfo({
        email: result.email,
        name: result.name,
        hasDocument: result.hasDocument,
        hasPhone: result.hasPhone,
        phoneHint: result.phoneHint,
        documentHint: result.documentHint
      });

      setDocumentInput('');
      setPhoneInput('');
      setIsLoading(false);
      setStep(2);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Erro ao consultar conta: ' + err.message);
    }
  };

  // STEP 2: Validate Identity (CPF/CNPJ OR Full Phone - ONLY Known by Real Owner)
  const handleValidateIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!accountInfo?.email) {
      setErrorMessage('Sessão expirada. Volte e informe seu e-mail novamente.');
      return;
    }

    const cleanDoc = documentInput.trim();
    const cleanPhone = phoneInput.trim();

    if (!cleanDoc && !cleanPhone) {
      setErrorMessage('Por favor, informe o CPF/CNPJ ou o Celular/WhatsApp cadastrado para comprovar sua identidade.');
      return;
    }

    setIsLoading(true);

    try {
      const isValid = db.validateAccountIdentity(accountInfo.email, {
        cpfOrCnpj: cleanDoc,
        phone: cleanPhone
      });

      setIsLoading(false);

      if (isValid) {
        setStep(3);
      } else {
        setErrorMessage('Os dados informados (CPF/CNPJ ou Celular) não coincidem com o cadastro desta conta. Por segurança, a redefinição só é permitida ao titular.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Erro ao validar identidade: ' + err.message);
    }
  };

  // STEP 3: Save New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    setIsLoading(true);

    try {
      if (!accountInfo?.email) {
        throw new Error('E-mail não identificado.');
      }

      const updated = db.resetPasswordByEmail(accountInfo.email, newPassword);

      if (!updated) {
        throw new Error('Não foi possível salvar a nova senha no momento.');
      }

      // Also update saved credentials if exists
      try {
        if (typeof window !== 'undefined') {
          const savedCreds = localStorage.getItem('birdpro_saved_credentials');
          if (savedCreds) {
            localStorage.setItem('birdpro_saved_credentials', JSON.stringify({
              email: accountInfo.email,
              password: newPassword
            }));
          }
        }
      } catch (e) {
        // Ignore
      }

      setIsLoading(false);
      setStep(4);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erro ao redefinir senha.');
    }
  };

  // Mask email for privacy (e.g. c***@gmail.com)
  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    if (!domain) return email;
    const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user}***`;
    return `${maskedUser}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col items-center justify-between p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex justify-between items-center py-4">
        <Logo variant="dark" size="sm" href="/" />
        <Link 
          href="/login" 
          className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6 my-auto relative z-10 animate-in fade-in">
        
        {/* Step Progress Pills */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 pb-2 border-b border-slate-100">
            <div className={`flex items-center gap-1 text-[11px] font-bold ${step >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>1</span>
              <span>Identificação</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1 text-[11px] font-bold ${step >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>2</span>
              <span>Segurança</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1 text-[11px] font-bold ${step >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>3</span>
              <span>Nova Senha</span>
            </div>
          </div>
        )}

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 1: IDENTIFICAÇÃO DA CONTA                                       */}
        {/* ==================================================================== */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                Redefinir Senha
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Digite o e-mail cadastrado na sua conta para iniciar a redefinição de senha segura.
              </p>
            </div>

            <form onSubmit={handleSearchAccount} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  E-mail Cadastrado
                </label>
                <div className="relative flex rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <div className="w-10 flex items-center justify-center text-slate-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full py-2.5 pr-3 bg-transparent text-slate-800 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-bold h-11 text-xs rounded-xl shadow-md cursor-pointer"
              >
                Avançar
              </Button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: CONFIRMAÇÃO DE IDENTIDADE SEGURA (SEM CÓDIGO VAZADO EM TELA)  */}
        {/* ==================================================================== */}
        {step === 2 && accountInfo && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                Verificação de Titularidade
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Conta: <strong className="text-slate-800">{accountInfo.name}</strong> ({maskEmail(accountInfo.email)})
              </p>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-blue-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Proteção de Dados &amp; Antifraude</span>
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Para comprovar que você é o verdadeiro titular da conta, confirme <strong>um dos dados cadastrados</strong> abaixo:
              </p>
            </div>

            <form onSubmit={handleValidateIdentity} className="space-y-3.5 text-xs">
              
              {/* Option A: CPF / CNPJ */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Opção 1: Digite seu CPF ou CNPJ cadastrado
                </label>
                <div className="relative flex rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <div className="w-10 flex items-center justify-center text-slate-400 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={documentInput}
                    onChange={(e) => setDocumentInput(e.target.value)}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    className="w-full py-2.5 pr-3 bg-transparent text-slate-800 text-xs font-mono font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 my-1">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400">ou</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Option B: Telefone / WhatsApp Completo */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Opção 2: Digite seu Celular / WhatsApp completo (com DDD)
                </label>
                <div className="relative flex rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <div className="w-10 flex items-center justify-center text-slate-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full py-2.5 pr-3 bg-transparent text-slate-800 text-xs font-mono font-medium focus:outline-none"
                  />
                </div>
                {accountInfo.phoneHint && (
                  <p className="text-[10px] text-slate-400 pl-1">
                    Dica: final {accountInfo.phoneHint.slice(-5)}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-2 bg-[#00c853] hover:bg-emerald-600 text-white font-bold h-11 text-xs rounded-xl shadow-md cursor-pointer"
              >
                Comprovar Titularidade
              </Button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: DIGITAR NOVA SENHA                                           */}
        {/* ==================================================================== */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                Criar Nova Senha
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Identidade confirmada! Defina sua nova senha de acesso para <strong>{accountInfo?.email}</strong>.
              </p>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Nova Senha (mínimo 4 caracteres)
                </label>
                <div className="relative flex rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <div className="w-10 flex items-center justify-center text-slate-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                    className="w-full py-2.5 pr-10 bg-transparent text-slate-800 text-xs font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Confirmar Nova Senha
                </label>
                <div className="relative flex rounded-xl border border-slate-300 overflow-hidden bg-slate-50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <div className="w-10 flex items-center justify-center text-slate-400 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full py-2.5 pr-10 bg-transparent text-slate-800 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-bold h-11 text-xs rounded-xl shadow-md cursor-pointer"
              >
                Salvar Nova Senha
              </Button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: SUCESSO TOTAL                                                */}
        {/* ==================================================================== */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00c853] flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                🎉 Senha Redefinida com Sucesso!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sua nova senha já está ativa. Você já pode fazer login na sua conta com suas novas credenciais.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/login" className="block w-full">
                <Button className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-bold h-11 text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Fazer Login Agora</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Footer Below Card */}
      <div className="py-4 text-center text-xs text-slate-400">
        BIRDPRO • Recuperação Segura com Verificação de Titularidade
      </div>

    </div>
  );
}
