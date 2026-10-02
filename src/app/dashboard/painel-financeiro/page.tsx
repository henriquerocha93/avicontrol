'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart2, 
  TrendingUp, 
  LineChart as LineChartIcon,
  Layers, 
  DollarSign, 
  Package, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Calendar,
  Wallet,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function PainelFinanceiroPage() {
  // Chart view modes (Line or Bar)
  const [vendaChartType, setVendaChartType] = useState<'line' | 'bar'>('line');
  const [reservaChartType, setReservaChartType] = useState<'line' | 'bar'>('line');
  const [recGastoChartType, setRecGastoChartType] = useState<'line' | 'bar'>('line');

  // Sub-filter tab states for breakdown boxes
  const [vendaSexoFilter, setVendaSexoFilter] = useState<'qtd' | 'valor' | 'media'>('valor');
  const [vendaEspecieFilter, setVendaEspecieFilter] = useState<'qtd' | 'valor' | 'media'>('valor');

  // Sample data for charts matching the screenshots
  const vendaData = [
    { mes: 'Jan', valor: 0.1, qtd: 2, media: 0.05 },
    { mes: 'Fev', valor: 0.2, qtd: 3, media: 0.07 },
    { mes: 'Mar', valor: 0.4, qtd: 5, media: 0.08 },
    { mes: 'Abr', valor: 0.3, qtd: 4, media: 0.075 },
    { mes: 'Mai', valor: 0.6, qtd: 7, media: 0.085 },
    { mes: 'Jun', valor: 0.5, qtd: 6, media: 0.083 },
    { mes: 'Jul', valor: 0.7, qtd: 8, media: 0.087 },
    { mes: 'Ago', valor: 0.6, qtd: 7, media: 0.085 },
    { mes: 'Set', valor: 0.8, qtd: 9, media: 0.088 },
    { mes: 'Out', valor: 0.0, qtd: 0, media: 0.0 }
  ];

  const reservaData = [
    { mes: 'Jan', valor: 0.2, reservas: 3 },
    { mes: 'Fev', valor: 0.3, reservas: 4 },
    { mes: 'Mar', valor: 0.5, reservas: 6 },
    { mes: 'Abr', valor: 0.4, reservas: 5 },
    { mes: 'Mai', valor: 0.7, reservas: 8 },
    { mes: 'Jun', valor: 0.6, reservas: 7 },
    { mes: 'Jul', valor: 0.8, reservas: 9 },
    { mes: 'Ago', valor: 0.7, reservas: 8 },
    { mes: 'Set', valor: 0.9, reservas: 11 },
    { mes: 'Out', valor: 0.0, reservas: 0 }
  ];

  const recVsGastoData = [
    { mes: 'Jan', recebimento: 0.3, gasto: 0.2 },
    { mes: 'Fev', recebimento: 0.4, gasto: 0.25 },
    { mes: 'Mar', recebimento: 0.6, gasto: 0.35 },
    { mes: 'Abr', recebimento: 0.5, gasto: 0.3 },
    { mes: 'Mai', recebimento: 0.8, gasto: 0.45 },
    { mes: 'Jun', recebimento: 0.7, gasto: 0.4 },
    { mes: 'Jul', recebimento: 0.9, gasto: 0.5 },
    { mes: 'Ago', recebimento: 0.85, gasto: 0.48 },
    { mes: 'Set', recebimento: 1.0, gasto: 0.55 },
    { mes: 'Out', recebimento: 0.0, gasto: 0.0 }
  ];

  // Venda por Sexo
  const sexoData = [
    { name: 'Macho', valor: 65, qtd: 13, media: 5.0, color: '#0284c7' },
    { name: 'Fêmea', valor: 30, qtd: 6, media: 5.0, color: '#ec4899' },
    { name: 'Indeterminado', valor: 5, qtd: 1, media: 5.0, color: '#94a3b8' }
  ];

  // Venda por Espécie
  const especieData = [
    { name: 'Curió', valor: 45, qtd: 9, media: 5.0, color: '#00c853' },
    { name: 'Bicudo', valor: 25, qtd: 5, media: 5.0, color: '#3b82f6' },
    { name: 'Trinca-Ferro', valor: 15, qtd: 3, media: 5.0, color: '#f59e0b' },
    { name: 'Canário da Terra', valor: 10, qtd: 2, media: 5.0, color: '#8b5cf6' },
    { name: 'Coleiro', valor: 5, qtd: 1, media: 5.0, color: '#06b6d4' }
  ];

  // Classificação Mês Atual
  const contasReceberClassificacao = [
    { categoria: 'Venda de Filhotes / Aves', valor: 'R$ 0,00', percent: '0%' },
    { categoria: 'Serviços de Pareamento & Consultoria', valor: 'R$ 0,00', percent: '0%' },
    { categoria: 'Inscrições em Torneios', valor: 'R$ 0,00', percent: '0%' },
    { categoria: 'Outras Receitas', valor: 'R$ 0,00', percent: '0%' }
  ];

  const contasPagarClassificacao = [
    { categoria: 'Alimentação / Farinhadas & Sementes', valor: 'R$ 0,00', percent: '0%' },
    { categoria: 'Anilhas Oficiais SISPASS / FOB', valor: 'R$ 0,00', percent: '0%' },
    { categoria: 'Medicamentos, Vacinas & Vitaminas', valor: 'R$ 0,00', percent: '0%' },
    { categoria: 'Gaiolas, Ninhos & Acessórios', valor: 'R$ 0,00', percent: '0%' },
    { categoria: 'Manutenção & Energia do Criatório', valor: 'R$ 0,00', percent: '0%' }
  ];

  // DRE Mês Atual
  const dreReceber = [
    { item: 'Receita Bruta com Vendas', valor: 'R$ 0,00' },
    { item: '(-) Descontos Concedidos', valor: 'R$ 0,00' },
    { item: '(=) Receita Operacional Líquida', valor: 'R$ 0,00', isBold: true }
  ];

  const drePagar = [
    { item: 'Custos Diretos com Manejo & Plantel', valor: 'R$ 0,00' },
    { item: 'Despesas Administrativas & Sistemas', valor: 'R$ 0,00' },
    { item: '(=) Total de Despesas do Período', valor: 'R$ 0,00', isBold: true }
  ];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 bg-[#f4f6f9] -m-6 p-6 min-h-screen">
      
      {/* ========================================================================= */}
      {/* 1. BREADCRUMB                                                             */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-1.5 text-xs text-[#0284c7] font-medium">
        <Link href="/dashboard" className="hover:underline">Home</Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500">Painel Financeiro</span>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 4 SOLID COLOR KPI CARDS (Exact match to print 1)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Caixa (Light Blue) */}
        <div className="bg-[#4fc3f7] text-white p-6 rounded-lg shadow-xs flex flex-col justify-between h-32 transition-transform hover:scale-[1.01]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">R$ 0,00</h2>
            <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">Caixa</p>
          </div>
        </div>

        {/* Card 2: Recebimento do Mês (Medium Blue) */}
        <div className="bg-[#0288d1] text-white p-6 rounded-lg shadow-xs flex flex-col justify-between h-32 transition-transform hover:scale-[1.01]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">R$ 0,00</h2>
            <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">Recebimento do Mês</p>
          </div>
        </div>

        {/* Card 3: Gasto do Mês (Coral Red) */}
        <div className="bg-[#ef5350] text-white p-6 rounded-lg shadow-xs flex flex-col justify-between h-32 transition-transform hover:scale-[1.01]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">R$ 0,00</h2>
            <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">Gasto do Mês</p>
          </div>
        </div>

        {/* Card 4: Total Venda do Mês (Green) */}
        <div className="bg-[#4caf50] text-white p-6 rounded-lg shadow-xs flex flex-col justify-between h-32 transition-transform hover:scale-[1.01]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">R$ 0,00</h2>
            <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">Total Venda do Mês</p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. CHART: VENDA (Full Width with Chart Type Toggle)                       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Venda</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVendaChartType('bar')}
              className={`p-1.5 rounded transition ${vendaChartType === 'bar' ? 'text-[#0284c7] bg-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
              title="Gráfico em Barras"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVendaChartType('line')}
              className={`p-1.5 rounded transition ${vendaChartType === 'line' ? 'text-[#0284c7] bg-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
              title="Gráfico em Linha"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="p-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            {vendaChartType === 'line' ? (
              <LineChart data={vendaData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, 1.0]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} activeDot={{ r: 5 }} />
              </LineChart>
            ) : (
              <BarChart data={vendaData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, 1.0]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="valor" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TWO HALF-WIDTH BOXES: VENDA SEXO & VENDA ESPÉCIE                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Venda Sexo - Valor */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Venda Sexo - Valor</h4>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#0284c7]">
              <button 
                onClick={() => setVendaSexoFilter('qtd')} 
                className={`flex items-center gap-1 hover:underline cursor-pointer ${vendaSexoFilter === 'qtd' ? 'font-bold underline' : 'opacity-80'}`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Quantidade</span>
              </button>
              <button 
                onClick={() => setVendaSexoFilter('valor')} 
                className={`flex items-center gap-1 hover:underline cursor-pointer ${vendaSexoFilter === 'valor' ? 'font-bold underline' : 'opacity-80'}`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Valor</span>
              </button>
              <button 
                onClick={() => setVendaSexoFilter('media')} 
                className={`flex items-center gap-1 hover:underline cursor-pointer ${vendaSexoFilter === 'media' ? 'font-bold underline' : 'opacity-80'}`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Média</span>
              </button>
            </div>
          </div>

          <div className="p-6 h-56 flex items-center justify-center">
            {sexoData.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum dado registrado para o período.</p>
            ) : (
              <div className="w-full grid grid-cols-2 items-center gap-4">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sexoData}
                        dataKey={vendaSexoFilter === 'qtd' ? 'qtd' : 'valor'}
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={4}
                      >
                        {sexoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-xs">
                  {sexoData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {vendaSexoFilter === 'qtd' ? `${item.qtd} aves` : vendaSexoFilter === 'valor' ? `${item.valor}%` : `R$ ${item.media.toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Venda Espécie - Valor */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Venda Espécie - Valor</h4>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#0284c7]">
              <button 
                onClick={() => setVendaEspecieFilter('qtd')} 
                className={`flex items-center gap-1 hover:underline cursor-pointer ${vendaEspecieFilter === 'qtd' ? 'font-bold underline' : 'opacity-80'}`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Quantidade</span>
              </button>
              <button 
                onClick={() => setVendaEspecieFilter('valor')} 
                className={`flex items-center gap-1 hover:underline cursor-pointer ${vendaEspecieFilter === 'valor' ? 'font-bold underline' : 'opacity-80'}`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Valor</span>
              </button>
              <button 
                onClick={() => setVendaEspecieFilter('media')} 
                className={`flex items-center gap-1 hover:underline cursor-pointer ${vendaEspecieFilter === 'media' ? 'font-bold underline' : 'opacity-80'}`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Média</span>
              </button>
            </div>
          </div>

          <div className="p-6 h-56 flex items-center justify-center">
            <div className="w-full space-y-2 text-xs">
              {especieData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold">{item.name}</span>
                    <span className="font-bold text-slate-900">
                      {vendaEspecieFilter === 'qtd' ? `${item.qtd} aves` : vendaEspecieFilter === 'valor' ? `${item.valor}%` : `R$ ${item.media.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.valor}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. CHART: RESERVA (Screenshot 2)                                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Reserva</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReservaChartType('bar')}
              className={`p-1.5 rounded transition ${reservaChartType === 'bar' ? 'text-[#0284c7] bg-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
              title="Gráfico em Barras"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReservaChartType('line')}
              className={`p-1.5 rounded transition ${reservaChartType === 'line' ? 'text-[#0284c7] bg-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
              title="Gráfico em Linha"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="p-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            {reservaChartType === 'line' ? (
              <LineChart data={reservaData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, 1.0]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
              </LineChart>
            ) : (
              <BarChart data={reservaData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, 1.0]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. CHART: RECEBIMENTO X GASTO (Screenshot 3)                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Recebimento x Gasto</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRecGastoChartType('bar')}
              className={`p-1.5 rounded transition ${recGastoChartType === 'bar' ? 'text-[#0284c7] bg-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
              title="Gráfico em Barras"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRecGastoChartType('line')}
              className={`p-1.5 rounded transition ${recGastoChartType === 'line' ? 'text-[#0284c7] bg-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
              title="Gráfico em Linha"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="p-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            {recGastoChartType === 'line' ? (
              <LineChart data={recVsGastoData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, 1.0]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" name="Recebimento" dataKey="recebimento" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} />
                <Line type="monotone" name="Gasto" dataKey="gasto" stroke="#ef5350" strokeWidth={2.5} dot={{ r: 3, fill: '#ef5350' }} />
              </LineChart>
            ) : (
              <BarChart data={recVsGastoData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, 1.0]} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar name="Recebimento" dataKey="recebimento" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar name="Gasto" dataKey="gasto" fill="#ef5350" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. TWO HALF-WIDTH BOXES: CONTAS CLASSIFICAÇÃO MÊS ATUAL (Screenshot 3)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Contas a Receber Classificação Mês Atual */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700">Contas a Receber Classificação Mês Atual</h4>
          </div>
          <div className="p-5 space-y-3 text-xs">
            {contasReceberClassificacao.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-600">{item.categoria}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{item.valor}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({item.percent})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contas a Pagar Classificação Mês Atual */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700">Contas a Pagar Classificação Mês Atual</h4>
          </div>
          <div className="p-5 space-y-3 text-xs">
            {contasPagarClassificacao.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-600">{item.categoria}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-600">{item.valor}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({item.percent})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 8. TWO HALF-WIDTH BOXES: DRE MÊS ATUAL (Screenshot 4)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Contas a Receber DRE Mês Atual */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700">Contas a Receber DRE Mês Atual</h4>
          </div>
          <div className="p-5 space-y-3 text-xs">
            {dreReceber.map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between border-b border-slate-100 pb-2 ${item.isBold ? 'font-bold text-slate-900 bg-emerald-50/50 p-2 rounded' : 'text-slate-600'}`}>
                <span>{item.item}</span>
                <span className="font-mono">{item.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contas a Pagar DRE Mês Atual */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700">Contas a Pagar DRE Mês Atual</h4>
          </div>
          <div className="p-5 space-y-3 text-xs">
            {drePagar.map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between border-b border-slate-100 pb-2 ${item.isBold ? 'font-bold text-slate-900 bg-rose-50/50 p-2 rounded' : 'text-slate-600'}`}>
                <span>{item.item}</span>
                <span className="font-mono">{item.valor}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 9. FOOTER VERSION (Screenshot 4)                                          */}
      {/* ========================================================================= */}
      <div className="text-[11px] text-slate-400 pt-2 text-left font-sans">
        Powered by CoreUI Pro &amp; Forecast (v1.0.97) • BIRDPRO Financial Suite
      </div>

    </div>
  );
}
