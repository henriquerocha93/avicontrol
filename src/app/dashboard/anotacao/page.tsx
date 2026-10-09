'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Edit3, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  Trash2, 
  Pin, 
  PinOff, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  StickyNote, 
  Tag, 
  AlertCircle,
  FileText,
  ChevronLeft,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { NoteItem, NotePriority } from '@/types';
import { Button } from '@/components/ui/button';
import { DateManualInput } from '@/components/ui/date-manual-input';

const PRIORITY_CONFIG: Record<NotePriority, { label: string; bgBar: string; border: string; text: string; bgCard: string; dot: string }> = {
  HIGH: {
    label: 'Alta Prioridade / Urgente',
    bgBar: 'bg-[#fecaca] hover:bg-[#fca5a5]',
    border: 'border-red-300',
    text: 'text-red-900',
    bgCard: 'bg-red-50/70 border-red-200',
    dot: 'bg-red-500'
  },
  MEDIUM: {
    label: 'Média Prioridade',
    bgBar: 'bg-[#fef08a] hover:bg-[#fde047]',
    border: 'border-amber-300',
    text: 'text-amber-900',
    bgCard: 'bg-amber-50/70 border-amber-200',
    dot: 'bg-amber-500'
  },
  LOW: {
    label: 'Normal / Baixa Prioridade',
    bgBar: 'bg-[#bbf7d0] hover:bg-[#86efac]',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    bgCard: 'bg-emerald-50/70 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  INFO: {
    label: 'Informativa / Ideia & Manejo',
    bgBar: 'bg-[#bae6fd] hover:bg-[#7dd3fc]',
    border: 'border-sky-300',
    text: 'text-sky-900',
    bgCard: 'bg-sky-50/70 border-sky-200',
    dot: 'bg-sky-500'
  }
};

export default function AnotacoesPage() {
  const { tenant } = useAuth();

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOTE_ONLY' | 'CALENDAR_REMINDER' | 'PINNED' | 'FINALIZED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Form State matching the screenshot
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<'NOTE_ONLY' | 'CALENDAR_REMINDER'>('NOTE_ONLY');
  const [agendaDate, setAgendaDate] = useState('');
  const [agendaTime, setAgendaTime] = useState('');
  const [priority, setPriority] = useState<NotePriority>('HIGH');
  const [finalized, setFinalized] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = () => {
    const list = db.getNotes(tenant?.id);
    setNotes(list);
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setNoteType('NOTE_ONLY');
    setAgendaDate('');
    setAgendaTime('');
    setPriority('HIGH');
    setFinalized(false);
    setPinned(false);
  };

  const handleEditNote = (note: NoteItem) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setNoteType(note.type);
    setAgendaDate(note.agendaDate || '');
    setAgendaTime(note.agendaTime || '');
    setPriority(note.priority);
    setFinalized(note.finalized);
    setPinned(note.pinned || false);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Por favor, preencha o Título e o Texto da Anotação.');
      return;
    }

    const payload = {
      tenantId: tenant?.id || 'tenant-demo-01',
      title: title.trim(),
      content: content.trim(),
      type: noteType,
      agendaDate: noteType === 'CALENDAR_REMINDER' ? agendaDate : undefined,
      agendaTime: noteType === 'CALENDAR_REMINDER' ? agendaTime : undefined,
      priority,
      finalized,
      pinned
    };

    if (editingId) {
      const existing = notes.find(n => n.id === editingId);
      if (existing) {
        db.updateNote({
          ...existing,
          ...payload
        });
        showToast('✨ Anotação atualizada com sucesso!');
      }
    } else {
      db.addNote(payload);
      showToast(noteType === 'CALENDAR_REMINDER' 
        ? '📅 Anotação salva e sincronizada na sua Agenda / Calendário!' 
        : '📌 Anotação salva no seu Bloco de Notas!');
    }

    handleResetForm();
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir esta anotação?')) {
      db.deleteNote(id);
      if (editingId === id) handleResetForm();
      loadData();
      showToast('🗑️ Anotação excluída.');
    }
  };

  const handleToggleFinalized = (id: string) => {
    db.toggleNoteFinalized(id);
    loadData();
  };

  const handleTogglePinned = (id: string) => {
    db.toggleNotePinned(id);
    loadData();
  };

  // Filtered Notes for the Bloco de Notas area
  const filteredNotes = notes.filter(n => {
    if (activeTab === 'NOTE_ONLY' && n.type !== 'NOTE_ONLY') return false;
    if (activeTab === 'CALENDAR_REMINDER' && n.type !== 'CALENDAR_REMINDER') return false;
    if (activeTab === 'PINNED' && !n.pinned) return false;
    if (activeTab === 'FINALIZED' && !n.finalized) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Top Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link href="/dashboard" className="text-[#0284c7] hover:underline font-bold">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-bold">Anotação</span>
      </div>

      {/* ========================================================================= */}
      {/* FORM CONTAINER (Matching the exact UI layout from user screenshot)        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Card Header (Matching screenshot: [Icon] Anotação) */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-sm text-slate-800">
              {editingId ? 'Editar Anotação' : 'Anotação'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1 rounded bg-slate-200/60 cursor-pointer"
              >
                + Nova Anotação
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          
          {/* Título* */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Título<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da anotação..."
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] transition"
            />
          </div>

          {/* Texto* */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Texto<span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o texto detalhado da sua anotação..."
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] transition leading-relaxed resize-y"
            />
          </div>

          {/* Two Columns: Agenda (Left) & Prioridade (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            
            {/* LEFT COLUMN: Agenda Option (Lembrete na Agenda vs Apenas Bloco de Notas) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Agenda</label>
              
              {/* Type Switcher Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setNoteType('NOTE_ONLY')}
                  className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    noteType === 'NOTE_ONLY'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                  <span>Apenas Bloco de Notas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('CALENDAR_REMINDER')}
                  className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    noteType === 'CALENDAR_REMINDER'
                      ? 'bg-white text-[#0284c7] shadow-xs border border-slate-300'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Lembrete na Agenda</span>
                </button>
              </div>

              {/* Date & Time Inputs (Active when Calendar Reminder is chosen) */}
              {noteType === 'CALENDAR_REMINDER' ? (
                <div className="space-y-2 p-3 bg-sky-50/60 rounded-xl border border-sky-200 animate-in fade-in">
                  <div className="relative">
                    <DateManualInput
                      required={noteType === 'CALENDAR_REMINDER'}
                      value={agendaDate}
                      onChange={(val) => setAgendaDate(val)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={agendaTime}
                      onChange={(e) => setAgendaTime(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <p className="text-[10px] text-sky-800 font-medium">
                    ✓ Este compromisso será adicionado automaticamente no seu <strong>Calendário</strong> com notificação.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                  📌 <strong>Modo Bloco de Notas:</strong> Ficará armazenado diretamente no seu painel de anotações sem exigir data ou horário específico.
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Prioridade (Matching screenshot 4 colored horizontal bands) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">Prioridade</label>
              
              <div className="space-y-1.5">
                
                {/* Red / Rose Bar (HIGH) */}
                <label 
                  onClick={() => setPriority('HIGH')}
                  className={`flex items-center gap-3 p-2 rounded-md transition cursor-pointer border ${PRIORITY_CONFIG.HIGH.bgBar} ${
                    priority === 'HIGH' ? 'ring-2 ring-red-400 border-red-400 font-bold' : 'border-red-200 opacity-90 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'HIGH'}
                    onChange={() => setPriority('HIGH')}
                    className="w-4 h-4 accent-red-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-red-950">Alta Prioridade / Urgente</span>
                </label>

                {/* Yellow / Amber Bar (MEDIUM) */}
                <label 
                  onClick={() => setPriority('MEDIUM')}
                  className={`flex items-center gap-3 p-2 rounded-md transition cursor-pointer border ${PRIORITY_CONFIG.MEDIUM.bgBar} ${
                    priority === 'MEDIUM' ? 'ring-2 ring-amber-400 border-amber-400 font-bold' : 'border-amber-200 opacity-90 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'MEDIUM'}
                    onChange={() => setPriority('MEDIUM')}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-950">Média Prioridade</span>
                </label>

                {/* Green / Emerald Bar (LOW) */}
                <label 
                  onClick={() => setPriority('LOW')}
                  className={`flex items-center gap-3 p-2 rounded-md transition cursor-pointer border ${PRIORITY_CONFIG.LOW.bgBar} ${
                    priority === 'LOW' ? 'ring-2 ring-emerald-400 border-emerald-400 font-bold' : 'border-emerald-200 opacity-90 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'LOW'}
                    onChange={() => setPriority('LOW')}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-950">Normal / Baixa Prioridade</span>
                </label>

                {/* Blue / Sky Bar (INFO) */}
                <label 
                  onClick={() => setPriority('INFO')}
                  className={`flex items-center gap-3 p-2 rounded-md transition cursor-pointer border ${PRIORITY_CONFIG.INFO.bgBar} ${
                    priority === 'INFO' ? 'ring-2 ring-sky-400 border-sky-400 font-bold' : 'border-sky-200 opacity-90 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'INFO'}
                    onChange={() => setPriority('INFO')}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-sky-950">Informativa / Ideia</span>
                </label>

              </div>
            </div>

          </div>

          {/* Finalizado Switch (Matching screenshot) */}
          <div className="pt-2">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Finalizado</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFinalized(!finalized)}
                className={`relative inline-flex h-6 w-14 items-center rounded-full transition-colors cursor-pointer ${
                  finalized ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    finalized ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-xs font-bold ${finalized ? 'text-emerald-700' : 'text-slate-400'}`}>
                {finalized ? 'SIM' : 'NÃO'}
              </span>
            </div>
          </div>

          {/* Bottom Actions Row: [< Voltar] and [✔ Salvar] (Matching screenshot) */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center gap-1 transition cursor-pointer border border-slate-300"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>

            <Button
              type="submit"
              className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-md flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar</span>
            </Button>
          </div>

        </form>

      </div>

      {/* ========================================================================= */}
      {/* BLOCO DE NOTAS / MURAL DE ANOTAÇÕES CADASTRADAS                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Mural de Anotações &amp; Bloco de Notas ({notes.length})
              </h2>
              <p className="text-xs text-slate-500">Seus registros rápidos, ideias de manejo e lembretes de agenda</p>
            </div>
          </div>

          {/* Search Box & Tab Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar nas anotações..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284c7]"
              />
            </div>

            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 pr-7 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas ({notes.length})</option>
              <option value="NOTE_ONLY">📌 Bloco de Notas ({notes.filter(n => n.type === 'NOTE_ONLY').length})</option>
              <option value="CALENDAR_REMINDER">📅 Lembretes na Agenda ({notes.filter(n => n.type === 'CALENDAR_REMINDER').length})</option>
              <option value="PINNED">⭐ Fixadas ({notes.filter(n => n.pinned).length})</option>
              <option value="FINALIZED">✓ Finalizadas ({notes.filter(n => n.finalized).length})</option>
            </select>
          </div>
        </div>

        {/* Notes Grid Display (Post-it / Card Style) */}
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold text-slate-700">Nenhuma anotação encontrada</h3>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Utilize o formulário acima para registrar anotações no bloco de notas ou agendar lembretes com data e horário.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => {
              const pCfg = PRIORITY_CONFIG[note.priority] || PRIORITY_CONFIG.HIGH;
              return (
                <div
                  key={note.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 relative group ${pCfg.bgCard}`}
                >
                  <div className="space-y-3">
                    
                    {/* Top Bar inside Card */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${pCfg.bgBar} ${pCfg.text}`}>
                        {pCfg.label.split('/')[0]}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePinned(note.id)}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            note.pinned ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title={note.pinned ? 'Desafixar anotação' : 'Fixar no topo'}
                        >
                          {note.pinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditNote(note)}
                          className="p-1 text-slate-400 hover:text-[#0284c7] rounded-md transition cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`font-black text-sm text-slate-900 leading-snug ${note.finalized ? 'line-through opacity-60' : ''}`}>
                      {note.title}
                    </h3>

                    {/* Content */}
                    <p className={`text-xs text-slate-700 leading-relaxed whitespace-pre-line ${note.finalized ? 'line-through opacity-60' : ''}`}>
                      {note.content}
                    </p>
                  </div>

                  {/* Footer Info inside Card */}
                  <div className="pt-4 mt-3 border-t border-slate-200/60 space-y-2">
                    
                    {/* Calendar Badge if linked to Calendar */}
                    {note.type === 'CALENDAR_REMINDER' && note.agendaDate ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-800 bg-sky-100/80 px-2.5 py-1 rounded-md border border-sky-200">
                        <CalendarIcon className="w-3 h-3 text-sky-600 shrink-0" />
                        <span>Agenda: {note.agendaDate} {note.agendaTime ? `às ${note.agendaTime}` : ''}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <StickyNote className="w-3 h-3 text-amber-500" />
                        <span>Bloco de Notas</span>
                      </div>
                    )}

                    {/* Finalized toggle button */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleFinalized(note.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                          note.finalized
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{note.finalized ? 'Finalizado' : 'Marcar Finalizado'}</span>
                      </button>

                      <span className="text-[10px] text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
