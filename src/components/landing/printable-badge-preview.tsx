'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, 
  Scissors, 
  CheckCircle2, 
  ShieldCheck,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintableBadgePreview() {
  const [activeTab, setActiveTab] = useState<'arvore' | 'frente' | 'ambos'>('arvore');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Mock bird and criatório data
  const birdData = {
    name: 'SOBERANO REAL',
    ringNumber: 'FOB-2024-BR-0891',
    species: 'Bicudo (Sporophila maximiliani)',
    sex: 'Macho ♂',
    birthDate: '14/10/2022',
    father: 'TROVÃO NEGRO ♂',
    fatherRing: 'FOB-2022-BR-4401',
    mother: 'RAINHA DO OURO ♀',
    motherRing: 'FOB-2023-BR-1182',
    grandparents: [
      { name: 'PANCADA', ring: 'FOB-20', male: true },
      { name: 'GOIANA', ring: 'FOB-21', male: false },
      { name: 'MONTE NEGRO', ring: 'FOB-20', male: true },
      { name: 'VIDA CMA', ring: 'FOB-21', male: false },
    ],
    greatGrandparents: [
      { name: 'VENTANIA', male: true },
      { name: 'HONDA', male: false },
      { name: 'PREDADOR', male: true },
      { name: 'SERENA', male: false },
      { name: 'ZEUS CMA', male: true },
      { name: 'LADY GAGA', male: false },
      { name: 'CARCAÇA', male: true },
      { name: 'BELEZOCA', male: false },
    ],
    coi: '3.12%',
    criatorio: 'CRIATÓRIO ELITE BRASIL',
    criador: 'Carlos Alberto Silveira',
    phone: '(11) 98765-4321',
    registry: 'SISPASS 1234567 / FOB-BR'
  };

  const publicUrl = 'https://birdpro.com.br/ave/soberano-real';

  const handlePrint = () => {
    window.print();
  };

  // Reusable Tree Card Component (Verso)
  const TreeBadgeCard = () => (
    <div className="w-full max-w-[530px] h-[330px] bg-white text-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl relative p-3 flex flex-col justify-between overflow-hidden select-none">
      {/* Cut marks in corners */}
      <span className="absolute top-1 left-1 text-[8px] font-mono text-slate-400 select-none">+</span>
      <span className="absolute top-1 right-1 text-[8px] font-mono text-slate-400 select-none">+</span>
      <span className="absolute bottom-1 left-1 text-[8px] font-mono text-slate-400 select-none">+</span>
      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-400 select-none">+</span>

      {/* Header: Criatório, BIRDPRO Logo & Anilha */}
      <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#00c853] text-white flex items-center justify-center font-black text-[10px] shadow-sm">
            BP
          </div>
          <div className="leading-tight">
            <span className="font-black text-[10px] text-slate-900 block tracking-tight uppercase">
              {birdData.criatorio}
            </span>
            <span className="text-[8px] text-slate-600 block">
              {birdData.registry}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
            ÁRVORE GENEALÓGICA OFICIAL
          </span>
          <span className="text-[7.5px] text-slate-600 block mt-0.5 font-bold">
            Consanguinidade Wright: <strong className="text-emerald-800">{birdData.coi}</strong>
          </span>
        </div>
      </div>

      {/* Ave Principal Banner */}
      <div className="bg-slate-100 border border-slate-300 rounded px-2 py-1 flex items-center justify-between text-xs">
        <div className="truncate mr-2">
          <span className="text-[8px] font-bold text-slate-500 uppercase block">Ave Cadastrada</span>
          <span className="font-black text-[11px] text-slate-950 uppercase tracking-wide truncate">
            {birdData.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-emerald-600 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded">
            {birdData.ringNumber}
          </span>
          <span className="text-[9px] font-black text-slate-700">
            {birdData.sex}
          </span>
        </div>
      </div>

      {/* Tree Body: 4 Columns with Connectors */}
      <div className="flex-1 flex items-center justify-between py-1.5 relative">
        {/* COL 1: PAIS (2 Caixas) */}
        <div className="w-[120px] h-full flex flex-col justify-around shrink-0 z-10">
          {/* Pai */}
          <div className="py-1 px-1.5 text-center text-[8px] font-black uppercase rounded border border-sky-400 bg-sky-50 text-sky-950 shadow-2xs truncate">
            <span className="text-[7px] text-sky-700 block font-bold">PAI ♂</span>
            <span className="truncate block font-extrabold">{birdData.father}</span>
            <span className="text-[6.5px] font-mono text-sky-800 block">{birdData.fatherRing}</span>
          </div>
          {/* Mãe */}
          <div className="py-1 px-1.5 text-center text-[8px] font-black uppercase rounded border border-rose-400 bg-rose-50 text-rose-950 shadow-2xs truncate">
            <span className="text-[7px] text-rose-700 block font-bold">MÃE ♀</span>
            <span className="truncate block font-extrabold">{birdData.mother}</span>
            <span className="text-[6.5px] font-mono text-rose-800 block">{birdData.motherRing}</span>
          </div>
        </div>

        {/* CONECTOR 1 -> 2 (SVG) */}
        <div className="w-[12px] h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 12 180" fill="none">
            <path d="M 0,45 H 6 V 22 H 12 M 6,45 V 68 H 12" stroke="#475569" strokeWidth="1.2" />
            <path d="M 0,135 H 6 V 112 H 12 M 6,135 V 158 H 12" stroke="#475569" strokeWidth="1.2" />
          </svg>
        </div>

        {/* COL 2: AVÓS (4 Caixas) */}
        <div className="w-[105px] h-full flex flex-col justify-around shrink-0 z-10">
          {birdData.grandparents.map((av, idx) => (
            <div 
              key={idx}
              className={`py-0.5 px-1 text-center text-[7.5px] font-black uppercase rounded border shadow-2xs truncate ${
                av.male 
                  ? 'border-sky-300 bg-sky-50/90 text-sky-950' 
                  : 'border-rose-300 bg-rose-50/90 text-rose-950'
              }`}
            >
              <span className="truncate block">{av.name} {av.male ? '♂' : '♀'}</span>
            </div>
          ))}
        </div>

        {/* CONECTOR 2 -> 3 (SVG) */}
        <div className="w-[12px] h-full relative shrink-0">
          <svg className="w-full h-full" viewBox="0 0 12 180" fill="none">
            <path d="M 0,22 H 6 V 11 H 12 M 6,22 V 33 H 12" stroke="#64748b" strokeWidth="1" />
            <path d="M 0,68 H 6 V 57 H 12 M 6,68 V 79 H 12" stroke="#64748b" strokeWidth="1" />
            <path d="M 0,112 H 6 V 101 H 12 M 6,112 V 123 H 12" stroke="#64748b" strokeWidth="1" />
            <path d="M 0,158 H 6 V 147 H 12 M 6,158 V 169 H 12" stroke="#64748b" strokeWidth="1" />
          </svg>
        </div>

        {/* COL 3: BISAVÓS (8 Caixas Compactas) */}
        <div className="w-[95px] h-full flex flex-col justify-around shrink-0 z-10">
          {birdData.greatGrandparents.map((bis, idx) => (
            <div 
              key={idx}
              className={`py-0.2 px-1 text-center text-[6.5px] font-bold uppercase rounded border truncate ${
                bis.male 
                  ? 'border-sky-200 bg-sky-50/80 text-sky-900' 
                  : 'border-rose-200 bg-rose-50/80 text-rose-900'
              }`}
            >
              {bis.name}
            </div>
          ))}
        </div>

        {/* Scannable Real QR Code on the side */}
        <div className="w-[55px] flex flex-col items-center justify-center pl-1 border-l border-slate-200 shrink-0">
          <div className="p-1 bg-white border border-slate-400 rounded shadow-xs">
            <QRCodeSVG value={publicUrl} size={38} level="M" />
          </div>
          <span className="text-[6px] font-black text-slate-700 text-center leading-tight mt-1 block">
            Validar
          </span>
        </div>
      </div>

      {/* Footer: Authentic Security & System Signature */}
      <div className="border-t border-slate-300 pt-1 flex items-center justify-between text-[7.5px] text-slate-600">
        <div className="flex items-center gap-1 text-emerald-800 font-bold">
          <ShieldCheck className="w-3 h-3 text-[#00c853]" />
          <span>Autenticidade Criptografada • BIRDPRO 2026</span>
        </div>
        <span className="font-mono text-slate-500 font-bold">
          birdpro.com.br/ave/soberano-real
        </span>
      </div>
    </div>
  );

  // Reusable Front Card Component (Frente)
  const FrontBadgeCard = () => (
    <div className="w-full max-w-[530px] h-[330px] bg-white text-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl relative p-3 flex flex-col justify-between overflow-hidden select-none">
      {/* Cut marks */}
      <span className="absolute top-1 left-1 text-[8px] font-mono text-slate-400 select-none">+</span>
      <span className="absolute top-1 right-1 text-[8px] font-mono text-slate-400 select-none">+</span>
      <span className="absolute bottom-1 left-1 text-[8px] font-mono text-slate-400 select-none">+</span>
      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-400 select-none">+</span>

      {/* Top Row: Brasão + Nome da Ave + Pais */}
      <div className="flex gap-3">
        {/* Brasão do Criatório */}
        <div className="w-24 shrink-0 flex flex-col items-center justify-center text-center p-1 bg-amber-50/60 rounded-lg border border-amber-300">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white font-black text-xs shadow-md border-2 border-white">
            👑
          </div>
          <span className="text-[8px] font-black text-amber-900 mt-1 uppercase block leading-tight">
            CRIATÓRIO ELITE
          </span>
          <span className="text-[6.5px] text-amber-700 block font-bold">
            BRASIL
          </span>
        </div>

        {/* Identificação Principal */}
        <div className="flex-1 space-y-1">
          <div>
            <span className="text-[7.5px] font-bold uppercase text-slate-500 block">Nome da Ave</span>
            <div className="bg-slate-100 border border-slate-400 px-2 py-1 text-center font-black text-sm uppercase text-slate-950 truncate tracking-wide rounded">
              {birdData.name}
            </div>
          </div>

          {/* Pais */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <span className="text-[7px] font-bold uppercase text-slate-500 block">Pai</span>
              <div className="border border-sky-400 bg-sky-50 text-sky-950 px-1.5 py-0.5 text-center font-extrabold text-[9px] uppercase truncate rounded">
                {birdData.father}
              </div>
            </div>
            <div>
              <span className="text-[7px] font-bold uppercase text-slate-500 block">Mãe</span>
              <div className="border border-rose-400 bg-rose-50 text-rose-950 px-1.5 py-0.5 text-center font-extrabold text-[9px] uppercase truncate rounded">
                {birdData.mother}
              </div>
            </div>
          </div>

          {/* Nascimento + Sexo */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <div className="border border-slate-300 bg-slate-50 px-1 py-0.5 text-center text-[8px] rounded">
              <strong className="text-slate-500">NASC:</strong> {birdData.birthDate}
            </div>
            <div className="border border-slate-300 bg-slate-50 px-1 py-0.5 text-center text-[8px] rounded">
              <strong className="text-slate-500">SEXO:</strong> {birdData.sex}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Anilha Oficial & Registro */}
      <div className="grid grid-cols-12 gap-2 pt-1">
        <div className="col-span-8 bg-slate-100 border-2 border-emerald-600 rounded p-1.5 text-center">
          <span className="text-[7px] font-bold uppercase text-emerald-800 block">Anilha Oficial (FOB / SISPASS)</span>
          <span className="font-mono font-black text-xs text-emerald-950 tracking-wider">
            {birdData.ringNumber}
          </span>
        </div>
        <div className="col-span-4 bg-slate-100 border border-slate-400 rounded p-1.5 text-center">
          <span className="text-[7px] font-bold uppercase text-slate-600 block">Nº SISPASS</span>
          <span className="font-mono font-bold text-xs text-slate-900">
            1234567
          </span>
        </div>
      </div>

      {/* Bottom Row: Proprietário + QR Code Gaiola */}
      <div className="border-t border-slate-300 pt-1.5 flex items-center justify-between">
        <div>
          <span className="text-[7px] font-bold uppercase text-slate-500 block">Proprietário Responsável</span>
          <div className="text-[9px] font-black text-slate-900">
            {birdData.criador} • {birdData.phone}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-0.5 bg-white border border-slate-400 rounded">
            <QRCodeSVG value={publicUrl} size={30} level="M" />
          </div>
          <div className="leading-tight text-right">
            <span className="font-black text-[9px] text-[#00c853] block">BIRDPRO</span>
            <span className="text-[6.5px] text-slate-500">www.birdpro.com.br</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 font-sans w-full max-w-full overflow-hidden">
      
      {/* Top Controls: View Selector & Print Simulator Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-emerald-900/50">
        
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#07130d] p-1 rounded-xl border border-emerald-800/60">
          <button
            type="button"
            onClick={() => setActiveTab('arvore')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
              activeTab === 'arvore'
                ? 'bg-gradient-to-r from-[#00c853] to-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌳 Árvore Genealógica (Verso)
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('frente')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
              activeTab === 'frente'
                ? 'bg-gradient-to-r from-[#00c853] to-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏷️ Etiqueta de Gaiola (Frente)
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('ambos')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'ambos'
                ? 'bg-gradient-to-r from-[#00c853] to-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3 h-3" />
            <span>Frente &amp; Verso</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => setIsPrintModalOpen(true)}
          className="px-3 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 hover:text-white text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-[#00c853]" />
          <span>Simular Impressão</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* BADGE CANVAS CONTAINER (100% WIDTH, NO HORIZONTAL SCROLLBAR)              */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#051009] border border-emerald-700/40 shadow-inner overflow-hidden flex flex-col items-center justify-center w-full">
        
        {/* Tab 1: Árvore Genealógica */}
        {activeTab === 'arvore' && (
          <TreeBadgeCard />
        )}

        {/* Tab 2: Frente da Etiqueta */}
        {activeTab === 'frente' && (
          <FrontBadgeCard />
        )}

        {/* Tab 3: Frente & Verso (Empilhado verticalmente com linha de dobra — Zero Scrollbar) */}
        {activeTab === 'ambos' && (
          <div className="w-full flex flex-col items-center gap-3">
            <FrontBadgeCard />
            
            {/* Linha de Corte e Dobra para Plastificação */}
            <div className="w-full max-w-[530px] flex items-center justify-center gap-2 py-1 text-emerald-400 text-xs font-bold">
              <div className="flex-1 border-t-2 border-dashed border-emerald-500/50" />
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-[10px] text-emerald-300">
                <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                Linha de dobra para plastificação (Frente &amp; Verso)
              </span>
              <div className="flex-1 border-t-2 border-dashed border-emerald-500/50" />
            </div>

            <TreeBadgeCard />
          </div>
        )}

      </div>

      {/* Physical Spec & Print Quality Badge */}
      <div className="p-2.5 rounded-xl bg-[#091710] border border-emerald-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-[#00c853] shrink-0" />
          <span className="text-[11px] font-medium">
            <strong>Dimensões Exatas:</strong> 100 x 60 mm (cabe perfeitamente em porta-crachás de gaiola)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>✓ 300 DPI (Alta Resolução)</span>
          <span>✓ QR Code Criptografado</span>
          <button
            type="button"
            onClick={handlePrint}
            className="text-emerald-400 hover:text-white font-bold underline cursor-pointer"
          >
            Imprimir Agora →
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMULATED PRINT PREVIEW MODAL                                             */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#0b1c14] border border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl relative text-white">
            
            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">
                  Pré-visualização de Impressão do Crachá
                </h4>
                <p className="text-xs text-slate-400">
                  Formato folha A4 com guias de recorte para impressoras jato de tinta ou laser
                </p>
              </div>
            </div>

            {/* Print Settings Info */}
            <div className="p-4 rounded-2xl bg-[#07130d] border border-emerald-800/60 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-900/60">
                <span className="text-slate-300 font-bold">Tipo de Papel Recomendado:</span>
                <span className="text-emerald-400 font-bold">Fotográfico Glossy 180g ou Couché 240g</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-900/60">
                <span className="text-slate-300 font-bold">Tamanho por Crachá:</span>
                <span className="text-white font-mono">10,0 cm x 6,0 cm (Padrão FOB Oficial)</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-900/60">
                <span className="text-slate-300 font-bold">Rendimento por Folha A4:</span>
                <span className="text-emerald-300 font-bold">Até 8 crachás por página A4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-bold">Validação Pública:</span>
                <span className="text-emerald-400 font-bold">QR Code ativo com página oficial</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                onClick={handlePrint}
                className="w-full sm:flex-1 bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs sm:text-sm py-3 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir Crachá Agora (Abrir Diálogo de Impressão)
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPrintModalOpen(false)}
                className="w-full sm:w-auto border-emerald-700 hover:bg-emerald-950/80 text-white font-bold text-xs py-3 cursor-pointer"
              >
                Fechar
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
