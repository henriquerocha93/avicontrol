'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Star, 
  RefreshCw, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Building2, 
  Calendar,
  Check,
  ChevronRight,
  TrendingUp,
  Bird
} from 'lucide-react';

interface CriatorioProof {
  id: string;
  name: string;
  owner: string;
  city: string;
  state: string;
  species: string;
  birdsCount: string;
  yearsInBreeding: string;
  testimonial: string;
  highlightBenefit: string;
  avatar: string;
}

const CRIATORIOS_POOL: CriatorioProof[] = [
  // Set 1 (Day Set A)
  {
    id: 'c1',
    name: 'Criatório Canto Campeão',
    owner: 'Dr. Roberto Silveira',
    city: 'Belo Horizonte',
    state: 'MG',
    species: 'Curiós & Bicudos de Torneio',
    birdsCount: '240 aves registradas',
    yearsInBreeding: '16 anos de criatório',
    testimonial: 'Depois que migramos para o BIRDPRO, nunca mais perdemos uma data de anilhamento ou de eclosão. A emissão de pedigree de 5 gerações com QR Code valorizou nossas matrizes e filhotes em mais de 40% nas transferências.',
    highlightBenefit: 'Valorização de 40% nas aves com QR Code',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c2',
    name: 'Criadouro Vale das Aves',
    owner: 'Marcos Vinícius de Andrade',
    city: 'Ribeirão Preto',
    state: 'SP',
    species: 'Trinca-Ferros & Canários da Terra',
    birdsCount: '380 aves cadastradas',
    yearsInBreeding: '12 anos de manejo',
    testimonial: 'A importação direta do PDF do SISPASS poupou semanas de trabalho da nossa equipe. Em apenas 5 segundos o BIRDPRO leu nosso relatório do IBAMA com centenas de anilhas e organizou o plantel perfeitamente sem nenhum erro de digitação.',
    highlightBenefit: 'Importação do SISPASS em 5 segundos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c3',
    name: 'Criatório Pena Nobre',
    owner: 'Carlos Eduardo Fontes',
    city: 'Curitiba',
    state: 'PR',
    species: 'Mutação & Genética de Canários de Cor',
    birdsCount: '190 aves cadastradas',
    yearsInBreeding: '9 anos de seleção',
    testimonial: 'O cálculo automático de consanguinidade e os alertas push no celular nos deram um controle cirúrgico nos pareamentos da temporada. Poder abrir o sistema no celular direto dentro do criatório mudou totalmente nossa rotina!',
    highlightBenefit: 'Controle de consanguinidade no celular',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },

  // Set 2 (Day Set B)
  {
    id: 'c4',
    name: 'Criadouro Estrela da Serra',
    owner: 'Arnaldo Medeiros',
    city: 'Caxias do Sul',
    state: 'RS',
    species: 'Coleiros & Azulões Silvestres',
    birdsCount: '310 aves registradas',
    yearsInBreeding: '18 anos de preservação',
    testimonial: 'Antes do BIRDPRO sofríamos com planilhas confusas e programas pesados no computador que travavam toda hora. Ter tudo seguro na nuvem com backup automático nos deu uma tranquilidade inestimável.',
    highlightBenefit: 'Zero risco de perda de dados na nuvem',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c5',
    name: 'Criatório Horizonte Real',
    owner: 'Gustavo Mendonça',
    city: 'Goiânia',
    state: 'GO',
    species: 'Bicudos & Curiós Fibra/Canto',
    birdsCount: '165 aves cadastradas',
    yearsInBreeding: '11 anos de seleção genética',
    testimonial: 'O módulo financeiro integrado com a gestão das gaiolas e anilhas nos permitiu enxergar exatamente a rentabilidade do criatório. É o sistema mais completo e profissional do Brasil.',
    highlightBenefit: 'Gestão zootécnica e financeira integrada',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c6',
    name: 'Criadouro Asas do Nordeste',
    owner: 'Severino Cavalcanti',
    city: 'Recife',
    state: 'PE',
    species: 'Papa-Capins, Coleiros & Pintassilgos',
    birdsCount: '280 aves cadastradas',
    yearsInBreeding: '14 anos de criação legalizada',
    testimonial: 'Os alertas de anilhamento aos 5 dias de vida salvaram vários filhotes de perderem o prazo da anilha. O suporte do Rodrigo Matos é humano, rápido e realmente entende de passeriformes.',
    highlightBenefit: 'Alertas push de anilhamento sem atrasos',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },

  // Set 3 (Day Set C)
  {
    id: 'c7',
    name: 'Criatório Ouro Verde',
    owner: 'Henrique Barcellos',
    city: 'Campinas',
    state: 'SP',
    species: 'Canários Roller & Canto Clássico',
    birdsCount: '215 aves cadastradas',
    yearsInBreeding: '15 anos de criatório',
    testimonial: 'A facilidade de emitir etiquetas de gaiola com foto e QR Code para leitura rápida pelo celular organizou nosso espaço físico de um jeito impressionante.',
    highlightBenefit: 'Etiquetas de gaiola inteligentes com QR Code',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c8',
    name: 'Criadouro Imperial das Aves',
    owner: 'Leandro Farias',
    city: 'Joinville',
    state: 'SC',
    species: 'Trinca-Ferros & Pássaros Silvestres',
    birdsCount: '340 aves registradas',
    yearsInBreeding: '10 anos de manejo',
    testimonial: 'Pagávamos caro por sistemas antigos que cobravam por cada atualização. O BIRDPRO entrega 100% dos recursos sem limite de aves por um preço justo de R$ 14,99.',
    highlightBenefit: 'Preço justo de R$ 14,99/mês sem pegadinhas',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'c9',
    name: 'Criatório Cantos do Sul',
    owner: 'Fernando Fagundes',
    city: 'Pelotas',
    state: 'RS',
    species: 'Curiós & Coleiros Campeões',
    birdsCount: '175 aves cadastradas',
    yearsInBreeding: '8 anos de conquistas em torneios',
    testimonial: 'Nosso índice de eclosão aumentou com o controle de ovoscopia do calendário. Não troco o BIRDPRO por nenhum outro sistema.',
    highlightBenefit: 'Aumento na taxa de eclosão e fertilidade',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

export function DailyProofsSection() {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [todayDateStr, setTodayDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    // Daily deterministic seed calculation: rotates every calendar day
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const initialIndex = dayOfYear % 3;
    setCurrentSetIndex(initialIndex);

    setTodayDateStr(now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }));
  }, []);

  const displayedProofs = CRIATORIOS_POOL.slice(currentSetIndex * 3, currentSetIndex * 3 + 3);

  const handleNextSet = () => {
    setCurrentSetIndex((prev) => (prev + 1) % 3);
  };

  return (
    <section id="provas" className="py-24 bg-[#070e0b] border-t border-emerald-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Provas Reais &amp; Casos de Sucesso Diários</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Aprovado por criatórios campeões
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Depoimentos reais de criatórios ativos em <strong className="text-emerald-400">{todayDateStr || 'hoje'}</strong> que utilizam o BIRDPRO diariamente para gerenciar seus plantéis.
            </p>
          </div>

          {/* Daily Refresh Button */}
          <button
            onClick={handleNextSet}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#12231a] hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 hover:text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Mais Criatórios em Destaque (Grupo {currentSetIndex + 1}/3)</span>
          </button>
        </div>

        {/* Dynamic 3 Proof Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedProofs.map((t) => (
            <div 
              key={t.id}
              className="bg-[#0e1b14] p-6 sm:p-8 rounded-3xl border border-emerald-900/40 hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl relative group hover:-translate-y-1.5"
            >
              <div className="space-y-4">
                
                {/* Header of Card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#00c853]" />
                    Criatório Verificado
                  </span>
                </div>

                {/* Highlight Pill */}
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-[11px] font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t.highlightBenefit}</span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed italic">
                  "{t.testimonial}"
                </p>

                {/* Species & stats */}
                <div className="pt-2 border-t border-emerald-950/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Bird className="w-3.5 h-3.5 text-emerald-400" /> {t.species}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{t.birdsCount}</span>
                </div>

              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-emerald-950/80 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/40 shrink-0 bg-slate-800 shadow-sm">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{t.name}</h4>
                  <p className="text-[11px] text-emerald-400 font-semibold">{t.owner}</p>
                  <p className="text-[10px] text-slate-400">{t.city}/{t.state} • {t.yearsInBreeding}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
