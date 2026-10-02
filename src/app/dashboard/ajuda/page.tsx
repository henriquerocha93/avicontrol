'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Bird, 
  CircleDot, 
  Grid3X3, 
  Heart, 
  Award, 
  FileText, 
  PlayCircle,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

export default function AjudaPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const guides = [
    {
      title: 'Primeiros Passos no BIRDPRO',
      desc: 'Como configurar o criatório, cadastrar sua primeira gaiola e suas primeiras matrizes.',
      icon: BookOpen,
      time: '3 min de leitura'
    },
    {
      title: 'Genealogia & Pedigree A4',
      desc: 'Como funciona a árvore genealógica de 3 gerações e emissão de certificados oficiais.',
      icon: Award,
      time: '4 min de leitura'
    },
    {
      title: 'Manejo Reprodutivo & Eclosão',
      desc: 'Como parear casais, registrar posturas e acompanhar a contagem regressiva de eclosão.',
      icon: Heart,
      time: '5 min de leitura'
    },
    {
      title: 'Importação em Lote via Excel',
      desc: 'Como importar até 500 anilhas de uma só vez usando o modelo padrão (.xlsx).',
      icon: FileText,
      time: '2 min de leitura'
    },
  ];

  const faqs = [
    {
      q: 'Como gerar o crachá e o QR Code de uma ave?',
      a: 'Acesse o menu "Aves", clique no botão de Crachá ou QR Code no card da ave. Você pode imprimir diretamente em impressora comum ou baixar a imagem PNG em alta resolução.'
    },
    {
      q: 'Como funciona o cálculo de consanguinidade?',
      a: 'O sistema cruza automaticamente a linhagem de 3 gerações de ambos os indivíduos selecionados e calcula o coeficiente de parentesco, emitindo um alerta visual em caso de irmãos ou cruzamento direto com pais.'
    },
    {
      q: 'Os dados do meu criatório ficam visíveis para outros usuários?',
      a: 'Não. O BIRDPRO possui arquitetura multi-tenant isolada por criptografia. Somente as aves que você marcar explicitamente como "Públicas" aparecerão na sua página pública de criador.'
    },
    {
      q: 'Como exportar os dados do meu plantel para o SISPASS ou órgãos ambientais?',
      a: 'No módulo "Relatórios & Exportações", você pode exportar a lista completa de anilhas e plantel em formato Excel (.xlsx) ou CSV com 1 clique.'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 shadow-lg space-y-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Central de Ajuda & Base de Conhecimento</h1>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-xl mx-auto">
          Tutoriais passo a passo, boas práticas zootécnicas e respostas para as dúvidas mais frequentes.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="O que você precisa aprender hoje?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white text-slate-900 text-xs rounded-2xl shadow-md focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Guides Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guides.map((g, idx) => {
          const Icon = g.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between cursor-pointer">
              <div>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">{g.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{g.desc}</p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <PlayCircle className="w-3.5 h-3.5" />
                {g.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Perguntas Frequentes (FAQ)</h3>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-2 border-l-2 border-emerald-500 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
