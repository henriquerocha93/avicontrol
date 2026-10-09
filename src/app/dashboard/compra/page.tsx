'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Plus, 
  Printer, 
  FileText, 
  Search, 
  ChevronDown, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X,
  ShoppingCart
} from 'lucide-react';
import { DateManualInput } from '@/components/ui/date-manual-input';

export interface CompraItem {
  id: string;
  code: string;
  fornecedor: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'ABERTO' | 'FECHADO' | 'CANCELADO';
  status: 'EM_ABERTO' | 'RECEBIDO';
  categoria?: string;
}

export default function CompraPage() {
  const [searchField, setSearchField] = useState<'Nome' | 'Fornecedor' | 'Produto'>('Nome');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'TODOS' | 'ABERTO' | 'FECHADO' | 'CANCELADO'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'AMBOS' | 'EM_ABERTO' | 'RECEBIDO'>('AMBOS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Inicializa 100% zerado por padrão para o usuário cadastrar seus próprios produtos/compras
  const [compras, setCompras] = useState<CompraItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('birdpro_compras_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('birdpro_compras_v1', JSON.stringify(compras));
    }
  }, [compras]);

  // Form states
  const [form, setForm] = useState({
    fornecedor: '',
    descricao: '',
    valor: '',
    categoria: 'Alimentação / Rações',
    tipo: 'FECHADO' as CompraItem['tipo'],
    status: 'RECEBIDO' as CompraItem['status'],
    data: new Date().toISOString().split('T')[0]
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim().toLowerCase());
  };

  const filteredCompras = useMemo(() => {
    return compras.filter(c => {
      const matchTipo = tipoFilter === 'TODOS' || c.tipo === tipoFilter;
      const matchStatus = statusFilter === 'AMBOS' || c.status === statusFilter;

      let matchQuery = true;
      if (activeSearch) {
        if (searchField === 'Fornecedor') {
          matchQuery = c.fornecedor.toLowerCase().includes(activeSearch);
        } else if (searchField === 'Produto') {
          matchQuery = c.descricao.toLowerCase().includes(activeSearch);
        } else {
          // 'Nome' busca em fornecedor ou descricao
          matchQuery = c.fornecedor.toLowerCase().includes(activeSearch) || c.descricao.toLowerCase().includes(activeSearch);
        }
      }

      return matchTipo && matchStatus && matchQuery;
    });
  }, [compras, tipoFilter, statusFilter, activeSearch, searchField]);

  const handleCreateCompra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fornecedor || !form.valor) return;

    const nova: CompraItem = {
      id: `cp-${Date.now()}`,
      code: `CMP-${String(compras.length + 1).padStart(4, '0')}`,
      fornecedor: form.fornecedor,
      data: form.data,
      descricao: form.descricao || 'Produtos do Criatório',
      categoria: form.categoria,
      valor: parseFloat(form.valor.replace(',', '.')),
      tipo: form.tipo,
      status: form.status
    };

    setCompras([nova, ...compras]);
    setIsModalOpen(false);
    setForm({
      fornecedor: '',
      descricao: '',
      valor: '',
      categoria: 'Alimentação / Rações',
      tipo: 'FECHADO',
      status: 'RECEBIDO',
      data: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id: string) => {
    setCompras(compras.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* 1. Breadcrumb Exato */}
      <div className="text-xs text-slate-500 flex items-center space-x-1.5">
        <Link href="/dashboard" className="text-[#0099e5] hover:underline font-medium">Home</Link>
        <span>/</span>
        <span className="text-slate-600">Compra</span>
      </div>

      {/* 2. Container Painel Principal */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Barra de Título com Ícone de Menu */}
        <div className="bg-[#f5f7fa] px-4 py-2.5 border-b border-slate-200 flex items-center space-x-2 text-slate-700 font-bold text-sm">
          <Menu className="w-4 h-4 text-slate-500" />
          <span>Ordem de Compra</span>
        </div>

        {/* 3. Barra Superior: Botão + Novo e Ícones de Ação */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0099e5] hover:bg-[#0088cc] text-white px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Novo</span>
          </button>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => window.print()}
              className="bg-[#2c3b41] hover:bg-[#1e282c] text-white p-1.5 rounded transition shadow-2xs"
              title="Imprimir"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              className="bg-[#2c3b41] hover:bg-[#1e282c] text-white p-1.5 rounded transition shadow-2xs"
              title="Arquivo"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Barra de Pesquisa Exata conforme Screenshot 3 */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100">
          <form onSubmit={handleSearchSubmit} className="flex items-center max-w-xl">
            {/* Dropdown Nome */}
            <div className="relative">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-r-0 border-slate-300 rounded-l px-3 py-1.5 text-xs text-slate-700 font-medium pr-7 focus:outline-none cursor-pointer"
              >
                <option value="Nome">Nome</option>
                <option value="Fornecedor">Fornecedor</option>
                <option value="Produto">Produto</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Input Pesquisa */}
            <input
              type="text"
              placeholder="Pesquisa"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setActiveSearch('');
              }}
              className="flex-1 border border-slate-300 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0099e5] bg-white"
            />

            {/* Botão Buscar */}
            <button
              type="submit"
              className="bg-[#0099e5] hover:bg-[#0088cc] text-white px-3 py-1.5 rounded-r text-xs font-bold transition flex items-center space-x-1 cursor-pointer border border-[#0099e5]"
            >
              <Search className="w-3 h-3" />
              <span>Buscar</span>
            </button>
          </form>
        </div>

        {/* 5. Barra de Filtros de Texto idêntica ao print */}
        <div className="px-4 py-2 border-b border-slate-100 bg-[#fafbfc] flex flex-wrap items-center gap-6 text-[11px]">
          
          {/* Tipo filter */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-500">Tipo:</span>
            <div className="flex items-center space-x-2 font-medium">
              {(['TODOS', 'ABERTO', 'FECHADO', 'CANCELADO'] as const).map(t => {
                const label = t === 'TODOS' ? 'Todos' : t === 'ABERTO' ? 'Aberto' : t === 'FECHADO' ? 'Fechado' : 'Cancelado';
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

        {/* 6. Conteúdo / Tabela ou Banner de "Lista vazia." */}
        <div className="p-4 bg-white">
          {filteredCompras.length === 0 ? (
            /* Banner azul claro idêntico ao screenshot */
            <div className="bg-[#d9edf7] border border-[#bce8f1] text-[#31708f] py-2.5 px-4 rounded text-center text-xs font-semibold shadow-2xs">
              Lista vazia.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Ordem / Cód</th>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Fornecedor</th>
                    <th className="py-2.5 px-3">Itens / Descrição</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Valor Total</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompras.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0099e5]">{item.code}</td>
                      <td className="py-2.5 px-3">{item.data}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.fornecedor}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.descricao}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.tipo === 'FECHADO' ? 'bg-emerald-100 text-emerald-800' :
                          item.tipo === 'ABERTO' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.tipo}
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
                          title="Excluir Compra"
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

      {/* MODAL: Nova Compra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="px-5 py-4 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0099e5]"></span>
                Cadastrar Ordem de Compra
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompra} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Fornecedor *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: NutriBird, FOB, Fábrica de Gaiolas"
                  value={form.fornecedor}
                  onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Itens / Descrição dos Produtos *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ração Extrusada 10kg, Complexo Vitamínico"
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
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Data da Compra *</label>
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
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo da Ordem</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                  >
                    <option value="FECHADO">Fechado</option>
                    <option value="ABERTO">Aberto</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Status da Entrega</label>
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
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Categoria de Custo</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0099e5]/20 focus:border-[#0099e5]"
                >
                  <option value="Alimentação / Rações">Alimentação / Rações</option>
                  <option value="Medicamentos & Vacinas">Medicamentos & Vacinas</option>
                  <option value="Gaiolas & Instalações">Gaiolas & Instalações</option>
                  <option value="Anilhas Oficiais">Anilhas Oficiais</option>
                  <option value="Insumos & Outros">Insumos & Outros</option>
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
                  Salvar Compra
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
