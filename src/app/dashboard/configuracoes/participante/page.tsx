'use client'

import React, { useState } from 'react'
import { Users2, Plus, Search, Mail, Phone, MapPin, Trash2, Edit3 } from 'lucide-react'

export default function ParticipantesConfigPage() {
  const [participants, setParticipants] = useState([
    { id: '1', name: 'Dr. Roberto Veterinário', type: 'Veterinário', phone: '(19) 99876-5432', email: 'roberto.vet@clinicaaves.com.br', city: 'Campinas - SP' },
    { id: '2', name: 'Criatório Canto Nobre', type: 'Criador Parceiro', phone: '(11) 98765-4321', email: 'contato@cantonobre.com.br', city: 'São Paulo - SP' },
    { id: '3', name: 'NutriAves Rações & Suplementos', type: 'Fornecedor', phone: '(19) 3871-0000', email: 'vendas@nutriaves.com.br', city: 'Valinhos - SP' },
    { id: '4', name: 'LabGen Genética Aviária', type: 'Laboratório', phone: '(41) 3030-9988', email: 'laudos@labgen.com.br', city: 'Curitiba - PR' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'Fornecedor', phone: '', email: '', city: '' })

  const filtered = participants.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.type.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setParticipants([...participants, { id: String(Date.now()), ...formData }])
    setIsModalOpen(false)
    setFormData({ name: '', type: 'Fornecedor', phone: '', email: '', city: '' })
  }

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este participante?')) {
      setParticipants(participants.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1e252b] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#00c853]/10 text-[#00c853] rounded-lg">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Configuração de Participantes</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cadastre criadores parceiros, fornecedores, veterinários, compradores e laboratórios</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[#00c853] hover:bg-[#00b84a] text-white px-5 py-2.5 rounded font-semibold text-xs shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Participante</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e252b] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar participante por nome ou tipo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white dark:bg-[#1e252b] rounded-lg p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{p.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00c853]/10 text-[#00c853]">{p.type}</span>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{p.phone || '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{p.email || '-'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{p.city || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e252b] rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-[#252d35] px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Novo Participante</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do contato ou empresa"
                  className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Tipo de Participante</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                >
                  <option value="Criador Parceiro">Criador Parceiro</option>
                  <option value="Veterinário">Veterinário</option>
                  <option value="Fornecedor">Fornecedor</option>
                  <option value="Laboratório">Laboratório</option>
                  <option value="Comprador">Comprador</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Campinas - SP"
                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#151b22] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@empresa.com"
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

