'use client'

import React, { useState } from 'react'
import { Disc, Plus, Search, Filter, Trash2, Edit3, Check, AlertCircle } from 'lucide-react'
import { db } from '@/lib/db'
import { Ring } from '@/types'

export default function ConfigAnilhasPage() {
  const rings = db.getRings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    year: new Date().getFullYear(),
    type: 'OFICIAL_FOB',
    status: 'IN_STOCK',
    notes: ''
  })

  const filteredRings = rings.filter(r => {
    const ringNum = r.code || r.number || ''
    const matchesSearch = ringNum.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code) return
    const newRing: Ring = {
      id: `ring_${Date.now()}`,
      tenantId: 'tenant_1',
      number: formData.code,
      code: formData.code,
      year: Number(formData.year),
      type: formData.type as any,
      status: formData.status as any,
      notes: formData.notes
    }
    db.saveRing(newRing)
    setIsModalOpen(false)
    setFormData({
      code: '',
      year: new Date().getFullYear(),
      type: 'OFICIAL_FOB',
      status: 'IN_STOCK',
      notes: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1e252b] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#00c853]/10 text-[#00c853] rounded-lg">
            <Disc className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Configuração de Anilhas</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gerenciamento de estoques, séries e anos de anilhas metálicas e plásticas</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[#00c853] hover:bg-[#00b84a] text-white px-5 py-2.5 rounded font-semibold text-xs shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Anilha</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1e252b] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de anilha..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-500">Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
          >
            <option value="ALL">Todos os status</option>
            <option value="IN_STOCK">Em Estoque</option>
            <option value="USED">Utilizada</option>
            <option value="RESERVED">Reservada</option>
            <option value="LOST">Perdida</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e252b] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-[#252d35] text-gray-700 dark:text-gray-200 uppercase font-bold border-b border-gray-200 dark:border-gray-800 text-[11px]">
              <tr>
                <th className="px-5 py-3">Código / Número</th>
                <th className="px-5 py-3">Ano</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Observações</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredRings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Nenhuma anilha encontrada para este filtro.
                  </td>
                </tr>
              ) : (
                filteredRings.map(ring => (
                  <tr key={ring.id} className="hover:bg-gray-50 dark:hover:bg-[#151b22]/80 transition">
                    <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                      <Disc className="w-4 h-4 text-[#00c853]" />
                      <span>{ring.code || ring.number}</span>
                    </td>
                    <td className="px-5 py-3.5">{ring.year}</td>
                    <td className="px-5 py-3.5">{ring.type}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ring.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        ring.status === 'USED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {ring.status === 'IN_STOCK' ? 'Disponível' : ring.status === 'USED' ? 'Em Uso' : ring.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">{ring.notes || '-'}</td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button className="text-blue-500 hover:text-blue-700">
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Anilha */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e252b] rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-[#252d35] px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Cadastrar Nova Anilha</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Código / Número *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: BR-2026-001"
                  className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Ano</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                  >
                    <option value="OFICIAL_FOB">Oficial FOB</option>
                    <option value="OFICIAL_SISPASS">Oficial SISPASS</option>
                    <option value="PERSONALIZADA">Personalizada</option>
                    <option value="MARCACAO">Marcação Plástica</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded shadow"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

