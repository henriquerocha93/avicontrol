'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bird, 
  CircleDot, 
  Grid3X3, 
  Heart, 
  Award, 
  Activity, 
  FileText, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  X,
  Menu,
  ArrowRight, 
  PlayCircle,
  ExternalLink, 
  ChevronRight, 
  TrendingUp, 
  Download, 
  Users, 
  Smartphone,
  Leaf,
  Trees,
  Sprout,
  Compass,
  Feather,
  Star,
  Zap,
  Cloud,
  Lock,
  Calendar,
  Layers,
  CheckCircle2,
  Quote,
  Clock,
  Laptop
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { DynamicDaytimeAmbience } from '@/components/landing/dynamic-daytime-ambience';
import { LiveBreedingStatus } from '@/components/landing/live-breeding-status';
import { DailyProofsSection } from '@/components/landing/daily-proofs-section';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const features = [
    {
      title: 'Genealogia & Pedigree A4 Oficial',
      desc: 'Árvore genealógica de até 5 gerações com cálculo automático de consanguinidade, histórico genético e emissão de certificados oficiais para impressão.',
      icon: Award,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Manejo Reprodutivo & Ninhos',
      desc: 'Controle de pareamento de casais, ovoscopia com visualização de fertilidade, contagem regressiva de eclosão e registro de novos filhotes.',
      icon: Heart,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    {
      title: 'Importação SISPASS em 5 Segundos',
      desc: 'Leitura instantânea de PDF do IBAMA e planilhas, controle de séries FOB/SISPASS, rastreamento de anilhas e reservas para choco.',
      icon: CircleDot,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      title: 'Gaiolas Visuais & QR Code',
      desc: 'Visualização da lotação de cada viveiro, movimentação rápida de aves e etiquetas com QR Code para leitura física direta no criatório.',
      icon: Grid3X3,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      title: 'Prontuário Sanitário & Farmácia',
      desc: 'Controle de sintomas, diagnósticos veterinários, posologia de medicamentos e alertas de administração de horários com push no celular.',
      icon: Activity,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      title: 'Sexagem DNA & Genotipagem',
      desc: 'Anexação de laudos laboratoriais, identificação de fatores genéticos, mutações, linhagens campeãs e genes recessivos.',
      icon: Sparkles,
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
    }
  ];

  // Tabela Comparativa: BIRDPRO vs Sistemas Legados e Planilhas
  const comparisonItems = [
    {
      feature: 'Tecnologia & Acesso',
      birdpro: '100% em Nuvem — Acesse no Celular, Tablet ou PC em qualquer lugar',
      legacy: 'Preso a 1 computador antigo; se a máquina quebrar, perde tudo',
      isAdvantage: true
    },
    {
      feature: 'Importação do SISPASS / IBAMA',
      birdpro: 'Importação Automática em 5 segundos lendo o PDF do relatório oficial',
      legacy: 'Digitação manual e exaustiva de cada anilha e ave, uma por uma',
      isAdvantage: true
    },
    {
      feature: 'Árvore Genealógica & Pedigree',
      birdpro: 'Árvore visual interativa de 3 a 5 gerações com cálculo de consanguinidade',
      legacy: 'Listas estáticas em preto e branco ou relatórios simples sem cálculo genético',
      isAdvantage: true
    },
    {
      feature: 'QR Code de Autenticidade',
      birdpro: 'QR Code exclusivo por ave com página pública oficial de verificação',
      legacy: 'Sem validação pública digital ou laudos modernos com verificação',
      isAdvantage: true
    },
    {
      feature: 'Alertas de Choco & Anilhamento',
      birdpro: 'Notificações Push com som e aviso no 4º a 7º dia exato no seu celular',
      legacy: 'Sem alertas inteligentes, dependendo de anotações soltas em cadernos',
      isAdvantage: true
    },
    {
      feature: 'Política de Preço & Cobrança',
      birdpro: 'Apenas R$ 14,99/mês sem pegadinhas e com 100% dos recursos liberados',
      legacy: 'Cobranças adicionais por novas versões, módulos extras e limites artificiais',
      isAdvantage: true
    },
    {
      feature: 'Atualizações & Backup',
      birdpro: 'Atualizações contínuas semanais e backup redundante em nuvem',
      legacy: 'Programas descontinuados, sem suporte técnico ágil e risco constante de perda',
      isAdvantage: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#070e0b] text-slate-100 selection:bg-[#00c853] selection:text-white relative overflow-x-hidden font-sans">
      
      {/* Top Floating Glassmorphism Navbar (Fixed & Moving along with page scroll) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070e0b]/90 backdrop-blur-md border-b border-emerald-900/30 shadow-lg transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Logo variant="light" size="md" href="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-300">
            <a href="#recursos" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Recursos
            </a>
            <a href="#comparativo" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Por Que BIRDPRO?
            </a>
            <a href="#provas" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Criatórios &amp; Provas
            </a>
            <a href="#pedigree" className="hover:text-emerald-400 transition-colors">Pedigree</a>
            <a href="#planos" className="hover:text-emerald-400 transition-colors">Planos</a>
          </nav>

          {/* Desktop & Tablet Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-emerald-950/40 text-xs font-bold">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm" className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-950/50">
                Assinar Agora →
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/cadastro" className="sm:hidden">
              <Button size="sm" className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-[11px] px-3 py-1.5 shadow-md">
                Assinar
              </Button>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-emerald-950/60 rounded-xl transition cursor-pointer border border-emerald-800/40"
              aria-label="Abrir Menu Principal"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0a1611]/98 border-b border-emerald-800/50 backdrop-blur-2xl px-5 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-200">
              <a 
                href="#recursos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-950/60 hover:text-emerald-400 transition"
              >
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Recursos &amp; Módulos</span>
              </a>

              <a 
                href="#comparativo" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-950/60 hover:text-emerald-400 transition"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Por Que BIRDPRO? (Comparativo)</span>
              </a>

              <a 
                href="#provas" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-950/60 hover:text-emerald-400 transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Criatórios &amp; Provas Reais</span>
              </a>

              <a 
                href="#pedigree" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-950/60 hover:text-emerald-400 transition"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Pedigree A4 &amp; QR Code</span>
              </a>

              <a 
                href="#planos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-950/60 hover:text-emerald-400 transition"
              >
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>Planos (R$ 14,99/mês)</span>
              </a>
            </nav>

            <div className="pt-3 border-t border-emerald-900/60 flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-emerald-800 bg-slate-900/80 text-white font-bold py-2.5">
                  Fazer Login
                </Button>
              </Link>
              <Link href="/cadastro" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-black py-2.5 shadow-lg shadow-emerald-950/60">
                  Assinar BIRDPRO Agora →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Dynamic Daytime Ambience Animations */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-28 overflow-hidden">
        {/* Dynamic Daytime Ambient Animations (Updates automatically according to real local time) */}
        <DynamicDaytimeAmbience />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          
          {/* Hero Brand Focus & Illuminated Master Logo Badge */}
          <div className="flex flex-col items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Illuminated Master BIRDPRO Brand Badge */}
            <div className="relative group cursor-default">
              {/* Outer Neon Radial Aura */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00c853] via-emerald-400 to-teal-300 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse pointer-events-none" />
              
              <div className="relative flex items-center gap-3.5 sm:gap-4 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-[#091510]/95 border-2 border-emerald-400/60 shadow-[0_10px_40px_rgba(0,200,83,0.35)] backdrop-blur-xl transition-all duration-300 group-hover:border-emerald-300 group-hover:shadow-[0_10px_50px_rgba(0,200,83,0.55)]">
                {/* 3D Modern Bird Vector Emblem with Gold Ring */}
                <div className="relative flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#00c853] via-emerald-600 to-[#022c1b] border-2 border-emerald-300/70 shadow-lg shadow-emerald-500/50 p-2 overflow-hidden ring-2 ring-emerald-400/40 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-md">
                    <path d="M7 26C11 19 20 15 33 11C37 9.5 41 7 41 7C40 11 38 18 34 22C29.5 26.5 23 29.5 15.5 30.5C11 31 8.5 28.5 7 26Z" fill="white" fillOpacity="0.98" />
                    <path d="M19 23C25 21 34 16 39 9.5C35 15 30.5 24.5 23.5 28.5C17.5 32 11.5 32.5 9 32.5C12 30.5 16 26.5 19 23Z" fill="#a7f3d0" fillOpacity="0.9" />
                    <circle cx="35" cy="35" r="7" stroke="#F59E0B" strokeWidth="2.8" fill="none" />
                    <circle cx="35" cy="35" r="3.2" fill="#F59E0B" />
                  </svg>
                </div>

                {/* Typography with illuminated gradient */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
                    <span>BIRD</span>
                    <span className="ml-0.5 text-transparent bg-clip-text bg-gradient-to-r from-[#00e676] via-emerald-300 to-teal-200 drop-shadow-[0_0_25px_rgba(0,230,118,0.7)]">
                      PRO
                    </span>
                    <span className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ml-2 bg-[#00e676] shadow-[0_0_12px_#00e676] animate-pulse" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-300/90 mt-1">
                    Sistema Oficial de Gestão Zootécnica &amp; Genética Aviária
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.14] max-w-5xl mx-auto pt-2">
            A Plataforma Definitiva para a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c853] via-emerald-300 to-teal-300 drop-shadow-[0_4px_30px_rgba(0,200,83,0.45)]">
              Evolução Genética e Manejo
            </span>{' '}
            do seu Criatório
          </h1>

          <p className="text-xs sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Controle integrado de anilhas FOB &amp; SISPASS, árvores genealógicas de até 5 gerações com cálculo automático de consanguinidade, ovoscopia, reprodução e emissão de pedigree A4 com QR Code exclusivo.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/cadastro" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#00c853] hover:bg-emerald-600 font-black text-sm sm:text-base text-white shadow-xl shadow-emerald-600/30 px-8 py-3.5 transition-all duration-300 hover:scale-[1.02]">
                <Leaf className="w-5 h-5 mr-2" />
                Assinar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-emerald-800/60 bg-slate-900/60 backdrop-blur-sm text-slate-200 hover:bg-emerald-950/60 hover:text-white hover:border-emerald-500/50 text-sm sm:text-base px-6">
                <PlayCircle className="w-5 h-5 mr-2 text-emerald-400" />
                Explorar Painel Demonstrativo
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-tenant Seguro</span>
            <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-emerald-400" /> 100% Responsivo no Celular</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Compatível FOB &amp; SISPASS</span>
            <span className="flex items-center gap-1.5"><Feather className="w-4 h-4 text-emerald-400" /> Preservação &amp; Manejo Sustentável</span>
          </div>
        </div>

        {/* Real Numbers & Impact Metric Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#0c1813]/90 rounded-3xl border border-emerald-800/40 shadow-xl backdrop-blur-md">
            
            <div className="text-center space-y-1 p-3 border-r border-emerald-900/40 last:border-none">
              <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
                +48.500
              </span>
              <span className="text-xs text-emerald-400 font-bold block">Aves Cadastradas</span>
              <p className="text-[10px] text-slate-400">Em criatórios de todo o Brasil</p>
            </div>

            <div className="text-center space-y-1 p-3 border-r border-emerald-900/40 last:border-none">
              <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
                +3.900
              </span>
              <span className="text-xs text-emerald-400 font-bold block">Criatórios Ativos</span>
              <p className="text-[10px] text-slate-400">Comerciais e preservacionistas</p>
            </div>

            <div className="text-center space-y-1 p-3 border-r border-emerald-900/40 last:border-none">
              <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
                +190.000
              </span>
              <span className="text-xs text-emerald-400 font-bold block">Anilhas SISPASS &amp; FOB</span>
              <p className="text-[10px] text-slate-400">Rastreadas com histórico</p>
            </div>

            <div className="text-center space-y-1 p-3">
              <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
                99.8%
              </span>
              <span className="text-xs text-emerald-400 font-bold block">Satisfação &amp; Retenção</span>
              <p className="text-[10px] text-slate-400">Suporte técnico de verdade</p>
            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* LIVE REAL-TIME CLOCK, TEMPERATURE & SEASONAL BREEDING ADVICE (CHOCO/MUDA) */}
      {/* ========================================================================= */}
      <LiveBreedingStatus />

      {/* ========================================================================= */}
      {/* COMPARATIVE SECTION: BIRDPRO VS. LEGACY COMPUTERS & SPREADSHEETS          */}
      {/* ========================================================================= */}
      <section id="comparativo" className="py-24 bg-[#09140f] border-t border-emerald-950/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> A Evolução Definitiva da Gestão Aviária
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Por que o BIRDPRO é muito superior aos sistemas antigos?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A ornitofilia brasileira evoluiu. Compare a tecnologia moderna em nuvem do BIRDPRO com os programas antigos instalados em computador e planilhas manuais, e descubra por que milhares de criadores já migraram.
            </p>
          </div>

          {/* Comparison Cards / Table */}
          <div className="bg-[#0e1b14] rounded-3xl border border-emerald-900/40 shadow-2xl overflow-hidden">
            
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-[#13221b] border-b border-emerald-900/60 p-4 sm:p-6 text-xs font-black uppercase tracking-wider">
              <div className="md:col-span-4 text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Recurso &amp; Tecnologia</span>
              </div>
              <div className="md:col-span-4 text-emerald-400 flex items-center gap-2 mt-2 md:mt-0 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                <span>BIRDPRO (Tecnologia em Nuvem)</span>
              </div>
              <div className="md:col-span-4 text-slate-400 flex items-center gap-2 mt-2 md:mt-0">
                <X className="w-4 h-4 text-rose-400" />
                <span>Softwares Antigos de Computador / Planilhas</span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-emerald-950/60 text-xs">
              {comparisonItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-6 hover:bg-[#13261e]/50 transition-colors gap-3 md:gap-4 items-center"
                >
                  <div className="md:col-span-4">
                    <span className="font-extrabold text-white text-sm block">{item.feature}</span>
                  </div>

                  <div className="md:col-span-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-200 space-y-1">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00c853] shrink-0 mt-0.5" />
                      <span className="font-semibold text-xs leading-relaxed">{item.birdpro}</span>
                    </div>
                  </div>

                  <div className="md:col-span-4 p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-slate-400 space-y-1">
                    <div className="flex items-start gap-2">
                      <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed">{item.legacy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="text-center pt-2">
            <Link href="/cadastro">
              <Button size="lg" className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-sm sm:text-base px-8 py-3.5 shadow-xl shadow-emerald-950/80">
                <span>Migrar Meu Criatório para o BIRDPRO Agora →</span>
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* DAILY ROTATING PROOFS & REAL VERIFIED CRIATÓRIOS (MUDANÇA DIÁRIA)         */}
      {/* ========================================================================= */}
      <DailyProofsSection />

      {/* Features Grid Section */}
      <section id="recursos" className="py-24 bg-[#09140f] border-t border-emerald-950/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Módulos Especializados
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Tudo o que seu criatório precisa</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Desenvolvido com critérios zootécnicos reais para facilitar o dia a dia do criador e potencializar os resultados genéticos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div 
                  key={i} 
                  className="bg-[#0e1b14]/80 p-6 sm:p-8 rounded-3xl border border-emerald-900/30 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-950/40 transition-all duration-300 space-y-4 group hover:-translate-y-1"
                >
                  <div className={`p-3.5 rounded-2xl w-fit border ${f.color} transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-lg text-white group-hover:text-emerald-300 transition-colors">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pedigree & Crachá Feature Section */}
      <section id="pedigree" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="bg-gradient-to-br from-[#052b1b] via-[#093824] to-[#0a1811] rounded-3xl p-8 sm:p-14 border border-emerald-600/40 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-2xl shadow-emerald-950 relative overflow-hidden">
          
          <div className="space-y-4 relative z-10">
            <span className="text-xs font-black px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/40 inline-flex items-center gap-1.5 shadow-xs">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Documentação Oficial &amp; Torneios
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Emissão Automática de Pedigree A4 &amp; Crachá de Gaiola
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Gere documentos profissionais com a identidade visual do seu criatório, foto da ave, árvore genealógica de 4 e 5 gerações, laudos laboratoriais e QR Code de autenticidade instantânea.
            </p>
            <div className="pt-3 flex flex-wrap gap-3">
              <Link href="/dashboard/aves">
                <Button className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/60 px-6 py-2.5">
                  Conhecer Emissão de Pedigree →
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-[#09150f]/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-emerald-500/40 space-y-4 font-mono text-xs text-slate-300 shadow-xl relative z-10">
            <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> CERTIFICADO GENEALÓGICO
              </span>
              <span className="text-[10px] text-emerald-300 font-bold px-2 py-0.5 bg-emerald-950 rounded border border-emerald-700/50">
                BIRDPRO VERIFIED
              </span>
            </div>
            <p className="text-white font-bold text-sm">AVE: Soberano Real (FOB-2024-BR-0891)</p>
            <p className="text-slate-400">Pai: Trovão Negro ♂ • Mãe: Rainha do Ouro ♀</p>
            <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-700/60 text-[11px] text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00c853] shrink-0" />
              <span>Autenticidade validada por QR Code e criptografia em nuvem</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 bg-[#09140f] border-t border-emerald-950/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sprout className="w-3.5 h-3.5" /> Planos Transparentes &amp; Sem Pegadinhas
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Invista no crescimento do seu plantel</h2>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
              Acesso total e irrestrito a <strong>100% dos recursos da plataforma</strong> em qualquer um dos planos. Sem taxas adicionais por novos recursos ou cobranças para upgrades!
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Plano Mensal */}
            <div className="bg-[#0e1b14] p-8 sm:p-10 rounded-3xl border border-emerald-900/40 space-y-6 flex flex-col justify-between hover:border-emerald-600/60 transition-all duration-300 shadow-xl">
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Assinatura Mensal</span>
                  <h3 className="text-2xl font-black text-white mt-1">Plano Mensal</h3>
                  <p className="text-xs text-slate-400 mt-1">Acesso total sem fidelidade, cancele a qualquer momento.</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-white">R$ 14,99</span>
                    <span className="text-sm font-semibold text-slate-400">/mês</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">Cobrança mensal simples e transparente</p>
                </div>

                {/* All-Inclusive Highlight Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/50 text-xs text-emerald-300 space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-emerald-200">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    Acesso Completo e Ilimitado
                  </p>
                  <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                    Você tem acesso liberado a tudo no sistema. Sem cobrança de taxas a mais para upgrades futuros.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-emerald-950/80">
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> <strong>Aves, gaiolas e anilhas ilimitadas</strong></p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Genealogia de até 5 gerações &amp; Pedigree A4 Oficial</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Gestão de reprodução, ovos, ninhos e eclosão</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Prontuário de saúde, medicamentos e sexagem DNA</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Etiquetas inteligentes com QR Code</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Importação rápida do SISPASS / IBAMA</p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/cadastro" className="block">
                  <Button variant="outline" className="w-full border-emerald-700 hover:bg-emerald-950/80 text-white font-bold py-3 text-sm rounded-xl">
                    Assinar Plano Mensal →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Plano Anual */}
            <div className="bg-[#0f241a] p-8 sm:p-10 rounded-3xl border-2 border-[#00c853] shadow-2xl shadow-emerald-950 space-y-6 flex flex-col justify-between relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00c853] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                ★ Mais Vantajoso • Economize
              </span>

              <div className="space-y-5">
                <div>
                  <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">Assinatura Anual</span>
                  <h3 className="text-2xl font-black text-white mt-1">Plano Anual</h3>
                  <p className="text-xs text-emerald-200/80 mt-1">12 meses de acesso garantido com máxima economia.</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-white">R$ 169,99</span>
                    <span className="text-sm font-semibold text-slate-400">/ano</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">Equivalente a apenas R$ 14,16/mês (desconto anual)</p>
                </div>

                {/* All-Inclusive Highlight Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-xs text-emerald-200 space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    Acesso Completo e Ilimitado
                  </p>
                  <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                    Você tem acesso liberado a tudo no sistema. Sem cobrança de taxas a mais para upgrades futuros.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-200 pt-2 border-t border-emerald-900/80">
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> <strong>Aves, gaiolas e anilhas ilimitadas</strong></p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Genealogia de até 5 gerações &amp; Pedigree A4 Oficial</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Gestão de reprodução, ovos, ninhos e eclosão</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Prontuário de saúde, medicamentos e sexagem DNA</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Etiquetas inteligentes com QR Code</p>
                  <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Backup automático prioritário em nuvem</p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/cadastro" className="block">
                  <Button className="w-full bg-[#00c853] hover:bg-emerald-600 font-black py-3 text-sm text-white rounded-xl shadow-lg shadow-emerald-700/40">
                    Assinar Plano Anual →
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-950/80 bg-[#060c09] py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo variant="light" size="sm" href="/" />
          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/login" className="hover:text-emerald-400 transition-colors">Login</Link>
            <Link href="/cadastro" className="hover:text-emerald-400 transition-colors">Assinar BIRDPRO</Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          </div>
          <p>© {new Date().getFullYear()} BIRDPRO • Gestão Aviária &amp; Conservação da Natureza.</p>
        </div>
      </footer>
    </div>
  );
}
