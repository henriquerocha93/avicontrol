'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowDownRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DateManualInput } from '@/components/ui/date-manual-input';

interface ContaPagar {
  id: string;
  descricao: string;
  categoria: string;
  fornecedor: string;
  valor: number;
  vencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
}

export default function ContasPagarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDENTE' | 'PAGO' | 'VENCIDO'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [contas, setContas] = useState<ContaPagar[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('birdpro_contas_pagar');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('birdpro_contas_pagar', JSON.stringify(contas));
    }
  }, [contas]);

  const [form, setForm] = useState({
    descricao: '',
    categoria: 'Alimentação / Rações',
    fornecedor: '',
    valor: '',
    vencimento: new Date().toISOString().split('T')[0]
  });

  const handleAddConta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor) return;

    const nova: ContaPagar = {
      id: `cp-${Date.now()}`,
      descricao: form.descricao,
      categoria: form.categoria,
      fornecedor: form.fornecedor || 'Fornecedor Diversos',
      valor: parseFloat(form.valor.replace(',', '.')),
      vencimento: form.vencimento,
      status: 'PENDENTE'
    };

    setContas([nova, ...contas]);
    setIsModalOpen(false);
    setForm({
      descricao: '',
      categoria: 'Alimentação / Rações',
      fornecedor: '',
      valor: '',
      vencimento: new Date().toISOString().split('T')[0]
    });
  };

  const toggleStatus = (id: string) => {
    setContas(contas.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'PAGO' ? 'PENDENTE' : 'PAGO' };
      }
      return c;
    }));
  };

  const handleDelete = (id: string) => {
    setContas(contas.filter(c => c.id !== id));
  };

  const filteredContas = contas.filter(c => {
    const matchesSearch = c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPendente = contas.filter(c => c.status === 'PENDENTE').reduce((acc, c) => acc + c.valor, 0);
  const totalPago = contas.filter(c => c.status === 'PAGO').reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 bg-[#f4f6f9] -m-6 p-6 min-h-screen">
      
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-[#0284c7] font-medium">
        <Link href="/dashboard" className="hover:underline">Home</Link>
        <span className="text-slate-400">/</span>
        <Link href="/dashboard/painel-financeiro" className="hover:underline">Painel Financeiro</Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500">Contas a Pagar</span>
      </div>

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contas a Pagar</h1>
          <p className="text-xs text-slate-500">Controle de despesas, fornecedores e vencimentos do criatório</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#ef5350] hover:bg-[#e53935] text-white font-bold text-xs">
            <Plus className="w-4 h-4 mr-1" />
            Nova Conta a Pagar
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#ef5350] text-white p-5 rounded-lg shadow-xs flex flex-col justify-between h-28">
          <h2 className="text-2xl font-bold">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          <p className="text-xs font-medium opacity-90">Total a Pagar (Pendente)</p>
        </div>

        <div className="bg-[#4caf50] text-white p-5 rounded-lg shadow-xs flex flex-col justify-between h-28">
          <h2 className="text-2xl font-bold">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          <p className="text-xs font-medium opacity-90">Total Pago no Mês</p>
        </div>

        <div className="bg-[#0288d1] text-white p-5 rounded-lg shadow-xs flex flex-col justify-between h-28">
          <h2 className="text-2xl font-bold">{contas.length}</h2>
          <p className="text-xs font-medium opacity-90">Total de Lançamentos</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição ou fornecedor..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#0284c7]"
            />
          </div>

          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
            {(['ALL', 'PENDENTE', 'PAGO'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {st === 'ALL' ? 'Todos' : st === 'PENDENTE' ? 'Pendentes' : 'Pagos'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Nenhuma conta a pagar encontrada.
                  </td>
                </tr>
              ) : (
                filteredContas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.descricao}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.categoria}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.fornecedor}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.vencimento}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      R$ {c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleStatus(c.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                          c.status === 'PAGO' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {c.status === 'PAGO' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {c.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Nova Conta a Pagar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-[#ef5350] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Lançar Nova Conta a Pagar</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddConta} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Compra de ração, anilhas, vacinas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#ef5350]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#ef5350]"
                  >
                    <option value="Alimentação / Rações">Alimentação / Rações</option>
                    <option value="Anilhas Oficiais">Anilhas Oficiais</option>
                    <option value="Medicamentos & Vacinas">Medicamentos &amp; Vacinas</option>
                    <option value="Gaiolas & Acessórios">Gaiolas &amp; Acessórios</option>
                    <option value="Manutenção & Energia">Manutenção &amp; Energia</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#ef5350]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fornecedor</label>
                  <input
                    type="text"
                    value={form.fornecedor}
                    onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                    placeholder="Nome do fornecedor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#ef5350]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Vencimento *</label>
                  <DateManualInput
                    required
                    value={form.vencimento}
                    onChange={(val) => setForm({ ...form, vencimento: val })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#ef5350]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <Button type="submit" className="bg-[#ef5350] hover:bg-[#e53935] text-white font-bold text-xs px-5 py-2 rounded-lg">
                  Salvar Lançamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
