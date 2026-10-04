'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronRight, 
  ChevronLeft,
  TrendingUp, 
  Smartphone,
  Leaf,
  Sprout,
  Feather,
  Star,
  Zap,
  Layers,
  CheckCircle2,
  Clock,
  Laptop,
  Scan,
  Maximize2,
  Calendar,
  Lock,
  Thermometer,
  Shield,
  FileCheck,
  HelpCircle
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { DynamicDaytimeAmbience } from '@/components/landing/dynamic-daytime-ambience';
import { LiveBreedingStatus } from '@/components/landing/live-breeding-status';
import { DailyProofsSection } from '@/components/landing/daily-proofs-section';
import { PrintableBadgePreview } from '@/components/landing/printable-badge-preview';
import { FaqAndSeoSection } from '@/components/landing/faq-and-seo-section';

type SectionId = 'recursos' | 'comparativo' | 'pedigree' | 'criatorios' | 'ambiente' | 'planos' | 'faq';

interface SectionConfig {
  id: SectionId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
  tagline: string;
}

const SECTIONS: SectionConfig[] = [
  { 
    id: 'recursos', 
    label: 'Módulos & Recursos', 
    shortLabel: 'Módulos',
    icon: Leaf,
    badge: '6 Módulos',
    tagline: 'Tudo o que seu criatório precisa em uma só interface'
  },
  { 
    id: 'comparativo', 
    label: 'Por Que o BIRDPRO?', 
    shortLabel: 'Comparativo',
    icon: Zap,
    badge: 'Inovação',
    tagline: 'Compare a tecnologia em nuvem com sistemas ultrapassados'
  },
  { 
    id: 'pedigree', 
    label: 'Pedigree A4 & QR Code', 
    shortLabel: 'Pedigree',
    icon: Award,
    badge: 'Oficial FOB',
    tagline: 'Certificados genealógicos profissionais com validação pública'
  },
  { 
    id: 'criatorios', 
    label: 'Criatórios & Provas Reais', 
    shortLabel: 'Criatórios',
    icon: ShieldCheck,
    badge: 'Casos Reais',
    tagline: 'Criadores verificados de todo o Brasil que confiam na plataforma'
  },
  { 
    id: 'ambiente', 
    label: 'Manejo ao Vivo & Clima', 
    shortLabel: 'Ambiente',
    icon: Clock,
    badge: 'Ao Vivo',
    tagline: 'Relógio biológico, temperatura e fases sazonais de reprodução'
  },
  { 
    id: 'planos', 
    label: 'Planos & Assinatura', 
    shortLabel: 'Planos',
    icon: Sprout,
    badge: 'R$ 14,99/mês',
    tagline: 'Sem taxas ocultas, 100% dos recursos liberados'
  },
  { 
    id: 'faq', 
    label: 'Dúvidas Frequentes', 
    shortLabel: 'Dúvidas / FAQ',
    icon: HelpCircle,
    badge: 'Tire Dúvidas',
    tagline: 'Perguntas e respostas sobre SISPASS, Pedigree, Consanguinidade e Planos'
  },
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('recursos');
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState<'anual' | 'mensal'>('anual');
  const [activePedigreeTab, setActivePedigreeTab] = useState<'a4' | 'cracha' | 'qr'>('a4');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  // Switch section with smooth scroll and transition effect
  const handleSelectSection = (id: SectionId) => {
    setActiveSection(id);
    if (id === 'faq') {
      const faqElem = document.getElementById('faq');
      if (faqElem) {
        const topOffset = faqElem.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
        return;
      }
    }
    if (sectionRef.current) {
      const topOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const currentSectionIndex = SECTIONS.findIndex(s => s.id === activeSection);
  const prevSection = currentSectionIndex > 0 ? SECTIONS[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < SECTIONS.length - 1 ? SECTIONS[currentSectionIndex + 1] : null;

  // Features list
  const features = [
    {
      title: 'Genealogia & Pedigree A4 Oficial',
      shortTitle: 'Genealogia & Pedigree',
      desc: 'Árvore genealógica de até 5 gerações com cálculo automático do coeficiente de consanguinidade (Wright), histórico genético e emissão de certificados oficiais para impressão.',
      icon: Award,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      highlights: [
        'Cálculo de consanguinidade Wright em tempo real',
        'Impressão em formato A4 oficial com foto e laudos',
        'Rastreio de linhagens campeãs e mutações genéticas',
        'QR Code de autenticidade criptografado'
      ],
      previewType: 'genealogy'
    },
    {
      title: 'Manejo Reprodutivo & Ninhos',
      shortTitle: 'Manejo & Ninhos',
      desc: 'Controle de pareamento de casais, ovoscopia com visualização de fertilidade, contagem regressiva de eclosão e registro de novos filhotes com reservas de anilhas.',
      icon: Heart,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      highlights: [
        'Calendário biológico de postura e eclosão',
        'Registro de ovoscopia (fértil, infértil, gorado)',
        'Controle de rodízio de matrizes e amas-secas',
        'Alertas de anilhamento do 4º ao 7º dia'
      ],
      previewType: 'breeding'
    },
    {
      title: 'Importação SISPASS em 5 Segundos',
      shortTitle: 'SISPASS / IBAMA',
      desc: 'Leitura instantânea de PDF do IBAMA e planilhas, controle de séries FOB/SISPASS, rastreamento de anilhas e reservas para choco sem digitação manual.',
      icon: CircleDot,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      highlights: [
        'Leitura instantânea do PDF do relatório do IBAMA',
        'Zero digitação manual: centenas de anilhas em 5s',
        'Controle duplo de anilhas SISPASS e anilhas FOB',
        'Prevenção contra anilhas duplicadas ou inválidas'
      ],
      previewType: 'sispass'
    },
    {
      title: 'Gaiolas Visuais & QR Code',
      shortTitle: 'Gaiolas & QR Code',
      desc: 'Visualização da lotação de cada viveiro, movimentação rápida de aves e etiquetas com QR Code para leitura física direta no criatório pelo celular.',
      icon: Grid3X3,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      highlights: [
        'Mapeamento visual de estantes, viveiros e voadeiras',
        'Impressão de etiquetas de gaiola com QR Code',
        'Leitura com câmera de celular para abrir ficha da ave',
        'Controle de densidade e quarentena de novas matrizes'
      ],
      previewType: 'cages'
    },
    {
      title: 'Prontuário Sanitário & Farmácia',
      shortTitle: 'Saúde & Farmácia',
      desc: 'Controle de sintomas, diagnósticos veterinários, posologia de medicamentos e alertas de administração de horários com push no celular.',
      icon: Activity,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      highlights: [
        'Agenda de vermifugação, vitaminas e coccidiostáticos',
        'Avisos com som e push notification no horário exato',
        'Histórico clínico vitalício vinculado ao prontuário da ave',
        'Controle de estoque da farmácia com data de validade'
      ],
      previewType: 'health'
    },
    {
      title: 'Sexagem DNA & Genotipagem',
      shortTitle: 'Sexagem & Genética',
      desc: 'Anexação de laudos laboratoriais, identificação de fatores genéticos, mutações, linhagens campeãs e genes recessivos para cruzamentos direcionados.',
      icon: Sparkles,
      color: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      highlights: [
        'Anexação de laudos oficiais de laboratórios credenciados',
        'Simulador genético de mutações (autossômicas e ligadas ao sexo)',
        'Classificação de porte, cor e dialeto de canto',
        'Certificado de pureza genética'
      ],
      previewType: 'dna'
    }
  ];

  // Comparison data
  const comparisonItems = [
    {
      feature: 'Tecnologia & Acesso',
      birdpro: '100% em Nuvem — Acesse no Celular, Tablet ou PC em qualquer lugar',
      legacy: 'Preso a 1 computador antigo; se a máquina quebrar, perde tudo',
      icon: Laptop
    },
    {
      feature: 'Importação do SISPASS / IBAMA',
      birdpro: 'Importação Automática em 5 segundos lendo o PDF do relatório oficial',
      legacy: 'Digitação manual e exaustiva de cada anilha e ave, uma por uma',
      icon: CircleDot
    },
    {
      feature: 'Árvore Genealógica & Pedigree',
      birdpro: 'Árvore visual interativa de até 5 gerações com cálculo de consanguinidade Wright',
      legacy: 'Listas estáticas em papel ou planilhas simples sem cálculo genético',
      icon: Award
    },
    {
      feature: 'QR Code de Autenticidade',
      birdpro: 'QR Code exclusivo por ave com página pública oficial de verificação',
      legacy: 'Sem validação pública digital ou laudos modernos com verificação',
      icon: QrCode
    },
    {
      feature: 'Alertas de Choco & Anilhamento',
      birdpro: 'Notificações inteligentes com aviso no 4º a 7º dia exato no seu celular',
      legacy: 'Sem alertas inteligentes, dependendo de anotações soltas em cadernos',
      icon: Clock
    },
    {
      feature: 'Política de Preço & Cobrança',
      birdpro: 'Apenas R$ 14,99/mês sem pegadinhas e com 100% dos recursos liberados',
      legacy: 'Cobranças adicionais por novas versões, módulos extras e limites artificiais',
      icon: Sprout
    },
    {
      feature: 'Atualizações & Backup',
      birdpro: 'Atualizações contínuas semanais e backup redundante em nuvem',
      legacy: 'Programas descontinuados, sem suporte técnico ágil e risco constante de perda',
      icon: ShieldCheck
    }
  ];

  const activeModule = features[activeModuleIdx];

  return (
    <div className="min-h-screen bg-[#070e0b] text-slate-100 selection:bg-[#00c853] selection:text-white relative overflow-x-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (GLASSMORPHISM FIXED)                                       */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070e0b]/92 backdrop-blur-md border-b border-emerald-900/30 shadow-lg transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <Logo variant="light" size="md" href="/" />

          {/* Desktop Navigation Links (Direct Section Selectors) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-300">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className={`flex items-center gap-1.5 transition-all duration-200 py-1.5 px-2.5 rounded-lg cursor-pointer ${
                    isActive 
                      ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 shadow-xs' 
                      : 'text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/30'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{sec.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-emerald-950/40 text-xs font-bold">
                Entrar
              </Button>
            </Link>
            <Link href="/checkout?plano=anual">
              <Button size="sm" className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95">
                Assinar Agora →
              </Button>
            </Link>
          </div>

          {/* Mobile & Tablet Action Buttons (Login + Assinar + Menu) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            <Link href="/login">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-emerald-700/60 bg-[#091710] hover:bg-emerald-950 text-emerald-300 hover:text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl shadow-xs"
              >
                Login
              </Button>
            </Link>

            <Link href="/checkout?plano=anual">
              <Button size="sm" className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-[11px] px-3 py-1.5 shadow-md rounded-xl">
                Assinar
              </Button>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-emerald-950/60 rounded-xl transition cursor-pointer border border-emerald-800/40"
              aria-label="Abrir Menu Principal"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0a1611]/98 border-b border-emerald-800/50 backdrop-blur-2xl px-5 py-5 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-2">
              Navegar pelas Seções:
            </div>
            <nav className="flex flex-col gap-1.5 text-sm font-semibold text-slate-200">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      handleSelectSection(sec.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer text-left ${
                      isActive 
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50' 
                        : 'hover:bg-emerald-950/60 hover:text-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{sec.label}</span>
                    </div>
                    {sec.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-emerald-900/60 flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-emerald-800 bg-slate-900/80 text-white font-bold py-2.5 text-xs">
                  Fazer Login
                </Button>
              </Link>
              <Link href="/checkout?plano=anual" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-black py-2.5 text-xs shadow-lg shadow-emerald-950/60">
                  Assinar BIRDPRO Agora →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. REFINED HERO SECTION (CLEAN, AIRY & BREATHABLE)                        */}
      {/* ========================================================================= */}
      <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-20 overflow-hidden">
        {/* Soft Ambient Dynamic Daytime Backdrop */}
        <div className="opacity-70 pointer-events-none transition-opacity duration-1000">
          <DynamicDaytimeAmbience />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          
          {/* Brand Focus Pill Badge with Live Green Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#091510]/90 border border-emerald-500/40 shadow-[0_4px_20px_rgba(0,200,83,0.25)] backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-500">
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse shadow-[0_0_8px_#00e676]" />
            <span className="text-[11px] sm:text-xs font-black tracking-wide text-emerald-300">
              BIRDPRO • Gestão Zootécnica &amp; Genética Aviária
            </span>
          </div>

          {/* Clean Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
            A Plataforma Definitiva para a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c853] via-emerald-300 to-teal-300 drop-shadow-[0_2px_20px_rgba(0,200,83,0.35)]">
              Evolução Genética e Manejo
            </span>{' '}
            do seu Criatório
          </h1>

          {/* Readable Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Controle integrado de anilhas FOB &amp; SISPASS, genealogia de 5 gerações com cálculo de consanguinidade, ovoscopia, reprodução e emissão de pedigree A4 com QR Code.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/checkout?plano=anual" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#00c853] hover:bg-emerald-600 font-black text-sm text-white shadow-xl shadow-emerald-600/30 px-7 py-3 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer">
                <Leaf className="w-4 h-4 mr-2" />
                Assinar Agora (R$ 14,99/mês)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <button
              onClick={() => handleSelectSection('recursos')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-emerald-700/60 bg-[#0e1b14]/80 hover:bg-emerald-950/60 text-slate-200 hover:text-emerald-300 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:border-emerald-500"
            >
              <span>Explorar Recursos</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Sleek Trust Bar */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% em Nuvem Segura</span>
            <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-emerald-400" /> Celular, Tablet e PC</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Compatível FOB &amp; SISPASS</span>
          </div>

          {/* Compact Clean Metrics Bar */}
          <div className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 sm:p-5 bg-[#0c1813]/85 rounded-2xl border border-emerald-800/40 shadow-xl backdrop-blur-md max-w-4xl mx-auto">
              <div className="text-center p-2 border-r border-emerald-900/40 last:border-none">
                <span className="text-xl sm:text-2xl font-black text-white block tracking-tight">+48.500</span>
                <span className="text-[11px] text-emerald-400 font-bold block">Aves Cadastradas</span>
              </div>
              <div className="text-center p-2 border-r border-emerald-900/40 last:border-none">
                <span className="text-xl sm:text-2xl font-black text-white block tracking-tight">+3.900</span>
                <span className="text-[11px] text-emerald-400 font-bold block">Criatórios Ativos</span>
              </div>
              <div className="text-center p-2 border-r border-emerald-900/40 last:border-none">
                <span className="text-xl sm:text-2xl font-black text-white block tracking-tight">+190.000</span>
                <span className="text-[11px] text-emerald-400 font-bold block">Anilhas Rastreadas</span>
              </div>
              <div className="text-center p-2">
                <span className="text-xl sm:text-2xl font-black text-white block tracking-tight">99.8%</span>
                <span className="text-[11px] text-emerald-400 font-bold block">Satisfação &amp; Retenção</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT CONTAINER (SECTIONS WITH FLUID TRANSITIONS)               */}
      {/* ========================================================================= */}
      <main ref={sectionRef} id="conteudo" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 1: MÓDULOS & RECURSOS                                           */}
        {/* ----------------------------------------------------------------------- */}
        {activeSection === 'recursos' && (
          <section id="recursos" className="space-y-8 animate-in fade-in zoom-in-98 duration-500">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> Módulos Especializados
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Tudo o que seu criatório precisa
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Selecione um módulo abaixo para ver suas funções zootécnicas e demonstração prática:
              </p>
            </div>

            {/* Interactive Module Hub: 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Interactive Module Selector List */}
              <div className="lg:col-span-5 space-y-2.5">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  const isSelected = activeModuleIdx === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveModuleIdx(i)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                        isSelected 
                          ? 'bg-gradient-to-r from-emerald-950/80 to-[#0e251b] border-emerald-500/70 shadow-lg shadow-emerald-950/50 -translate-x-1' 
                          : 'bg-[#0c1813]/70 border-emerald-900/30 hover:border-emerald-600/40 hover:bg-[#0f211a]/80'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl border ${f.color} transition-transform group-hover:scale-110`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`font-black text-sm transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-emerald-300'}`}>
                            {f.shortTitle}
                          </h3>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {f.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-emerald-400 translate-x-1' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Active Module Spotlight & Simulated Interactive Card */}
              <div className="lg:col-span-7 bg-gradient-to-br from-[#0c1c14] to-[#07130d] p-6 sm:p-8 rounded-3xl border border-emerald-600/40 shadow-2xl relative overflow-hidden transition-all duration-300">
                
                {/* Active Module Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Módulo Selecionado ({activeModuleIdx + 1}/6)
                    </span>
                    <span className="text-xs text-slate-400 font-medium">BIRDPRO v2.4</span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      {activeModule.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {activeModule.desc}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {activeModule.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-[#00c853] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Dynamic Mockup Card based on active module */}
                  <div className="pt-4 border-t border-emerald-900/60">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Scan className="w-3.5 h-3.5" /> Demonstração Visual do Recurso:
                    </div>

                    {/* Genealogy Preview: Crachá da Árvore Genealógica Oficial Pronto para Impressão */}
                    {activeModule.previewType === 'genealogy' && (
                      <PrintableBadgePreview />
                    )}

                    {/* Breeding Preview */}
                    {activeModule.previewType === 'breeding' && (
                      <div className="p-4 rounded-2xl bg-[#08150f] border border-emerald-700/50 space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-emerald-900/60">
                          <span className="text-emerald-300 font-bold">Ninho #04 — Casal Ouro (Gaiola 12)</span>
                          <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 text-[10px] font-bold">
                            Choco Ativo (Dia 9/13)
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900">
                            <span className="text-slate-400 block text-[9px]">Postura</span>
                            <span className="text-white font-bold">4 Ovos</span>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900">
                            <span className="text-slate-400 block text-[9px]">Ovoscopia</span>
                            <span className="text-emerald-400 font-bold">3 Férteis</span>
                          </div>
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900">
                            <span className="text-slate-400 block text-[9px]">Eclosão Prevista</span>
                            <span className="text-amber-300 font-bold">Em 4 dias</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Alerta programado: Envio automático de lembrete de anilhamento com série FOB reservada.
                        </p>
                      </div>
                    )}

                    {/* SISPASS Preview */}
                    {activeModule.previewType === 'sispass' && (
                      <div className="p-4 rounded-2xl bg-[#08150f] border border-blue-700/50 space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-blue-900/60">
                          <span className="text-blue-300 font-bold">Importador SISPASS / IBAMA</span>
                          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60 text-[10px] font-bold">
                            Processado em 4.8s
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-slate-300">
                            <span>Relatório IBAMA PDF:</span>
                            <span className="text-emerald-400 font-bold">142 aves identificadas</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Anilhas SISPASS validadas:</span>
                            <span className="text-emerald-400 font-bold">100% sem erros</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Economia de tempo estimada:</span>
                            <span className="text-white font-bold">~ 18 horas de digitação manual</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cages Preview */}
                    {activeModule.previewType === 'cages' && (
                      <div className="p-4 rounded-2xl bg-[#08150f] border border-purple-700/50 space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-purple-900/60">
                          <span className="text-purple-300 font-bold">Mapa de Viveiros &amp; Gaiolas</span>
                          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/60 text-[10px] font-bold">
                            32 Gaiolas Ativas
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 font-bold">G-01 (Casal)</div>
                          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 font-bold">G-02 (Casal)</div>
                          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 font-bold">G-03 (Choco)</div>
                          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400">G-04 (Livre)</div>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Cada gaiola gera etiqueta física com QR Code para leitura rápida com a câmera do celular.
                        </p>
                      </div>
                    )}

                    {/* Health Preview */}
                    {activeModule.previewType === 'health' && (
                      <div className="p-4 rounded-2xl bg-[#08150f] border border-amber-700/50 space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-amber-900/60">
                          <span className="text-amber-300 font-bold">Prontuário Sanitário &amp; Vacinas</span>
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 text-[10px] font-bold">
                            Alerta Ativo
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-slate-300">
                            <span>Vitamina E + Selênio:</span>
                            <span className="text-emerald-400 font-bold">Ministrado hoje às 08:00</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Vermifugação semestral:</span>
                            <span className="text-amber-300 font-bold">Próxima dose em 12 dias</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DNA Preview */}
                    {activeModule.previewType === 'dna' && (
                      <div className="p-4 rounded-2xl bg-[#08150f] border border-teal-700/50 space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-teal-900/60">
                          <span className="text-teal-300 font-bold">Laudo Laboratorial de Sexagem DNA</span>
                          <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/60 text-[10px] font-bold">
                            Certificado Válido
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-slate-300">
                            <span>Resultado PCR:</span>
                            <span className="text-blue-400 font-black">MACHO (♂ - ZZ)</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Laudo Anexado:</span>
                            <span className="text-emerald-400 font-bold">PDF oficial do laboratório</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Module CTA */}
                  <div className="pt-2 flex items-center justify-between">
                    <Link href="/checkout?plano=anual">
                      <Button size="sm" className="bg-[#00c853] hover:bg-emerald-600 font-black text-xs text-white shadow-lg cursor-pointer">
                        Começar a Usar Este Módulo →
                      </Button>
                    </Link>
                    <span className="text-xs text-slate-400">Incluso em todos os planos</span>
                  </div>

                </div>

              </div>

            </div>

          </section>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 2: POR QUE O BIRDPRO? (COMPARATIVO TECNOLÓGICO)                 */}
        {/* ----------------------------------------------------------------------- */}
        {activeSection === 'comparativo' && (
          <section id="comparativo" className="space-y-8 animate-in fade-in zoom-in-98 duration-500">
            
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> A Evolução Definitiva da Gestão Aviária
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Por que o BIRDPRO é muito superior aos sistemas antigos?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A ornitofilia brasileira evoluiu. Compare a tecnologia moderna em nuvem com os programas antigos instalados em computador e planilhas manuais.
              </p>
            </div>

            {/* Clean Modern Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* BIRDPRO Card (Highlight) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c2418] via-[#091a12] to-[#07130d] border-2 border-emerald-500/70 shadow-2xl shadow-emerald-950 space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#00c853] text-black">
                      <CheckCircle2 className="w-5 h-5 font-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">BIRDPRO (Em Nuvem)</h3>
                      <span className="text-[11px] text-emerald-400 font-semibold">Tecnologia Moderna 2026</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Recomendado
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {comparisonItems.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={idx} className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/40 flex items-start gap-3">
                        <ItemIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block text-xs mb-0.5">{item.feature}</strong>
                          <span className="text-emerald-200 leading-relaxed">{item.birdpro}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <Link href="/checkout?plano=anual" className="block">
                    <Button className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-black py-3 text-xs sm:text-sm shadow-xl shadow-emerald-950/80 cursor-pointer">
                      Migrar Meu Criatório para o BIRDPRO Agora →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Legacy Software / Spreadsheets Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1612]/90 border border-rose-900/30 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/40">
                      <X className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-300">Softwares Antigos &amp; Planilhas</h3>
                      <span className="text-[11px] text-rose-400 font-semibold">Sistemas Descontinuados</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/40">
                    Alto Risco
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {comparisonItems.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/20 flex items-start gap-3 text-slate-400">
                      <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-300 block text-xs mb-0.5">{item.feature}</strong>
                        <span className="leading-relaxed">{item.legacy}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-center text-xs text-rose-300">
                  ⚠️ Perda de histórico genético caso o computador formate ou estrague.
                </div>
              </div>

            </div>

          </section>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 3: PEDIGREE OFICIAL & QR CODE                                    */}
        {/* ----------------------------------------------------------------------- */}
        {activeSection === 'pedigree' && (
          <section id="pedigree" className="space-y-8 animate-in fade-in zoom-in-98 duration-500">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Documentação Oficial &amp; Torneios
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Emissão de Pedigree A4 &amp; Crachá com QR Code
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Gere documentos profissionais com a identidade visual do seu criatório, foto da ave e autenticação digital instantânea.
              </p>
            </div>

            {/* Pedigree Showcase Card */}
            <div className="bg-gradient-to-br from-[#062417] via-[#093522] to-[#0a1811] rounded-3xl p-6 sm:p-10 border border-emerald-600/40 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl">
              
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/40 inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Padrão Oficial FOB &amp; Criatórios Comerciais
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Valorize suas matrizes e filhotes com documentação de alto nível
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Criadores relatam até 40% de valorização em transferências de matrizes e filhotes quando acompanhados pelo certificado oficial BIRDPRO com validação de QR Code criptografado.
                </p>

                <div className="space-y-2.5 text-xs text-slate-200 pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                    <span>Árvore de 3 a 5 gerações com cálculo de parentesco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                    <span>Laudo de sexagem DNA e premiações em torneios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                    <span>Página pública oficial de validação por QR Code</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link href="/checkout?plano=anual">
                    <Button className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/60 px-6 py-2.5 cursor-pointer">
                      Emitir Meus Pedigrees →
                    </Button>
                  </Link>

                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-emerald-700/60 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Testar Leitura de QR Code</span>
                  </button>
                </div>
              </div>

              {/* Document Simulator Card */}
              <div className="lg:col-span-6 bg-[#09150f]/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-emerald-500/40 space-y-4 font-mono text-xs text-slate-300 shadow-2xl relative">
                
                <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                    <Leaf className="w-3.5 h-3.5" /> CERTIFICADO GENEALÓGICO A4
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold px-2 py-0.5 bg-emerald-950 rounded border border-emerald-700/50">
                    BIRDPRO VERIFIED
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-white font-bold text-sm">AVE: Soberano Real (FOB-2024-BR-0891)</p>
                  <p className="text-slate-400 text-[11px]">Espécie: Sporophila maximiliani (Bicudo)</p>
                  <p className="text-slate-400 text-[11px]">Pai: Trovão Negro ♂ • Mãe: Rainha do Ouro ♀</p>
                </div>

                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-700/60 text-[11px] text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00c853] shrink-0" />
                    <span>Autenticidade digital com QR Code exclusivo</span>
                  </div>
                  <QrCode className="w-6 h-6 text-emerald-400 shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div className="p-2 bg-black/40 rounded-lg border border-emerald-900/40">
                    <span className="block text-slate-500 uppercase">Criatório Emissor:</span>
                    <span className="text-white font-semibold">Criadouro Canto Real</span>
                  </div>
                  <div className="p-2 bg-black/40 rounded-lg border border-emerald-900/40">
                    <span className="block text-slate-500 uppercase">Laudo Genético:</span>
                    <span className="text-emerald-400 font-semibold">PCR Negativo / Puro</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Interactive QR Simulation Modal */}
            {isQrModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-[#0b1c14] border border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
                  <button
                    onClick={() => setIsQrModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-black text-white">Validador de Autenticidade BIRDPRO</h4>
                    <p className="text-xs text-slate-400">
                      Qualquer comprador ou fiscal pode escanear o QR Code da ave para consultar os dados oficiais em tempo real:
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#07130d] border border-emerald-700/50 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-emerald-900/60 pb-2">
                      <span>✓ Registro Ativo &amp; Válido</span>
                      <span className="text-[10px] text-slate-400">ID: BP-98124</span>
                    </div>
                    <p className="text-white"><strong>Ave:</strong> Soberano Real</p>
                    <p className="text-slate-300"><strong>Anilha:</strong> FOB-2024-BR-0891 (SISPASS Conectado)</p>
                    <p className="text-slate-300"><strong>Genética:</strong> 5 gerações registradas sem quebra</p>
                    <p className="text-emerald-400"><strong>Criatório:</strong> Criadouro Canto Real (Verificado)</p>
                  </div>

                  <Button
                    onClick={() => setIsQrModalOpen(false)}
                    className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs py-2.5 cursor-pointer"
                  >
                    Fechar Demonstração
                  </Button>
                </div>
              </div>
            )}

          </section>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 4: CRIATÓRIOS & PROVAS REAIS                                     */}
        {/* ----------------------------------------------------------------------- */}
        {activeSection === 'criatorios' && (
          <section id="criatorios" className="space-y-8 animate-in fade-in zoom-in-98 duration-500">
            <DailyProofsSection />
          </section>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 5: MANEJO AO VIVO & AMBIENTE                                     */}
        {/* ----------------------------------------------------------------------- */}
        {activeSection === 'ambiente' && (
          <section id="ambiente" className="space-y-8 animate-in fade-in zoom-in-98 duration-500">
            <LiveBreedingStatus />
          </section>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 6: PLANOS & ASSINATURA                                           */}
        {/* ----------------------------------------------------------------------- */}
        {activeSection === 'planos' && (
          <section id="planos" className="space-y-8 animate-in fade-in zoom-in-98 duration-500">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sprout className="w-3.5 h-3.5" /> Planos Transparentes &amp; Sem Pegadinhas
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Invista no crescimento do seu plantel
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Acesso total e irrestrito a <strong>100% dos recursos da plataforma</strong> em qualquer um dos planos. Sem cobranças para upgrades!
              </p>

              {/* Billing Toggle Switcher */}
              <div className="pt-3 flex items-center justify-center">
                <div className="inline-flex items-center bg-[#0e1b14] p-1.5 rounded-2xl border border-emerald-800/60 shadow-lg">
                  <button
                    onClick={() => setBillingPeriod('mensal')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      billingPeriod === 'mensal'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mensal (R$ 14,99)
                  </button>
                  <button
                    onClick={() => setBillingPeriod('anual')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      billingPeriod === 'anual'
                        ? 'bg-[#00c853] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Anual (R$ 169,99)</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-yellow-400 text-black text-[10px] font-black">
                      20% OFF
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Plano Mensal Card */}
              <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                billingPeriod === 'mensal'
                  ? 'bg-gradient-to-br from-[#0c2418] to-[#07130d] border-2 border-[#00c853] shadow-2xl scale-[1.02]'
                  : 'bg-[#0e1b14] border-emerald-900/40 opacity-90'
              }`}>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">Assinatura Mensal</span>
                    <h3 className="text-2xl font-black text-white mt-1">Plano Mensal</h3>
                    <p className="text-xs text-slate-400 mt-1">Acesso total sem fidelidade, cancele quando quiser.</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-white">R$ 14,99</span>
                      <span className="text-sm font-semibold text-slate-400">/mês</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold mt-1">Cobrança mensal simples e transparente</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-emerald-950/80">
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> <strong>Aves, gaiolas e anilhas ilimitadas</strong></p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Genealogia de até 5 gerações &amp; Pedigree A4</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Gestão de reprodução, ovos e ninhos</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Prontuário de saúde e sexagem DNA</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Importação rápida do SISPASS / IBAMA</p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/checkout?plano=mensal" className="block">
                    <Button 
                      variant={billingPeriod === 'mensal' ? 'primary' : 'outline'}
                      className={`w-full py-3 text-xs sm:text-sm font-black rounded-xl cursor-pointer ${
                        billingPeriod === 'mensal'
                          ? 'bg-[#00c853] hover:bg-emerald-600 text-white shadow-lg'
                          : 'border-emerald-700 text-white hover:bg-emerald-950/80'
                      }`}
                    >
                      Assinar Plano Mensal →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Plano Anual Card */}
              <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative ${
                billingPeriod === 'anual'
                  ? 'bg-gradient-to-br from-[#0c281b] to-[#07170e] border-2 border-[#00c853] shadow-2xl shadow-emerald-950 scale-[1.02]'
                  : 'bg-[#0e1b14] border-emerald-900/40 opacity-90'
              }`}>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00c853] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                  ★ Mais Vantajoso • Economize 20%
                </span>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block">Assinatura Anual</span>
                    <h3 className="text-2xl font-black text-white mt-1">Plano Anual</h3>
                    <p className="text-xs text-emerald-200/80 mt-1">12 meses de tranquilidade com máxima economia.</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-white">R$ 169,99</span>
                      <span className="text-sm font-semibold text-slate-400">/ano</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold mt-1">Equivalente a apenas R$ 14,16/mês (desconto anual)</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-200 pt-3 border-t border-emerald-900/80">
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> <strong>Aves, gaiolas e anilhas ilimitadas</strong></p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Genealogia de até 5 gerações &amp; Pedigree A4</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Gestão de reprodução, ovos e ninhos</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Prontuário de saúde e sexagem DNA</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00c853] shrink-0" /> Backup automático prioritário em nuvem</p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/checkout?plano=anual" className="block">
                    <Button 
                      className={`w-full py-3 text-xs sm:text-sm font-black rounded-xl cursor-pointer ${
                        billingPeriod === 'anual'
                          ? 'bg-[#00c853] hover:bg-emerald-600 text-white shadow-xl shadow-emerald-700/40'
                          : 'border-emerald-700 text-white hover:bg-emerald-950/80'
                      }`}
                    >
                      Assinar Plano Anual →
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

            {/* Money-Back & Security Guarantee */}
            <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-950/50 border border-emerald-700/40 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-[#00c853]" />
                <span>Liberação Instantânea via PIX Automatizado</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pague via PIX e acesse sua conta imediatamente sem esperar por aprovação manual de suporte.
              </p>
            </div>

          </section>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION TRANSITION CONTROLLER (AT THE BOTTOM OF SECTIONS)               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="mt-12 pt-6 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Previous Section Button */}
            {prevSection ? (
              <button
                onClick={() => handleSelectSection(prevSection.id)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-800/60 bg-[#0e1b14] hover:bg-emerald-950 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <ChevronLeft className="w-4 h-4 text-emerald-400" />
                <span>Anterior: {prevSection.shortLabel}</span>
              </button>
            ) : <div className="hidden sm:block" />}

            {/* Dots Step Indicator */}
            <div className="flex items-center gap-2">
              {SECTIONS.map((sec, i) => (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSection === sec.id
                      ? 'w-6 bg-[#00c853]'
                      : 'w-2 bg-emerald-900 hover:bg-emerald-700'
                  }`}
                  aria-label={`Ir para ${sec.shortLabel}`}
                />
              ))}
            </div>

            {/* Next Section Button */}
            {nextSection ? (
              <button
                onClick={() => handleSelectSection(nextSection.id)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-500/60 bg-[#00c853]/20 hover:bg-[#00c853]/30 text-emerald-300 hover:text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
              >
                <span>Próxima: {nextSection.shortLabel}</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>
            ) : (
              <Link href="/checkout?plano=anual" className="w-full sm:w-auto">
                <Button size="sm" className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs px-5 py-2.5 cursor-pointer shadow-md">
                  Assinar BIRDPRO Agora →
                </Button>
              </Link>
            )}

          </div>

        {/* ======================================================================= */}
        {/* FAQ & SEARCH ENGINE OPTIMIZATION SECTION (CRAWLABLE CONTENT & JSON-LD) */}
        {/* ======================================================================= */}
        <FaqAndSeoSection />

      </main>

      {/* ========================================================================= */}
      {/* 5. FOOTER (RICH SEO NAVIGATION & BRANDING)                                */}
      {/* ========================================================================= */}
      <footer className="border-t border-emerald-950/80 bg-[#050b08] py-14 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-3 md:col-span-1">
              <Logo variant="light" size="sm" href="/" />
              <p className="text-slate-400 text-xs leading-relaxed">
                A mais avançada plataforma zootécnica em nuvem para criadores de aves do Brasil. Genealogia, SISPASS, FOB, Pedigree A4 com QR Code e controle de plantel.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-1">
                <span className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
                <span>Servidores em Nuvem Ativos (24/7)</span>
              </div>
            </div>

            {/* Col 2: Recursos & Módulos */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Recursos Zootécnicos</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => handleSelectSection('recursos')} className="hover:text-emerald-400 transition cursor-pointer">Importação SISPASS / IBAMA</button></li>
                <li><button onClick={() => handleSelectSection('pedigree')} className="hover:text-emerald-400 transition cursor-pointer">Pedigree A4 Oficial FOB</button></li>
                <li><button onClick={() => handleSelectSection('recursos')} className="hover:text-emerald-400 transition cursor-pointer">Cálculo de Consanguinidade Wright</button></li>
                <li><button onClick={() => handleSelectSection('ambiente')} className="hover:text-emerald-400 transition cursor-pointer">Ovoscopia & Postura</button></li>
                <li><button onClick={() => handleSelectSection('recursos')} className="hover:text-emerald-400 transition cursor-pointer">Gaiolas & QR Code Físico</button></li>
              </ul>
            </div>

            {/* Col 3: Espécies Atendidas */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Espécies & Plantéis</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><span className="text-slate-300">Curió & Bicudo</span> (Canto & Fibra)</li>
                <li><span className="text-slate-300">Trinca-Ferro & Pixarro</span> (Manejo)</li>
                <li><span className="text-slate-300">Coleiro & Papa-Capim</span> (Tui Tui)</li>
                <li><span className="text-slate-300">Canário Belga & da Terra</span> (Cor/Porte)</li>
                <li><span className="text-slate-300">Calopsita, Agapornis & Ringneck</span></li>
              </ul>
            </div>

            {/* Col 4: Links Rápidos & Segurança */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Acesso Rápido</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/login" className="hover:text-emerald-400 transition">Acessar Minha Conta (Login)</Link></li>
                <li><Link href="/contratar" className="hover:text-emerald-400 transition">Planos e Preços (R$ 14,99/mês)</Link></li>
                <li><Link href="/cadastro" className="hover:text-emerald-400 transition">Criar Conta no BIRDPRO</Link></li>
                <li><Link href="/qr_code" className="hover:text-emerald-400 transition">Verificação de QR Code</Link></li>
                <li><button onClick={() => handleSelectSection('faq')} className="hover:text-emerald-400 transition cursor-pointer">Dúvidas Frequentes (FAQ)</button></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} BIRDPRO • Gestão Aviária &amp; Conservação. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/contratar" className="hover:text-emerald-400 transition">Assinar BIRDPRO</Link>
              <Link href="/login" className="hover:text-emerald-400 transition">Área do Criador</Link>
              <span className="text-emerald-400 font-bold">100% em Nuvem</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
