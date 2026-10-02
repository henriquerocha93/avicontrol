'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CircleDot, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit, 
  Bird, 
  Check, 
  AlertCircle,
  Layers
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Ring, RingStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDate, exportToExcel, exportToCsv } from '@/lib/utils';

export default function RingsPage() {
  const { tenant } = useAuth();
  const [rings, setRings] = useState<Ring[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingRing, setEditingRing] = useState<Ring | null>(null);

  // Single form
  const [singleForm, setSingleForm] = useState({
    number: '',
    year: new Date().getFullYear(),
    type: 'FOB Oficial 2.8mm',
    origin: 'Federação Ornitológica do Brasil',
    acquisitionDate: new Date().toISOString().split('T')[0],
    status: 'IN_STOCK' as RingStatus,
    notes: ''
  });

  // Batch form
  const [batchForm, setBatchForm] = useState({
    prefix: 'FOB-2026-BR-',
    startNumber: 100,
    quantity: 20,
    year: 2026,
    type: 'FOB Oficial 2.8mm',
    origin: 'Federação Ornitológica do Brasil'
  });

  const loadRings = () => {
    setRings(db.getRings(tenant?.id));
  };

  useEffect(() => {
    loadRings();
  }, [tenant?.id]);

  const filteredRings = rings.filter((r) => {
    const matchesSearch = r.number.toLowerCase().includes(search.toLowerCase()) ||
      (r.type && r.type.toLowerCase().includes(search.toLowerCase())) ||
      (r.birdName && r.birdName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = !selectedStatus || r.status === selectedStatus;
    const matchesYear = !selectedYear || r.year === Number(selectedYear);

    return matchesSearch && matchesStatus && matchesYear;
  });

  const inStockCount = rings.filter(r => r.status === 'IN_STOCK').length;
  const usedCount = rings.filter(r => r.status === 'USED').length;
  const reservedCount = rings.filter(r => r.status === 'RESERVED').length;

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.number) return;

    if (editingRing) {
      db.updateRing(editingRing.id, singleForm);
    } else {
      db.addRing({
        tenantId: tenant?.id || 'tenant-demo-01',
        ...singleForm
      });
    }

    loadRings();
    setIsSingleModalOpen(false);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newRings: any[] = [];
    for (let i = 0; i < batchForm.quantity; i++) {
      const currentNum = batchForm.startNumber + i;
      const formattedNum = `${batchForm.prefix}${String(currentNum).padStart(4, '0')}`;
      newRings.push({
        tenantId: tenant?.id || 'tenant-demo-01',
        number: formattedNum,
        year: batchForm.year,
        type: batchForm.type,
        origin: batchForm.origin,
        acquisitionDate: new Date().toISOString().split('T')[0],
        status: 'IN_STOCK',
        notes: 'Cadastro sequencial em lote.'
      });
    }
    db.addRingsBatch(newRings);
    loadRings();
    setIsBatchModalOpen(false);
  };

  const handleDelete = (id: string, num: string) => {
    if (confirm(`Remover anilha "${num}"?`)) {
      db.deleteRing(id);
      loadRings();
    }
  };

  const handleExport = () => {
    const data = filteredRings.map(r => ({
      Numero: r.number,
      Ano: r.year,
      Tipo: r.type,
      Status: r.status,
      AveVinculada: r.birdName || 'Não vinculado',
      Origem: r.origin || '',
      DataAquisicao: formatDate(r.acquisitionDate)
    }));
    exportToExcel(data, `Anilhas_${tenant?.slug || 'birdpro'}`);
  };

  return (
    <div className="space-y-3 pb-16 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Anilha</span>
      </div>

      {/* Top Header Card */}
      <div className="bg-white rounded-md border border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2 text-slate-700 text-xs font-semibold">
          <span className="text-sm">≡</span>
          <span>Painel de Anilhas ({rings.length} registradas | {inStockCount} disponíveis)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded border border-slate-300 flex items-center space-x-1 transition"
            title="Exportar Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Excel</span>
          </button>
          
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded border border-slate-300 flex items-center space-x-1 transition"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Em Sequência</span>
          </button>

          <button
            onClick={() => {
              setEditingRing(null);
              setSingleForm({
                number: '',
                year: 2026,
                type: 'FOB Oficial 2.8mm',
                origin: 'Federação Ornitológica do Brasil',
                acquisitionDate: new Date().toISOString().split('T')[0],
                status: 'IN_STOCK',
                notes: ''
              });
              setIsSingleModalOpen(true);
            }}
            className="px-3 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-semibold rounded flex items-center space-x-1 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Anilha</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-md border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center space-x-0">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-300 rounded-l text-xs text-slate-700 focus:outline-none focus:border-[#00c853] border-r-0 cursor-pointer"
            >
              <option value="">Todos os Anos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisa por anilha ou tipo"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c853]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedStatus('');
              setSelectedYear('');
            }}
            className="h-9 px-3 bg-[#e57373] hover:bg-[#ef5350] text-white flex items-center justify-center transition"
            title="Limpar pesquisa"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            className="h-9 px-4 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-semibold rounded-r flex items-center space-x-1.5 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSelectedStatus('IN_STOCK')}
          className={`py-2 px-4 border-b-2 transition ${
            selectedStatus === 'IN_STOCK'
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Disponíveis ({inStockCount})
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('USED')}
          className={`py-2 px-4 border-b-2 transition ${
            selectedStatus === 'USED'
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Utilizadas ({usedCount})
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('RESERVED')}
          className={`py-2 px-4 border-b-2 transition ${
            selectedStatus === 'RESERVED'
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Reservadas ({reservedCount})
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('')}
          className={`py-2 px-4 border-b-2 transition ${
            !selectedStatus
              ? 'border-[#00c853] text-[#00c853]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Todas ({rings.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Número da Anilha</th>
                <th className="py-3.5 px-4">Ano</th>
                <th className="py-3.5 px-4">Tipo / Material</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Ave Vinculada</th>
                <th className="py-3.5 px-4">Origem</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRings.map((ring) => (
                <tr key={ring.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{ring.number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{ring.year}</td>
                  <td className="py-3 px-4 text-slate-600">{ring.type}</td>
                  <td className="py-3 px-4">
                    <Badge variant={ring.status === 'IN_STOCK' ? 'success' : ring.status === 'USED' ? 'default' : 'warning'}>
                      {ring.status === 'IN_STOCK' ? 'Em Estoque' : ring.status === 'USED' ? 'Utilizada' : ring.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {ring.birdName ? (
                      <span className="flex items-center gap-1.5 text-emerald-800">
                        <Bird className="w-3.5 h-3.5" />
                        {ring.birdName}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Disponível</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{ring.origin || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingRing(ring);
                          setSingleForm({
                            number: ring.number,
                            year: ring.year,
                            type: ring.type,
                            origin: ring.origin || '',
                            acquisitionDate: ring.acquisitionDate || new Date().toISOString().split('T')[0],
                            status: ring.status,
                            notes: ring.notes || ''
                          });
                          setIsSingleModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ring.id, ring.number)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Modal */}
      <Modal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        title={editingRing ? `Editar Anilha ${editingRing.number}` : 'Cadastrar Anilha Individual'}
        description="Informe o número, tipo e ano da anilha."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSingle} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Número da Anilha *</label>
            <input
              type="text"
              required
              placeholder="Ex: FOB-2026-BR-0999"
              value={singleForm.number}
              onChange={(e) => setSingleForm({ ...singleForm, number: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ano</label>
              <input
                type="number"
                value={singleForm.year}
                onChange={(e) => setSingleForm({ ...singleForm, year: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={singleForm.status}
                onChange={(e) => setSingleForm({ ...singleForm, status: e.target.value as RingStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="IN_STOCK">Em Estoque</option>
                <option value="USED">Utilizada</option>
                <option value="RESERVED">Reservada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipo / Material</label>
            <input
              type="text"
              placeholder="Ex: FOB Oficial 2.8mm Alumínio"
              value={singleForm.type}
              onChange={(e) => setSingleForm({ ...singleForm, type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsSingleModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Anilha</Button>
          </div>
        </form>
      </Modal>

      {/* Batch Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Cadastrar Sequência de Anilhas em Lote"
        description="Gere uma sequência numérica contínua de anilhas em estoque."
        maxWidth="md"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Prefixo da Série</label>
            <input
              type="text"
              value={batchForm.prefix}
              onChange={(e) => setBatchForm({ ...batchForm, prefix: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Número Inicial</label>
              <input
                type="number"
                value={batchForm.startNumber}
                onChange={(e) => setBatchForm({ ...batchForm, startNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Quantidade de Anilhas</label>
              <input
                type="number"
                min={1}
                max={500}
                value={batchForm.quantity}
                onChange={(e) => setBatchForm({ ...batchForm, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">
            Serão geradas {batchForm.quantity} anilhas: <br />
            <strong>{batchForm.prefix}{String(batchForm.startNumber).padStart(4, '0')}</strong> até <strong>{batchForm.prefix}{String(batchForm.startNumber + batchForm.quantity - 1).padStart(4, '0')}</strong>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsBatchModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Gerar Lote de Anilhas</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

