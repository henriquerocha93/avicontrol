'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  ChevronDown, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  CircleDot, 
  Heart, 
  Smartphone, 
  ArrowRight,
  Bird,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FaqItem {
  q: string;
  a: string;
  category: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Geral & Criatório',
    q: 'O que é o BIRDPRO e como ele ajuda criadores de aves?',
    a: 'O BIRDPRO é a plataforma em nuvem líder no Brasil desenvolvida especificamente para gestão zootécnica de criatórios amadores e comerciais de aves (passeriformes, psitacídeos e exóticos). Ele elimina cadernos e planilhas, reunindo em uma única interface moderna o controle de plantel, anilhas SISPASS e FOB, acasalamentos, genealogia de até 5 gerações com cálculo de consanguinidade Wright, ovoscopia, saúde e emissão de pedigree A4 oficial com validação pública via QR Code.'
  },
  {
    category: 'SISPASS / IBAMA',
    q: 'Como funciona a importação de anilhas do SISPASS / IBAMA?',
    a: 'Com o BIRDPRO você não precisa digitar suas anilhas manualmente uma a uma. Basta exportar o arquivo PDF do seu relatório oficial de plantel no SISPASS/IBAMA e fazer o upload na plataforma. Nosso importador inteligente lê e cadastra centenas de anilhas e dados de registro em menos de 5 segundos, com 100% de exatidão e sem risco de anilhas duplicadas.'
  },
  {
    category: 'Pedigree & QR Code',
    q: 'O BIRDPRO emite Pedigree A4 oficial e crachá de gaiola com QR Code?',
    a: 'Sim! Você gera certificados genealógicos em formato A4 de alta resolução, prontos para impressão ou compartilhamento em PDF, além de crachás frontais e traseiros para gaiolas. Cada documento conta com um QR Code único e criptografado que, ao ser escaneado por qualquer smartphone, abre a página pública oficial de autenticidade e linhagem da ave.'
  },
  {
    category: 'Genética & Manejo',
    q: 'Como o BIRDPRO calcula a consanguinidade genética (Coeficiente de Wright)?',
    a: 'A plataforma possui um algoritmo genético avançado que analisa os ancestrais da ave através de até 5 gerações (pais, avós, bisavós, trisavós e tetravós). O cálculo instantâneo do Coeficiente de Wright alerta visualmente sobre cruzamentos com consanguinidade excessiva, auxiliando a evitar defeitos congênitos e a potencializar a fixação de qualidades desejadas de canto, cor e porte.'
  },
  {
    category: 'Acesso & Aplicativo',
    q: 'Posso usar o BIRDPRO no celular, tablet e computador?',
    a: 'Sim, o BIRDPRO é 100% em nuvem e funciona como Aplicativo Progressivo (PWA). Você pode acessar através do navegador em qualquer computador (Windows ou Mac) ou instalar diretamente no seu celular (Android ou iPhone / iOS) com apenas um toque, sincronizado em tempo real e com suporte a notificações inteligentes de choco e anilhamento.'
  },
  {
    category: 'Espécies Atendidas',
    q: 'Quais espécies de aves são atendidas pelo sistema?',
    a: 'O BIRDPRO atende todas as espécies da ornitofilia brasileira e mundial: Curió, Trinca-Ferro, Coleiro / Papa-Capim, Canário da Terra, Canário Belga (Roller, Cor e Porte), Bicudo, Azulão, Pintassilgo, Calopsita, Agapornis, Ring Neck, Papagaios, Periquitos Australianos, Diamante de Gould, Manon e exóticos em geral.'
  },
  {
    category: 'Segurança & Nuvem',
    q: 'Meus dados e histórico do plantel estão seguros contra perdas?',
    a: 'Totalmente. Ao contrário de programas antigos instalados em computadores locais que sofrem com panes de hardware e vírus, o BIRDPRO armazena todos os seus dados em servidores de alta segurança em nuvem, com criptografia SSL/TLS e backups redundantes automáticos diários. Se você trocar de celular ou computador, seus dados continuam 100% preservados.'
  },
  {
    category: 'Planos & Pagamento',
    q: 'Qual é o valor da assinatura do BIRDPRO e como começar?',
    a: 'O BIRDPRO oferece planos acessíveis a partir de R$ 14,99 por mês no Plano Mensal (sem fidelidade) ou R$ 169,99 no Plano Anual (com desconto especial de 20%). A liberação é imediata e 100% automatizada após o pagamento via PIX, permitindo cadastrar aves, gaiolas e anilhas ilimitadas sem taxas ocultas.'
  }
];

export const SPECIES_SHOWCASE = [
  {
    name: 'Curió',
    scientific: 'Sporophila angolensis',
    tag: 'Passeriforme Nativo',
    highlights: 'Canto Praia Grande, Repetidor, Fibra',
  },
  {
    name: 'Trinca-Ferro',
    scientific: 'Saltator similis',
    tag: 'Passeriforme Nativo',
    highlights: 'Canto Pixarro, Currucutil, Fibra',
  },
  {
    name: 'Coleiro / Papa-Capim',
    scientific: 'Sporophila caerulescens',
    tag: 'Passeriforme Nativo',
    highlights: 'Tui Tui Zero Zero, Fibra, Velocidade',
  },
  {
    name: 'Canário da Terra',
    scientific: 'Sicalis flaveola',
    tag: 'Passeriforme Nativo',
    highlights: 'Canto Estalo, Retratado, Linhagens de Fibra',
  },
  {
    name: 'Canário Belga / Reino',
    scientific: 'Serinus canaria',
    tag: 'Canaricultura de Cor & Porte',
    highlights: 'Roller, Linha Clara, Mosaico, Gloster, Topete',
  },
  {
    name: 'Bicudo',
    scientific: 'Sporophila maximiliani',
    tag: 'Passeriforme Nativo',
    highlights: 'Canto Flauta, Goiano, Preservação e Porte',
  },
  {
    name: 'Azulão',
    scientific: 'Cyanoloxia brissonii',
    tag: 'Passeriforme Nativo',
    highlights: 'Canto Paraná, Canto Alagoas, Manejo Reprodutivo',
  },
  {
    name: 'Calopsita & Psitacídeos',
    scientific: 'Nymphicus hollandicus',
    tag: 'Psitacicultura & Exóticos',
    highlights: 'Lutino, Cara Branca, Pérola, Agapornis, Ringneck',
  },
];

export function FaqAndSeoSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <section id="faq" className="mt-16 pt-12 border-t border-emerald-900/40 space-y-16">
      {/* Schema.org FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ===================================================================== */}
      {/* FAQ SECTION (PERGUNTAS FREQUENTES)                                    */}
      {/* ===================================================================== */}
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Perguntas Frequentes sobre o BIRDPRO
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            Tudo o que você precisa saber sobre controle de anilhas, importação SISPASS, emissão de pedigree A4, consanguinidade e assinatura.
          </p>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#0b1c13] border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                    : 'bg-[#091510]/80 border-emerald-900/40 hover:border-emerald-700/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {item.q}
                    </h3>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                      isOpen
                        ? 'bg-emerald-500 text-black border-emerald-400 rotate-180'
                        : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-emerald-900/40 animate-in fade-in duration-200">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Help Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#0c2418] border border-emerald-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Ainda tem alguma dúvida sobre seu criatório?
            </h4>
            <p className="text-xs text-slate-300">
              Nossa equipe de suporte está pronta para ajudar você a modernizar seu plantel.
            </p>
          </div>
          <Link href="/checkout?plano=anual" className="w-full sm:w-auto">
            <Button size="sm" className="w-full bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs px-5 py-2.5 shadow-md">
              Começar Agora por R$ 14,99/mês →
            </Button>
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ESPÉCIES ATENDIDAS & TOPICAL AUTHORITY                                 */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Bird className="w-3.5 h-3.5" /> Compatibilidade Total
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Desenvolvido para as Principais Espécies Criadas no Brasil
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Fichas zootécnicas com tempos biológicos de choco, postura, anilhamento e genealogia sob medida:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {SPECIES_SHOWCASE.map((sp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#091510]/85 border border-emerald-900/40 hover:border-emerald-600/50 transition-all duration-200 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800/60">
                  {sp.tag}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00c853]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{sp.name}</h3>
                <p className="text-[11px] italic text-slate-400">{sp.scientific}</p>
              </div>
              <p className="text-[11px] text-slate-300 pt-1 border-t border-emerald-950/80">
                {sp.highlights}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SEO PILLARS & KEYWORDS CLUSTER                                        */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#07130d] border border-emerald-900/50 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          Tecnologia Zootécnica de Alta Performance para Criatórios de Aves
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          O <strong>BIRDPRO</strong> é a solução definitiva para ornitófilos e criadores que buscam excelência no <strong>controle de anilhas SISPASS e FOB</strong>, <strong>genealogia de aves com cálculo de consanguinidade Wright</strong>, <strong>emissão de pedigree oficial em formato A4</strong>, <strong>crachá de gaiola com QR Code</strong>, <strong>manejo reprodutivo de ovoscopia e postura</strong>, e <strong>prontuário sanitário veterinário</strong>. Acesse em qualquer dispositivo móvel ou computador, com segurança em nuvem e backups automatizados.
        </p>

        {/* Quick Search Tag Pills */}
        <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50">Software para Criatório de Aves</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50">Sistema SISPASS IBAMA</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50">Pedigree A4 com QR Code</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50">Cálculo de Consanguinidade Wright</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50">Criatório de Curió e Trinca-Ferro</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50">Canaricultura & Belga</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50">Controle de Choco e Ovoscopia</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50">Anilhas FOB Oficiais</span>
        </div>
      </div>
    </section>
  );
}
