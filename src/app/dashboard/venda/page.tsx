'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Printer, 
  FileText, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X,
  Search,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateManualInput } from '@/components/ui/date-manual-input';

export interface VendaItem {
  id: string;
  code: string;
  cliente: string;
  data: string; // YYYY-MM-DD
  descricao: string;
  valor: number;
  tipo: 'ABERTO' | 'PRE_VENDA' | 'FECHADO' | 'CANCELADO';
  status: 'EM_ABERTO' | 'RECEBIDO';
  formaPagamento?: string;
}

export default function VendaPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1)); // Outubro de 2026
  const [tipoFilter, setTipoFilter] = useState<'TODOS' | 'ABERTO' | 'PRE_VENDA' | 'FECHADO' | 'CANCELADO'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'AMBOS' | 'EM_ABERTO' | 'RECEBIDO'>('AMBOS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Começa 100% zerado por padrão para o usuário cadastrar seus próprios dados
  const [vendas, setVendas] = useState<VendaItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('birdpro_vendas_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('birdpro_vendas_v1', JSON.stringify(vendas));
    }
  }, [vendas]);

  // Form states
  const [form, setForm] = useState({
    cliente: '',
    descricao: '',
    valor: '',
    tipo: 'FECHADO' as VendaItem['tipo'],
    status: 'RECEBIDO' as VendaItem['status'],
    data: new Date().toISOString().split('T')[0],
    formaPagamento: 'PIX'
  });

  const monthYearString = useMemo(() => {
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${month}/${year}`;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Filtragem por mês/ano atual
  const monthlyVendas = useMemo(() => {
    const curMonth = currentDate.getMonth() + 1;
    const curYear = currentDate.getFullYear();

    return vendas.filter(v => {
      if (!v.data) return false;
      const [y, m] = v.data.split('-').map(Number);
      return y === curYear && m === curMonth;
    });
  }, [vendas, currentDate]);

  // Totais dos Pills: Aberto, Pré-Venda, Fechado
  const resumoAberto = useMemo(() => {
    const itens = monthlyVendas.filter(v => v.tipo === 'ABERTO');
    const total = itens.reduce((acc, curr) => acc + curr.valor, 0);
    return { count: itens.length, total };
  }, [monthlyVendas]);

  const resumoPreVenda = useMemo(() => {
    const itens = monthlyVendas.filter(v => v.tipo === 'PRE_VENDA');
    const total = itens.reduce((acc, curr) => acc + curr.valor, 0);
    return { count: itens.length, total };
  }, [monthlyVendas]);

  const resumoFechado = useMemo(() => {
    const itens = monthlyVendas.filter(v => v.tipo === 'FECHADO');
    const total = itens.reduce((acc, curr) => acc + curr.valor, 0);
    return { count: itens.length, total };
  }, [monthlyVendas]);

  // Filtro completo para a tabela
  const filteredVendas = useMemo(() => {
    return monthlyVendas.filter(v => {
      const matchTipo = tipoFilter === 'TODOS' || v.tipo === tipoFilter;
      const matchStatus = statusFilter === 'AMBOS' || v.status === statusFilter;
      return matchTipo && matchStatus;
    });
  }, [monthlyVendas, tipoFilter, statusFilter]);

  const handleCreateVenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cliente || !form.valor) return;

    const nova: VendaItem = {
      id: `v-${Date.now()}`,
      code: `VND-${String(vendas.length + 1).padStart(4, '0')}`,
      cliente: form.cliente,
      data: form.data,
      descricao: form.descricao || 'Venda de Ave / Produto',
      valor: parseFloat(form.valor.replace(',', '.')),
      tipo: form.tipo,
      status: form.status,
      formaPagamento: form.formaPagamento
    };

    setVendas([nova, ...vendas]);
    setIsModalOpen(false);
    setForm({
      cliente: '',
      descricao: '',
      valor: '',
      tipo: 'FECHADO',
      status: 'RECEBIDO',
      data: new Date().toISOString().split('T')[0],
      formaPagamento: 'PIX'
    });
  };

  const handleDelete = (id: string) => {
    setVendas(vendas.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* 1. Breadcrumb Exato */}
      <div className="text-xs text-slate-500 flex items-center space-x-1.5">
        <Link href="/dashboard" className="text-[#0099e5] hover:underline font-medium">Home</Link>
        <span>/</span>
        <span className="text-slate-600">Venda</span>
      </div>

      {/* 2. Container Painel Principal */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Barra de Título com Ícone de Menu */}
        <div className="bg-[#f5f7fa] px-4 py-2.5 border-b border-slate-200 flex items-center space-x-2 text-slate-700 font-bold text-sm">
          <Menu className="w-4 h-4 text-slate-500" />
          <span>Venda</span>
        </div>

        {/* 3. Barra de Controles e Pills de Resumo */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          
          {/* Esquerda: Botão + Novo & Navegador de Mês */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0099e5] hover:bg-[#0088cc] text-white px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Novo</span>
            </button>

            {/* Mês/Ano Picker */}
            <div className="inline-flex items-center border border-slate-300 rounded bg-white overflow-hidden shadow-2xs">
              <button
                onClick={handlePrevMonth}
                className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 transition border-r border-slate-300"
                title="Mês anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-1.5 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-normal">Mês/Ano</span>
                <span className="font-mono">{monthYearString}</span>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                onClick={handleNextMonth}
                className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 transition border-l border-slate-300"
                title="Próximo mês"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Centro: Os 3 Pills de Resumo Coloridos idênticos ao print */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Pill 1: Aberto (Azul claro) */}
            <div className="bg-[#d9edf7] border border-[#bce8f1] rounded px-4 py-1.5 text-center min-w-[120px]">
              <div className="text-[9px] font-bold text-[#31708f] uppercase tracking-wider">Aberto</div>
              <div className="text-xs font-black text-[#245269]">
                {resumoAberto.count} / R$ {resumoAberto.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Pill 2: Pré-Venda (Amarelo / Pêssego) */}
            <div className="bg-[#fcf8e3] border border-[#faebcc] rounded px-4 py-1.5 text-center min-w-[120px]">
              <div className="text-[9px] font-bold text-[#8a6d3b] uppercase tracking-wider">Pré-Venda</div>
              <div className="text-xs font-black text-[#66512c]">
                {resumoPreVenda.count} / R$ {resumoPreVenda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Pill 3: Fechado (Verde claro) */}
            <div className="bg-[#dff0d8] border border-[#d6e9c6] rounded px-4 py-1.5 text-center min-w-[120px]">
              <div className="text-[9px] font-bold text-[#3c763d] uppercase tracking-wider">Fechado</div>
              <div className="text-xs font-black text-[#2b542c]">
                {resumoFechado.count} / R$ {resumoFechado.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

          </div>

          {/* Direita: Botões de Ação (Imprimir, Arquivo, Todos) */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => window.print()}
              className="bg-[#2c3b41] hover:bg-[#1e282c] text-white p-1.5 rounded transition shadow-2xs"
              title="Imprimir Relatório de Vendas"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              className="bg-[#2c3b41] hover:bg-[#1e282c] text-white p-1.5 rounded transition shadow-2xs"
              title="Exportar Arquivo"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setTipoFilter('TODOS'); setStatusFilter('AMBOS'); }}
              className="bg-[#0099e5] hover:bg-[#0088cc] text-white px-2.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
            >
              <Filter className="w-3 h-3" />
              <span>Todos</span>
            </button>
          </div>

        </div>

        {/* 4. Barra de Filtros de Texto idêntica ao print */}
        <div className="px-4 py-2 border-b border-slate-100 bg-[#fafbfc] flex flex-wrap items-center gap-6 text-[11px]">
          
          {/* Tipo filter */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-500">Tipo:</span>
            <div className="flex items-center space-x-2 font-medium">
              {(['TODOS', 'ABERTO', 'PRE_VENDA', 'FECHADO', 'CANCELADO'] as const).map(t => {
                const label = t === 'TODOS' ? 'Todos' : t === 'ABERTO' ? 'Aberto' : t === 'PRE_VENDA' ? 'Pré-Venda' : t === 'FECHADO' ? 'Fechado' : 'Cancelado';
                const active = tipoFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTipoFilter(t)}
                    className={`transition ${active ? 'text-[#0099e5] font-black underline' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-500">Status:</span>
            <div className="flex items-center space-x-2 font-medium">
              {(['AMBOS', 'EM_ABERTO', 'RECEBIDO'] as const).map(s => {
                const label = s === 'AMBOS' ? 'Ambos' : s === 'EM_ABERTO' ? 'Em Aberto' : 'Recebido';
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`transition ${active ? 'text-[#0099e5] font-black underline' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 5. Conteúdo / Tabela ou Banner de "Lista vazia." */}
        <div className="p-4 bg-white">
          {filteredVendas.length === 0 ? (
            /* Banner azul claro idêntico ao screenshot */
            <div className="bg-[#d9edf7] border border-[#bce8f1] text-[#31708f] py-2.5 px-4 rounded text-center text-xs font-semibold shadow-2xs">
              Lista vazia.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Descrição</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Valor Total</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVendas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0099e5]">{item.code}</td>
                      <td className="py-2.5 px-3">{item.data}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.cliente}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.descricao}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.tipo === 'FECHADO' ? 'bg-emerald-100 text-emerald-800' :
                          item.tipo === 'PRE_VENDA' ? 'bg-amber-100 text-amber-800' :
                          item.tipo === 'ABERTO' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.tipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          item.status === 'RECEBIDO' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {item.status === 'RECEBIDO' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {item.status === 'RECEBIDO' ? 'Recebido' : 'Em Aberto'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="Excluir Venda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: Nova Venda */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="px-5 py-4 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0099e5]"></span>
                Cadastrar Nova Venda
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVenda} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Cliente / Comprador *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do criador ou cliente"
                  value={form.cliente}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Descrição / Ave / Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Filhote Bicudo Anilha 0482 / Gaiola Reprodução"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Data da Venda *</label>
                  <DateManualInput
                    required
                    value={form.data}
                    onChange={(val) => setForm({ ...form, data: val })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo da Venda</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                  >
                    <option value="FECHADO">Fechado</option>
                    <option value="PRE_VENDA">Pré-Venda</option>
                    <option value="ABERTO">Aberto</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Status do Pagamento</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                  >
                    <option value="RECEBIDO">Recebido</option>
                    <option value="EM_ABERTO">Em Aberto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Forma de Pagamento</label>
                <select
                  value={form.formaPagamento}
                  onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0099e5] hover:bg-[#0088cc] text-white font-bold rounded-lg transition shadow-xs"
                >
                  Salvar Venda
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
