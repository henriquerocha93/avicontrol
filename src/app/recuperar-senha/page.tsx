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
  RefreshCw,
  Sparkles,
  Check
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function RecuperarSenhaPage() {
  const router = useRouter();

  // Current Step: 1 = Email, 2 = Verification Code / Identity, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [accountInfo, setAccountInfo] = useState<{
    email: string;
    name: string;
    phoneLast4?: string;
  } | null>(null);

  // Verification code
  const [securityCode, setSecurityCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [phoneLast4Input, setPhoneLast4Input] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate random 6-digit code
  const generateNewCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // STEP 1: Search Account
  const handleSearchAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const clean = identifier.trim();

    if (!clean) {
      setErrorMessage('Por favor, informe seu e-mail ou telefone cadastrado.');
      return;
    }

    setIsLoading(true);

    try {
      const result = db.findAccountForPasswordReset(clean);

      if (!result.found) {
        setErrorMessage('Nenhuma conta encontrada com esses dados. Verifique a digitação ou cadastre-se.');
        setIsLoading(false);
        return;
      }

      const generatedCode = generateNewCode();
      setSecurityCode(generatedCode);
      setAccountInfo({
        email: result.email,
        name: result.name,
        phoneLast4: result.phoneLast4
      });

      setIsLoading(false);
      setStep(2);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Erro ao consultar conta: ' + err.message);
    }
  };

  // STEP 2: Validate Identity (Code OR Phone confirmation)
  const handleValidateIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanCode = inputCode.trim();
    const cleanPhone = phoneLast4Input.trim();

    // Check by 6-digit code
    if (cleanCode && cleanCode === securityCode) {
      setStep(3);
      return;
    }

    // Check by last 4 digits of phone
    if (accountInfo?.phoneLast4 && cleanPhone && cleanPhone === accountInfo.phoneLast4) {
      setStep(3);
      return;
    }

    if (!cleanCode && !cleanPhone) {
      setErrorMessage('Digite o código de verificação de 6 dígitos ou os 4 últimos dígitos do seu telefone.');
      return;
    }

    setErrorMessage('Código de verificação ou dígitos do telefone incorretos. Verifique e tente novamente.');
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
              <span>Conta</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1 text-[11px] font-bold ${step >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>2</span>
              <span>Validação</span>
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
                Digite seu e-mail cadastrado no sistema para redefinir sua senha de acesso de forma autônoma.
              </p>
            </div>

            <form onSubmit={handleSearchAccount} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  E-mail do Criatório / Usuário
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
                Continuar
              </Button>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: CONFIRMAÇÃO DE IDENTIDADE AUTÔNOMA                          */}
        {/* ==================================================================== */}
        {step === 2 && accountInfo && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                Confirmação de Segurança
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Conta localizada: <strong className="text-slate-800">{accountInfo.name}</strong> ({maskEmail(accountInfo.email)}).
              </p>
            </div>

            {/* Display Self-Service Security Code */}
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Seu Código de Segurança Autônomo:
              </span>
              <div className="font-mono font-black text-2xl text-emerald-900 tracking-widest select-all">
                {securityCode}
              </div>
              <p className="text-[10px] text-emerald-700">
                💡 Copie o código acima ou digite abaixo para confirmar sua identidade:
              </p>
            </div>

            <form onSubmit={handleValidateIdentity} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Opção 1: Digite o Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-base font-bold text-slate-800 tracking-widest focus:outline-none focus:border-emerald-500"
                />
              </div>

              {accountInfo.phoneLast4 && (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <label className="block font-bold text-slate-700">
                    Opção 2: Ou confirme os 4 últimos dígitos do seu Celular
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-xs">(**) *****-</span>
                    <input
                      type="text"
                      maxLength={4}
                      value={phoneLast4Input}
                      onChange={(e) => setPhoneLast4Input(e.target.value.replace(/\D/g, ''))}
                      placeholder="****"
                      className="w-24 text-center py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-800 tracking-widest focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-bold h-11 text-xs rounded-xl shadow-md cursor-pointer"
              >
                Validar Identidade
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
                Defina sua nova senha de acesso para <strong>{accountInfo?.email}</strong>.
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
        BIRDPRO • Recuperação Autônoma e Segura de Acesso
      </div>

    </div>
  );
}
