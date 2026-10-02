'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  FileEdit, 
  FileText, 
  Edit2, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronLeft, 
  Check, 
  X, 
  Search,
  Sparkles,
  Layers
} from 'lucide-react'
import { db } from '@/lib/db'
import { Bird, Tenant } from '@/types'

interface AvailableBirdItem {
  id: string
  birdId: string
  name: string
  ringNumber: string
  species: string
  sex: string
  price: number
}

interface FutureChickItem {
  id: string
  fatherName: string
  motherName: string
  species: string
  expectedDate: string
  price: number
}

interface Participant {
  id: string
  name: string
  cpfCnpj: string
  registro: string
  phone: string
  email: string
  type?: string
}

const STORAGE_KEY = 'birdpro_reservations_v1'
const PARTICIPANTS_KEY = 'birdpro_participants_v1'

function getSavedReservations(): any[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveReservationsList(list: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function getSavedParticipants(): Participant[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(PARTICIPANTS_KEY)
  if (raw) return JSON.parse(raw)
  // Default sample participants
  const defaults: Participant[] = [
    { id: '1', name: 'Dr. Roberto Veterinário', cpfCnpj: '123.456.789-00', registro: 'CRMV-SP 12345', phone: '(19) 99876-5432', email: 'roberto.vet@clinicaaves.com.br' },
    { id: '2', name: 'Criatório Canto Nobre', cpfCnpj: '12.345.678/0001-90', registro: 'IBAMA 987654', phone: '(11) 98765-4321', email: 'contato@cantonobre.com.br' },
    { id: '3', name: 'NutriAves Rações & Suplementos', cpfCnpj: '98.765.432/0001-10', registro: 'MAPA 554433', phone: '(19) 3871-0000', email: 'vendas@nutriaves.com.br' },
    { id: '4', name: 'Carlos Eduardo Santos', cpfCnpj: '234.567.890-11', registro: 'SISPASS 456789', phone: '(21) 98888-7777', email: 'carlos.santos@email.com' }
  ]
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(defaults))
  return defaults
}

function ReservaFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [tenant, setTenant] = useState<Tenant>(db.getTenant())
  const [allBirds, setAllBirds] = useState<Bird[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'RESERVA' | 'DOCUMENTO'>('RESERVA')

  // Form states
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [participantCpfCnpj, setParticipantCpfCnpj] = useState('')
  const [participantRegistro, setParticipantRegistro] = useState('')
  const [participantPhone, setParticipantPhone] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [observation, setObservation] = useState('')

  // Totals
  const [paymentType, setPaymentType] = useState('Boleto')
  const [totalAddition, setTotalAddition] = useState<number>(0)
  const [totalDiscount, setTotalDiscount] = useState<number>(0)

  // Lists
  const [availableBirdsList, setAvailableBirdsList] = useState<AvailableBirdItem[]>([])
  const [futureChicksList, setFutureChicksList] = useState<FutureChickItem[]>([])

  // Selection states
  const [selectedBirdsToDelete, setSelectedBirdsToDelete] = useState<string[]>([])
  const [selectedChicksToDelete, setSelectedChicksToDelete] = useState<string[]>([])

  // Modals
  const [isAddBirdModalOpen, setIsAddBirdModalOpen] = useState(false)
  const [isAddChickModalOpen, setIsAddChickModalOpen] = useState(false)
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false)

  // Modal forms
  const [birdSearch, setBirdSearch] = useState('')
  const [birdPriceInput, setBirdPriceInput] = useState('0')
  const [selectedBirdToAdd, setSelectedBirdToAdd] = useState<Bird | null>(null)

  // Future chick form
  const [chickFather, setChickFather] = useState('')
  const [chickMother, setChickMother] = useState('')
  const [chickSpecies, setChickSpecies] = useState('Canário-da-terra')
  const [chickDate, setChickDate] = useState('')
  const [chickPrice, setChickPrice] = useState('0')

  // New participant form
  const [newPartName, setNewPartName] = useState('')
  const [newPartCpf, setNewPartCpf] = useState('')
  const [newPartRegistro, setNewPartRegistro] = useState('')
  const [newPartPhone, setNewPartPhone] = useState('')
  const [newPartEmail, setNewPartEmail] = useState('')

  useEffect(() => {
    setTenant(db.getTenant())
    setAllBirds(db.getBirds())
    const parts = getSavedParticipants()
    setParticipants(parts)

    // If editing existing reservation
    if (editId) {
      const allRes = getSavedReservations()
      const current = allRes.find(r => r.id === editId)
      if (current) {
        setSelectedParticipantId(current.participantId || '')
        setParticipantCpfCnpj(current.participantCpfCnpj || current.clientCpf || '')
        setParticipantRegistro(current.participantRegistro || '')
        setParticipantPhone(current.clientPhone || '')
        setParticipantEmail(current.clientEmail || '')
        setObservation(current.notes || current.observation || '')
        setPaymentType(current.paymentType || 'Boleto')
        setTotalAddition(current.totalAddition || 0)
        setTotalDiscount(current.totalDiscount || 0)
        setAvailableBirdsList(current.availableBirds || (current.birdName ? [{
          id: '1',
          birdId: current.birdId || '',
          name: current.birdName,
          ringNumber: current.birdRing || '',
          species: current.birdSpecies || '',
          sex: 'MALE',
          price: current.value || 0
        }] : []))
        setFutureChicksList(current.futureChicks || [])
      }
    }
  }, [editId])

  const handleParticipantChange = (id: string) => {
    setSelectedParticipantId(id)
    const part = participants.find(p => p.id === id)
    if (part) {
      setParticipantCpfCnpj(part.cpfCnpj)
      setParticipantRegistro(part.registro)
      setParticipantPhone(part.phone)
      setParticipantEmail(part.email)
    } else {
      setParticipantCpfCnpj('')
      setParticipantRegistro('')
      setParticipantPhone('')
      setParticipantEmail('')
    }
  }

  // Calculate totals
  const birdsTotal = availableBirdsList.reduce((sum, item) => sum + (item.price || 0), 0)
  const chicksTotal = futureChicksList.reduce((sum, item) => sum + (item.price || 0), 0)
  const totalGross = birdsTotal + chicksTotal
  const totalNet = Math.max(0, totalGross + totalAddition - totalDiscount)

  const formatCurrency = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Add Bird
  const handleAddBirdSubmit = () => {
    if (!selectedBirdToAdd) return
    const newItem: AvailableBirdItem = {
      id: `ab-${Date.now()}`,
      birdId: selectedBirdToAdd.id,
      name: selectedBirdToAdd.name,
      ringNumber: selectedBirdToAdd.ringNumber,
      species: selectedBirdToAdd.species,
      sex: selectedBirdToAdd.sex,
      price: parseFloat(birdPriceInput) || 0
    }
    setAvailableBirdsList([...availableBirdsList, newItem])
    setIsAddBirdModalOpen(false)
    setSelectedBirdToAdd(null)
    setBirdPriceInput('0')
  }

  // Add Chick
  const handleAddChickSubmit = () => {
    const newItem: FutureChickItem = {
      id: `fc-${Date.now()}`,
      fatherName: chickFather || 'Pai a definir',
      motherName: chickMother || 'Mãe a definir',
      species: chickSpecies,
      expectedDate: chickDate || new Date().toISOString().split('T')[0],
      price: parseFloat(chickPrice) || 0
    }
    setFutureChicksList([...futureChicksList, newItem])
    setIsAddChickModalOpen(false)
    setChickFather('')
    setChickMother('')
    setChickPrice('0')
  }

  // Add Participant
  const handleSaveNewParticipant = () => {
    if (!newPartName.trim()) return
    const newP: Participant = {
      id: `part-${Date.now()}`,
      name: newPartName,
      cpfCnpj: newPartCpf,
      registro: newPartRegistro,
      phone: newPartPhone,
      email: newPartEmail
    }
    const updated = [...participants, newP]
    setParticipants(updated)
    localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(updated))
    setSelectedParticipantId(newP.id)
    setParticipantCpfCnpj(newP.cpfCnpj)
    setParticipantRegistro(newP.registro)
    setParticipantPhone(newP.phone)
    setParticipantEmail(newP.email)
    setIsParticipantModalOpen(false)
    setNewPartName('')
    setNewPartCpf('')
    setNewPartRegistro('')
    setNewPartPhone('')
    setNewPartEmail('')
  }

  // Delete actions
  const handleDeleteAvailableBirds = () => {
    if (selectedBirdsToDelete.length === 0) {
      setAvailableBirdsList([])
    } else {
      setAvailableBirdsList(availableBirdsList.filter(b => !selectedBirdsToDelete.includes(b.id)))
      setSelectedBirdsToDelete([])
    }
  }

  const handleDeleteFutureChicks = () => {
    if (selectedChicksToDelete.length === 0) {
      setFutureChicksList([])
    } else {
      setFutureChicksList(futureChicksList.filter(c => !selectedChicksToDelete.includes(c.id)))
      setSelectedChicksToDelete([])
    }
  }

  // Save Reservation
  const handleSaveReservation = () => {
    const part = participants.find(p => p.id === selectedParticipantId)
    const clientName = part ? part.name : 'Cliente Não Identificado'
    const now = new Date().toISOString()

    const reservationData = {
      id: editId || `res-${Date.now()}`,
      tenantId: tenant.id,
      participantId: selectedParticipantId,
      participantCpfCnpj,
      participantRegistro,
      clientName,
      clientPhone: participantPhone,
      clientEmail: participantEmail,
      birdName: availableBirdsList.length > 0 ? availableBirdsList.map(b => b.name).join(', ') : 'Reserva de Filhotes',
      birdRing: availableBirdsList.length > 0 ? availableBirdsList.map(b => b.ringNumber).join(', ') : '-',
      birdSpecies: availableBirdsList.length > 0 ? availableBirdsList[0].species : (futureChicksList[0]?.species || 'Canário-da-terra'),
      value: totalNet,
      paymentType,
      totalGross,
      totalAddition,
      totalDiscount,
      totalNet,
      availableBirds: availableBirdsList,
      futureChicks: futureChicksList,
      notes: observation,
      status: 'ABERTO',
      createdAt: now,
      updatedAt: now
    }

    const allRes = getSavedReservations()
    if (editId) {
      const idx = allRes.findIndex(r => r.id === editId)
      if (idx >= 0) allRes[idx] = reservationData
      else allRes.push(reservationData)
    } else {
      allRes.unshift(reservationData)
    }

    saveReservationsList(allRes)
    router.push('/dashboard/reserva')
  }

  return (
    <div className="space-y-0 pb-12 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <Link href="/dashboard/reserva" className="text-[#00c853] hover:underline font-medium">Reserva</Link>
        <span>/</span>
        <span className="text-slate-400">Formulário</span>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden w-full">
        
        {/* Header Bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-[#f8fafc] flex items-center space-x-2">
          <FileEdit className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-semibold text-slate-700">Reserva</span>
        </div>

        {/* Tab Header */}
        <div className="px-4 pt-2 border-b border-slate-200 bg-white flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('RESERVA')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold border-t border-l border-r rounded-t transition cursor-pointer ${
              activeTab === 'RESERVA'
                ? 'bg-white text-slate-800 border-slate-300 -mb-px'
                : 'bg-slate-50 text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            <span>Reserva</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTO')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold border-t border-l border-r rounded-t transition cursor-pointer ${
              activeTab === 'DOCUMENTO'
                ? 'bg-white text-slate-800 border-slate-300 -mb-px'
                : 'bg-white text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Documento</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          
          {/* Participante Row */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 block">
              Participante<span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-1.5">
              <div className="relative flex-1">
                <select
                  value={selectedParticipantId}
                  onChange={(e) => handleParticipantChange(e.target.value)}
                  className="w-full h-8 px-3 pr-8 text-xs bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853] appearance-none cursor-pointer"
                >
                  <option value="">Selecione um participante...</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedParticipantId) {
                    const p = participants.find(part => part.id === selectedParticipantId)
                    if (p) {
                      setNewPartName(p.name)
                      setNewPartCpf(p.cpfCnpj)
                      setNewPartRegistro(p.registro)
                      setNewPartPhone(p.phone)
                      setNewPartEmail(p.email)
                      setIsParticipantModalOpen(true)
                    }
                  } else {
                    setIsParticipantModalOpen(true)
                  }
                }}
                className="w-8 h-8 bg-[#00c853] hover:bg-[#00b84a] text-white rounded flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                title="Editar participante"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewPartName('')
                  setNewPartCpf('')
                  setNewPartRegistro('')
                  setNewPartPhone('')
                  setNewPartEmail('')
                  setIsParticipantModalOpen(true)
                }}
                className="w-8 h-8 bg-[#00c853] hover:bg-[#00b84a] text-white rounded flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                title="Adicionar novo participante"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Columns: CNPJ/CPF, Registro, Fone, E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">CNPJ/CPF</label>
              <input
                type="text"
                value={participantCpfCnpj}
                onChange={(e) => setParticipantCpfCnpj(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-slate-100 border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Registro</label>
              <input
                type="text"
                value={participantRegistro}
                onChange={(e) => setParticipantRegistro(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">Fone</label>
              <input
                type="text"
                value={participantPhone}
                onChange={(e) => setParticipantPhone(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 block">E-mail</label>
              <input
                type="text"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>

          {/* Observação Row */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 block">Observação</label>
            <input
              type="text"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853]"
            />
          </div>

          {/* ================================================================ */}
          {/* TOTAL SECTION                                                    */}
          {/* ================================================================ */}
          <div className="pt-2 space-y-2">
            <h3 className="text-base font-semibold text-slate-700">Total</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {/* Tipo de Pagamento */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">
                  Tipo de Pagamento<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full h-8 px-2.5 pr-8 text-xs bg-white border border-slate-300 rounded text-slate-700 focus:outline-none focus:border-[#00c853] appearance-none cursor-pointer"
                  >
                    <option value="Boleto">Boleto</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Total Geral */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Total Geral</label>
                <div className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-700 flex items-center justify-end font-medium">
                  {formatCurrency(totalGross)}
                </div>
              </div>

              {/* Total Acrescimo */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Total Acrescimo</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalAddition || ''}
                  placeholder="R$ 0,00"
                  onChange={(e) => setTotalAddition(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded text-slate-700 text-right focus:outline-none focus:border-[#00c853]"
                />
              </div>

              {/* Total Desconto (Red) */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Total Desconto</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalDiscount || ''}
                  placeholder="R$ 0,00"
                  onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded text-red-500 font-medium text-right focus:outline-none focus:border-[#00c853]"
                />
              </div>

              {/* Total Liquido (Green) */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Total Liquido</label>
                <div className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded text-[#00c853] flex items-center justify-end font-bold">
                  {formatCurrency(totalNet)}
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* AVES DISPONÍVEIS SECTION                                         */}
          {/* ================================================================ */}
          <div className="pt-2">
            <div className="rounded border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-700">Aves Disponíveis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleDeleteAvailableBirds}
                    className="w-6 h-6 bg-[#f87171] hover:bg-red-500 text-white rounded flex items-center justify-center transition cursor-pointer"
                    title="Excluir aves selecionadas"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBirdToAdd(null)
                      setBirdPriceInput('0')
                      setIsAddBirdModalOpen(true)
                    }}
                    className="w-6 h-6 bg-[#00c853] hover:bg-[#00b84a] text-white rounded flex items-center justify-center transition cursor-pointer"
                    title="Adicionar ave"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              {availableBirdsList.length === 0 ? (
                <div className="bg-[#e8f4f8] py-3 text-center text-xs text-slate-600">
                  Lista <span className="font-bold text-slate-800">vazia.</span>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="w-8 px-3 py-1.5 text-center">#</th>
                        <th className="text-left px-3 py-1.5 font-semibold">Ave</th>
                        <th className="text-left px-3 py-1.5 font-semibold">Anilha</th>
                        <th className="text-left px-3 py-1.5 font-semibold">Espécie</th>
                        <th className="text-left px-3 py-1.5 font-semibold">Sexo</th>
                        <th className="text-right px-3 py-1.5 font-semibold">Valor (R$)</th>
                        <th className="w-12 px-3 py-1.5 text-center">Remover</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableBirdsList.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2 font-bold text-slate-800 uppercase">{item.name}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{item.ringNumber}</td>
                          <td className="px-3 py-2 text-slate-600">{item.species}</td>
                          <td className="px-3 py-2 text-slate-600">{item.sex === 'MALE' ? '♂ Macho' : '♀ Fêmea'}</td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-700">{formatCurrency(item.price)}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => setAvailableBirdsList(availableBirdsList.filter(b => b.id !== item.id))}
                              className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
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

          {/* ================================================================ */}
          {/* FILHOTES FUTUROS SECTION                                         */}
          {/* ================================================================ */}
          <div className="pt-2">
            <div className="rounded border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-700">Filhotes Futuros</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleDeleteFutureChicks}
                    className="w-6 h-6 bg-[#f87171] hover:bg-red-500 text-white rounded flex items-center justify-center transition cursor-pointer"
                    title="Excluir filhotes selecionados"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddChickModalOpen(true)}
                    className="w-6 h-6 bg-[#00c853] hover:bg-[#00b84a] text-white rounded flex items-center justify-center transition cursor-pointer"
                    title="Adicionar filhote futuro"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              {futureChicksList.length === 0 ? (
                <div className="bg-[#e8f4f8] py-3 text-center text-xs text-slate-600">
                  Lista <span className="font-bold text-slate-800">vazia.</span>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="w-8 px-3 py-1.5 text-center">#</th>
                        <th className="text-left px-3 py-1.5 font-semibold">Cruzamento (Pai x Mãe)</th>
                        <th className="text-left px-3 py-1.5 font-semibold">Espécie</th>
                        <th className="text-left px-3 py-1.5 font-semibold">Previsão</th>
                        <th className="text-right px-3 py-1.5 font-semibold">Valor (R$)</th>
                        <th className="w-12 px-3 py-1.5 text-center">Remover</th>
                      </tr>
                    </thead>
                    <tbody>
                      {futureChicksList.map((item, idx) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2 font-bold text-slate-800">{item.fatherName} x {item.motherName}</td>
                          <td className="px-3 py-2 text-slate-600">{item.species}</td>
                          <td className="px-3 py-2 text-slate-600">{item.expectedDate}</td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-700">{formatCurrency(item.price)}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => setFutureChicksList(futureChicksList.filter(c => c.id !== item.id))}
                              className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
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

        </div>

        {/* Bottom Actions: < Voltar and ✔ Salvar */}
        <div className="px-5 py-3 bg-[#f8fafc] border-t border-slate-200 flex items-center justify-between">
          <Link
            href="/dashboard/reserva"
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded flex items-center space-x-1 transition cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </Link>
          <button
            type="button"
            onClick={handleSaveReservation}
            className="px-4 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar</span>
          </button>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* MODAL: ADICIONAR AVE DISPONÍVEL                                      */}
      {/* ==================================================================== */}
      {isAddBirdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-800 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">Adicionar Ave Disponível</span>
              <button onClick={() => setIsAddBirdModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={birdSearch}
                  onChange={(e) => setBirdSearch(e.target.value)}
                  placeholder="Pesquisar por nome ou anilha..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {allBirds
                  .filter(b => !birdSearch || b.name.toLowerCase().includes(birdSearch.toLowerCase()) || b.ringNumber.toLowerCase().includes(birdSearch.toLowerCase()))
                  .map(b => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBirdToAdd(b)}
                      className={`p-2 rounded border text-xs cursor-pointer flex items-center justify-between transition ${
                        selectedBirdToAdd?.id === b.id
                          ? 'border-[#00c853] bg-sky-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-800 block uppercase">{b.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{b.ringNumber} • {b.species}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {b.sex === 'MALE' ? '♂ Macho' : '♀ Fêmea'}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200">
                <label className="text-[11px] font-medium text-slate-600 block">Valor da Ave (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={birdPriceInput}
                  onChange={(e) => setBirdPriceInput(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddBirdModalOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedBirdToAdd}
                onClick={handleAddBirdSubmit}
                className="px-4 py-1.5 bg-[#00c853] hover:bg-[#00b84a] disabled:opacity-50 text-white text-xs font-bold rounded transition cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADICIONAR FILHOTE FUTURO                                      */}
      {/* ==================================================================== */}
      {isAddChickModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-800 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">Adicionar Filhote Futuro</span>
              <button onClick={() => setIsAddChickModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Pai (Macho)</label>
                  <input
                    type="text"
                    value={chickFather}
                    onChange={(e) => setChickFather(e.target.value)}
                    placeholder="Nome ou Anilha do Pai"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Mãe (Fêmea)</label>
                  <input
                    type="text"
                    value={chickMother}
                    onChange={(e) => setChickMother(e.target.value)}
                    placeholder="Nome ou Anilha da Mãe"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Espécie</label>
                  <input
                    type="text"
                    value={chickSpecies}
                    onChange={(e) => setChickSpecies(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Data Prevista</label>
                  <input
                    type="date"
                    value={chickDate}
                    onChange={(e) => setChickDate(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Valor Estimado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={chickPrice}
                  onChange={(e) => setChickPrice(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddChickModalOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddChickSubmit}
                className="px-4 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-white text-xs font-bold rounded transition cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: PARTICIPANTE (NOVO / EDITAR)                                  */}
      {/* ==================================================================== */}
      {isParticipantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-800 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">Cadastrar / Editar Participante</span>
              <button onClick={() => setIsParticipantModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 block">Nome Completo / Criatório<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="Nome do cliente ou criador parceiro"
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">CNPJ/CPF</label>
                  <input
                    type="text"
                    value={newPartCpf}
                    onChange={(e) => setNewPartCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Registro / IBAMA</label>
                  <input
                    type="text"
                    value={newPartRegistro}
                    onChange={(e) => setNewPartRegistro(e.target.value)}
                    placeholder="SISPASS / IBAMA"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">Telefone</label>
                  <input
                    type="text"
                    value={newPartPhone}
                    onChange={(e) => setNewPartPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">E-mail</label>
                  <input
                    type="email"
                    value={newPartEmail}
                    onChange={(e) => setNewPartEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsParticipantModalOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!newPartName.trim()}
                onClick={handleSaveNewParticipant}
                className="px-4 py-1.5 bg-[#00c853] hover:bg-[#00b84a] disabled:opacity-50 text-white text-xs font-bold rounded transition cursor-pointer"
              >
                Salvar Participante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReservaFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Carregando formulário...</div>}>
      <ReservaFormContent />
    </Suspense>
  )
}

