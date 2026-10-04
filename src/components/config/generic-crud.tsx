'use client'

import React, { useState, useEffect } from 'react'
import { 
  Package, Plus, Search, Tag, DollarSign, AlertTriangle, 
  Trash2, Edit3, Grid3X3, Dna, Activity, ListFilter, GitFork, ShieldCheck
} from 'lucide-react'

// Generic Crud Component for secondary config tables
interface GenericCrudProps {
  title: string
  subtitle: string
  icon: any
  unitName: string
  items?: Array<{ id: string; name: string; category?: string; code?: string; extra?: string }>
  storageKey?: string
}

function GenericConfigCrud({ title, subtitle, icon: Icon, unitName, items: initialItems = [], storageKey }: GenericCrudProps) {
  const finalStorageKey = storageKey || 'birdpro_config_' + title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  const [items, setItems] = useState<Array<{ id: string; name: string; category?: string; code?: string; extra?: string }>>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemExtra, setNewItemExtra] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(finalStorageKey);
      if (stored) {
        try {
          setItems(JSON.parse(stored));
          return;
        } catch {}
      }
      setItems(initialItems || []);
    }
  }, [finalStorageKey]);

  const saveItems = (newItems: typeof items) => {
    setItems(newItems)
    if (typeof window !== 'undefined') {
      localStorage.setItem(finalStorageKey, JSON.stringify(newItems))
    }
  }

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.category && i.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName) return
    const updated = [...items, { id: String(Date.now()), name: newItemName, extra: newItemExtra }]
    saveItems(updated)
    setIsModalOpen(false)
    setNewItemName('')
    setNewItemExtra('')
  }

  const handleDelete = (id: string) => {
    if (confirm(`Deseja realmente remover este registro de ${unitName}?`)) {
      const updated = items.filter(i => i.id !== id)
      saveItems(updated)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1e252b] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#00c853]/10 text-[#00c853] rounded-lg">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[#00c853] hover:bg-[#00b84a] text-white px-5 py-2.5 rounded font-semibold text-xs shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar {unitName}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e252b] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Buscar em ${title}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e252b] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-[#252d35] text-gray-700 dark:text-gray-200 uppercase font-bold border-b border-gray-200 dark:border-gray-800 text-[11px]">
            <tr>
              <th className="px-5 py-3">Descrição / Nome</th>
              <th className="px-5 py-3">Detalhes / Categoria</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-gray-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#151b22]/80 transition">
                  <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-gray-100">
                    {item.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                    {item.extra || item.category || '-'}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <Edit3 className="w-3.5 h-3.5 inline" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e252b] rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-[#252d35] px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Novo {unitName}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Nome / Título *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder={`Ex: Nome do ${unitName}`}
                  className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Informações Adicionais</label>
                <input
                  type="text"
                  value={newItemExtra}
                  onChange={e => setNewItemExtra(e.target.value)}
                  placeholder="Observação ou categoria"
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GenericConfigCrud

