'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Lock, 
  Star, 
  RotateCw, 
  LogIn, 
  ShieldCheck, 
  Bird, 
  KeyRound,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Clean initial state (no pre-filled email or password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('3505');
  
  // Validation error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate random 4-digit captcha
  const generateCaptcha = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(newCode);
    setCaptchaInput('');
    setCaptchaError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setCaptchaError('');
    setAuthError('');

    // 1. Email validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Por favor, informe seu e-mail.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail) && cleanEmail !== 'admin') {
        setEmailError('Informe um endereço de e-mail válido (ex: seu.email@exemplo.com).');
        isValid = false;
      }
    }

    // 2. Password validation
    if (!password) {
      setPasswordError('Por favor, digite sua senha.');
      isValid = false;
    } else if (password.length < 3) {
      setPasswordError('A senha deve ter pelo menos 3 caracteres.');
      isValid = false;
    }

    // 3. Captcha / Number validation
    const cleanCaptcha = captchaInput.trim();
    if (!cleanCaptcha) {
      setCaptchaError(`Digite o número de 4 dígitos (${captchaCode}) exibido abaixo.`);
      isValid = false;
    } else if (cleanCaptcha !== captchaCode) {
      setCaptchaError(`Número incorreto. Digite exatamente o código exibido: ${captchaCode}.`);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      const success = await login(email, password);
      setIsLoading(false);

      if (!success) {
        setAuthError('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.');
        generateCaptcha();
        return;
      }

      const clean = email.toLowerCase().trim();
      if (
        clean === 'henrique_rocha@live.com' ||
        clean === 'admin@birdpro.com.br' ||
        clean === 'adm@birdpro.com.br' ||
        clean === 'admin'
      ) {
        router.push('/dashboard/admin');
      } else {
        const seller = db.getSellerByEmail(clean);
        if (seller && (seller.isIndependentSeller || seller.password)) {
          router.push('/dashboard/vendedor');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setIsLoading(false);
      setAuthError('Ocorreu um erro ao processar o login. Tente novamente.');
      generateCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      
      {/* Background Soft Avian & Nature Watermark Doodles */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="doodle-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M20 20 Q40 5 60 20 Q40 35 20 20Z" fill="currentColor" />
              <circle cx="80" cy="80" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M90 30 L110 50 M110 30 L90 50" stroke="currentColor" strokeWidth="2" />
              <path d="M10 90 Q30 70 50 90" fill="none" stroke="currentColor" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#doodle-pattern)" />
        </svg>
      </div>

      {/* Main Dual-Column Login Card */}
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row relative z-10 my-auto">
        
        {/* Left Column: Login Form */}
        <div className="p-8 sm:p-10 flex-1 flex flex-col justify-center space-y-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Faça login em sua conta
            </h1>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Field 1: Email */}
            <div className="space-y-1">
              <div className={`flex rounded-lg overflow-hidden border ${emailError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-[#edf3fa]'} focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all`}>
                <div className="w-12 bg-slate-200/60 flex items-center justify-center text-slate-500 shrink-0 border-r border-slate-200">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="seu.email@exemplo.com"
                  autoComplete="email"
                  className="w-full px-3.5 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>
              {emailError && (
                <p className="text-[11px] font-bold text-rose-600 pl-1">
                  * {emailError}
                </p>
              )}
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1">
              <div className={`flex rounded-lg overflow-hidden border ${passwordError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-[#edf3fa]'} focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all`}>
                <div className="w-12 bg-slate-200/60 flex items-center justify-center text-slate-500 shrink-0 border-r border-slate-200">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>
              {passwordError && (
                <p className="text-[11px] font-bold text-rose-600 pl-1">
                  * {passwordError}
                </p>
              )}
            </div>

            {/* Field 3: Captcha Input */}
            <div className="space-y-1">
              <div className={`flex rounded-lg overflow-hidden border ${captchaError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 bg-white'} focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all`}>
                <div className="w-12 bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border-r border-slate-200">
                  <Star className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value);
                    if (captchaError) setCaptchaError('');
                  }}
                  placeholder="Número de confirmação"
                  autoComplete="off"
                  className="w-full px-3.5 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>
              {captchaError && (
                <p className="text-[11px] font-bold text-rose-600 pl-1">
                  * {captchaError}
                </p>
              )}
            </div>

            {/* Stylized Captcha Verification Banner */}
            <div className="flex items-center gap-3 pt-1">
              <div className="relative flex-1 h-14 bg-gradient-to-r from-slate-100 via-blue-50/50 to-emerald-50/50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center select-none shadow-inner">
                {/* Decorative background geometry lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="10" y1="40" x2="280" y2="10" stroke="#00c853" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="20" y1="10" x2="270" y2="45" stroke="#0284c7" strokeWidth="1.5" />
                  <circle cx="30" cy="20" r="5" fill="#00c853" opacity="0.3" />
                  <circle cx="250" cy="35" r="7" fill="#0284c7" opacity="0.3" />
                  <path d="M80 50 L100 10 L130 45" stroke="#64748b" strokeWidth="1" fill="none" />
                </svg>

                {/* 4 Digit Stylized Digits */}
                <span className="font-mono text-3xl font-black tracking-widest text-[#0f4c81] drop-shadow-xs transform -rotate-1 relative z-10">
                  {captchaCode}
                </span>
              </div>

              {/* Refresh Captcha Button */}
              <button
                type="button"
                onClick={generateCaptcha}
                title="Gerar novo código"
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar: Submit & Forgot Password */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <Button
                type="submit"
                isLoading={isLoading}
                className="bg-[#00c853] hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </Button>

              <Link
                href="/recuperar-senha"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Solid Brand Banner */}
        <div className="bg-gradient-to-br from-[#00c853] via-[#047857] to-[#022c22] p-8 sm:p-10 md:w-80 lg:w-96 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
          
          {/* Subtle nature circle glow in background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          <div className="absolute w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          {/* Centered Brand Content */}
          <div className="relative z-10 space-y-6 flex flex-col items-center">
            
            {/* Large Official BirdPro Logo */}
            <div className="p-3 bg-black/20 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
              <Logo variant="light" size="lg" href="/" />
            </div>

            {/* Catchphrase */}
            <p className="text-sm sm:text-base font-medium text-emerald-50 leading-relaxed max-w-xs drop-shadow-sm">
              A melhor plataforma de gestão de pássaros na palma da sua mão!
            </p>

            {/* Quality Seals */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Plataforma Oficial BirdPro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Below Card */}
      <div className="mt-6 flex flex-col items-center gap-1.5 text-xs text-slate-500 relative z-10">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-bold transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Atualizar Página!</span>
        </button>
        <span className="text-[11px] text-slate-400 font-mono">v1.0.98</span>
      </div>
    </div>
  );
}
