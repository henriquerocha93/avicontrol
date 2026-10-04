'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Sparkles, 
  PlayCircle, 
  Video, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Bird, 
  DollarSign, 
  Layers, 
  Laptop, 
  CheckCircle2, 
  Bell, 
  ArrowRight,
  MonitorPlay,
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TreinamentoPage() {
  const [notified, setNotified] = useState(false);

  const MODULES_PREVIEW = [
    {
      icon: MonitorPlay,
      color: 'from-blue-500 to-sky-600',
      tag: 'Módulo 1 • Básico',
      title: 'Primeiros Passos & Configuração Inicial',
      desc: 'Como configurar os dados do seu criatório, cadastrar sua logo, personalizar as cores dos certificados e gerenciar anilhas.'
    },
    {
      icon: ShieldCheck,
      color: 'from-amber-500 to-yellow-600',
      tag: 'Módulo 2 • SISPASS IBAMA',
      title: 'Importação Automática do SISPASS',
      desc: 'Passo a passo de como exportar sua relação oficial do IBAMA em PDF/planilha e importar todo o seu plantel em segundos.'
    },
    {
      icon: Bird,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Módulo 3 • Genealogia',
      title: 'Árvores Genealógicas, Pedigrees & Crachás',
      desc: 'Como simular cruzamentos, calcular consanguinidade, emitir certificados públicos com QR Code e imprimir crachás de gaiola.'
    },
    {
      icon: DollarSign,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Módulo 4 • Negócios',
      title: 'Financeiro, Vendas & Reservas',
      desc: 'Controle de contas a pagar, contas a receber, reservas de filhotes para clientes e geração de recibos profissionais.'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link href="/dashboard" className="text-[#0284c7] hover:underline font-bold">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-bold">Treinamento</span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Decorative Animated Glow Background */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-amber-400/20 via-emerald-400/20 to-sky-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-gradient-to-tr from-emerald-500/15 via-teal-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Hero Section */}
        <div className="relative z-10 px-6 sm:px-12 py-14 text-center space-y-8">
          
          {/* Animated "Em Breve" Glowing Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-amber-500/30 text-amber-900 shadow-xs animate-bounce">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-amber-800">
              ⚡ EM BREVE • ÁREA DE TREINAMENTO &amp; VÍDEOAULAS
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          </div>

          {/* Icon with Rotating Gradient Rings */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500 to-sky-500 opacity-20 blur-lg animate-pulse" />
            <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-emerald-400/60 animate-[spin_12s_linear_infinite]" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl border border-slate-700">
              <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Headlines */}
          <div className="max-w-2xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Treinamento do Sistema <span className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">BIRDPRO</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Estamos gravando uma série de <strong>videoaulas práticas passo a passo</strong> e tutoriais guiados para você aprender a usar 100% de todos os recursos da plataforma de forma rápida e simples.
            </p>
          </div>

          {/* Video Lessons Syllabus Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-4 max-w-4xl mx-auto">
            {MODULES_PREVIEW.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400/50 hover:bg-emerald-50/20 transition-all duration-300 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr text-white flex items-center justify-center shadow-xs bg-slate-900">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700 border border-slate-300">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 pt-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Em Gravação (HD)
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <PlayCircle className="w-3.5 h-3.5" /> Incluso no Plano
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action CTA */}
          <div className="pt-6 border-t border-slate-100 max-w-md mx-auto">
            {notified ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Você receberá um aviso assim que as videoaulas forem liberadas!</span>
              </div>
            ) : (
              <button
                onClick={() => setNotified(true)}
                className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              >
                <Bell className="w-4 h-4 text-white" />
                <span>Quero ser avisado quando as aulas forem ao ar</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
