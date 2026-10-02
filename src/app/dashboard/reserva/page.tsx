'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Printer, FileText, Search, Plus, X, List, ChevronDown, Edit2, Trash2, Eye } from 'lucide-react'
import { db } from '@/lib/db'
import { Tenant } from '@/types'
import { formatDate } from '@/lib/utils'

// Reservation type
interface Reservation {
  id: string
  tenantId: string
  birdName: string
  birdRing: string
  birdSpecies: string
  clientName: string
  clientPhone: string
  clientEmail: string
  value: number
  notes: string
  status: 'ABERTO' | 'FECHADO' | 'CANCELADO'
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'birdpro_reservations_v1'

function getReservations(): Reservation[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveReservations(reservations: Reservation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations))
}

export default function ReservaPage() {
  const [tenant, setTenant] = useState<Tenant>(db.getTenant())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [activeTab, setActiveTab] = useState<'TODOS' | 'ABERTO' | 'FECHADO' | 'CANCELADO'>('TODOS')
  const [searchField, setSearchField] = useState<string>('Nome')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)

  // Form state
  const [formBirdName, setFormBirdName] = useState('')
  const [formBirdRing, setFormBirdRing] = useState('')
  const [formBirdSpecies, setFormBirdSpecies] = useState('')
  const [formClientName, setFormClientName] = useState('')
  const [formClientPhone, setFormClientPhone] = useState('')
  const [formClientEmail, setFormClientEmail] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formStatus, setFormStatus] = useState<'ABERTO' | 'FECHADO' | 'CANCELADO'>('ABERTO')

  useEffect(() => {
    setTenant(db.getTenant())
    setReservations(getReservations())
  }, [])

  const openCount = reservations.filter(r => r.status === 'ABERTO').length
  const closedCount = reservations.filter(r => r.status === 'FECHADO').length

  const filteredReservations = reservations.filter(r => {
    if (activeTab !== 'TODOS' && r.status !== activeTab) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    if (searchField === 'Nome') return r.birdName.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q)
    if (searchField === 'Anilha') return r.birdRing.toLowerCase().includes(q)
    if (searchField === 'Espécie') return r.birdSpecies.toLowerCase().includes(q)
    return true
  })

  const resetForm = () => {
    setFormBirdName('')
    setFormBirdRing('')
    setFormBirdSpecies('')
    setFormClientName('')
    setFormClientPhone('')
    setFormClientEmail('')
    setFormValue('')
    setFormNotes('')
    setFormStatus('ABERTO')
    setEditingReservation(null)
  }

  const handleOpenNew = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (r: Reservation) => {
    setEditingReservation(r)
    setFormBirdName(r.birdName)
    setFormBirdRing(r.birdRing)
    setFormBirdSpecies(r.birdSpecies)
    setFormClientName(r.clientName)
    setFormClientPhone(r.clientPhone)
    setFormClientEmail(r.clientEmail)
    setFormValue(r.value.toString())
    setFormNotes(r.notes)
    setFormStatus(r.status)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    const now = new Date().toISOString()
    if (editingReservation) {
      const updated = reservations.map(r =>
        r.id === editingReservation.id
          ? {
              ...r,
              birdName: formBirdName,
              birdRing: formBirdRing,
              birdSpecies: formBirdSpecies,
              clientName: formClientName,
              clientPhone: formClientPhone,
              clientEmail: formClientEmail,
              value: parseFloat(formValue) || 0,
              notes: formNotes,
              status: formStatus,
              updatedAt: now,
            }
          : r
      )
      saveReservations(updated)
      setReservations(updated)
    } else {
      const newRes: Reservation = {
        id: `res-${Date.now()}`,
        tenantId: tenant.id,
        birdName: formBirdName,
        birdRing: formBirdRing,
        birdSpecies: formBirdSpecies,
        clientName: formClientName,
        clientPhone: formClientPhone,
        clientEmail: formClientEmail,
        value: parseFloat(formValue) || 0,
        notes: formNotes,
        status: formStatus,
        createdAt: now,
        updatedAt: now,
      }
      const updated = [...reservations, newRes]
      saveReservations(updated)
      setReservations(updated)
    }
    setIsModalOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) return
    const updated = reservations.filter(r => r.id !== id)
    saveReservations(updated)
    setReservations(updated)
  }

  const statusColors: Record<string, string> = {
    ABERTO: 'bg-emerald-100 text-emerald-700',
    FECHADO: 'bg-blue-100 text-blue-700',
    CANCELADO: 'bg-red-100 text-red-700',
  }

  const tabs: Array<{ key: typeof activeTab; label: string }> = [
    { key: 'TODOS', label: 'Todos' },
    { key: 'ABERTO', label: 'Aberto' },
    { key: 'FECHADO', label: 'Fechado' },
    { key: 'CANCELADO', label: 'Cancelado' },
  ]

  return (
    <div className="space-y-0 pb-0 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Reserva</span>
      </div>

      {/* Main White Container */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden w-full">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
          <List className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Reserva</span>
        </div>

        {/* Toolbar: + Novo, Print/PDF icons */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/dashboard/reserva/formulario"
            className="px-3 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-[11px] font-bold rounded flex items-center space-x-1 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>Novo</span>
          </Link>
          <div className="flex items-center space-x-1">
            <button type="button" className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center justify-center transition cursor-pointer">
              <Printer className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button type="button" className="w-7 h-7 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center justify-center transition cursor-pointer">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Search Row */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <div className="relative">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="h-7 pl-2 pr-6 text-[11px] bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853] appearance-none cursor-pointer"
            >
              <option value="Nome">Nome</option>
              <option value="Anilha">Anilha</option>
              <option value="Espécie">Espécie</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisa"
            className="flex-1 h-7 px-2.5 text-[11px] bg-white border border-slate-300 rounded text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#00c853]"
          />
          <button
            type="button"
            className="px-3 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-[11px] font-bold rounded flex items-center space-x-1 transition cursor-pointer"
          >
            <Search className="w-3 h-3" />
            <span>Buscar</span>
          </button>
        </div>

        {/* Status Bars: Abertos / Fechado */}
        <div className="px-4 pb-3">
          <div className="flex w-full max-w-md mx-auto">
            <div className="flex-1 bg-emerald-100 border border-emerald-200 rounded-l py-1.5 text-center">
              <span className="text-[9px] text-emerald-600 block font-medium">Abertos</span>
              <span className="text-sm font-bold text-emerald-700">{openCount}</span>
            </div>
            <div className="flex-1 bg-teal-50 border border-teal-200 rounded-r py-1.5 text-center">
              <span className="text-[9px] text-teal-600 block font-medium">Fechado</span>
              <span className="text-sm font-bold text-teal-700">{closedCount}</span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-4 pb-0 flex items-center space-x-4 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-[11px] font-semibold border-b-2 transition cursor-pointer ${
                activeTab === tab.key
                  ? 'text-[#00c853] border-[#00c853]'
                  : 'text-[#00c853] border-transparent hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table / List */}
        {filteredReservations.length === 0 ? (
          <div className="bg-sky-50 text-center py-3 text-xs text-slate-500 border-b border-slate-200">
            Lista <span className="font-bold text-red-500">vazia</span>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="text-left px-4 py-2 font-semibold">Pássaro</th>
                  <th className="text-left px-4 py-2 font-semibold">Anilha</th>
                  <th className="text-left px-4 py-2 font-semibold">Espécie</th>
                  <th className="text-left px-4 py-2 font-semibold">Cliente</th>
                  <th className="text-left px-4 py-2 font-semibold">Telefone</th>
                  <th className="text-right px-4 py-2 font-semibold">Valor (R$)</th>
                  <th className="text-center px-4 py-2 font-semibold">Status</th>
                  <th className="text-center px-4 py-2 font-semibold">Data</th>
                  <th className="text-center px-4 py-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="px-4 py-2 font-bold text-slate-800 uppercase">{r.birdName}</td>
                    <td className="px-4 py-2 text-slate-600 font-mono">{r.birdRing}</td>
                    <td className="px-4 py-2 text-slate-600">{r.birdSpecies}</td>
                    <td className="px-4 py-2 text-slate-700 font-semibold">{r.clientName}</td>
                    <td className="px-4 py-2 text-slate-600">{r.clientPhone}</td>
                    <td className="px-4 py-2 text-right text-slate-700 font-semibold">
                      {r.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-slate-500">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Link href={`/dashboard/reserva/formulario?id=${r.id}`} className="p-1 text-slate-400 hover:text-[#00c853] cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDelete(r.id)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Spacer to fill vertical space like in the screenshot */}
        <div className="h-64 bg-white" />

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>Powered by BirdPro &amp; Forecast (v1.0.97)</span>
          <span>www.birdpro.com.br</span>
        </div>
      </div>

      {/* New/Edit Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-800 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">
                {editingReservation ? 'Editar Reserva' : 'Nova Reserva'}
              </span>
              <button onClick={() => { setIsModalOpen(false); resetForm() }} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Nome do Pássaro<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formBirdName}
                    onChange={(e) => setFormBirdName(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Anilha</label>
                  <input
                    type="text"
                    value={formBirdRing}
                    onChange={(e) => setFormBirdRing(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Espécie</label>
                <input
                  type="text"
                  value={formBirdSpecies}
                  onChange={(e) => setFormBirdSpecies(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Nome do Cliente<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Telefone</label>
                  <input
                    type="text"
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Email</label>
                  <input
                    type="email"
                    value={formClientEmail}
                    onChange={(e) => setFormClientEmail(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>
              {editingReservation && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'ABERTO' | 'FECHADO' | 'CANCELADO')}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  >
                    <option value="ABERTO">Aberto</option>
                    <option value="FECHADO">Fechado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Observações</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853] resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm() }}
                className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded transition cursor-pointer"
              >
                {editingReservation ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

