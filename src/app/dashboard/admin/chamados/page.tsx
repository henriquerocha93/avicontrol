'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Headphones, 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2, 
  Sparkles, 
  Phone, 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  Check, 
  X, 
  ChevronRight, 
  ExternalLink,
  Flame,
  HelpCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { db } from '@/lib/db';
import { SupportTicket, SupportTicketMessage } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function AdminChamadosPage() {
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('ALL');
  
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = () => {
    const all = db.getAllTickets();
    setTickets(all);
    if (!selectedTicketId && all.length > 0) {
      setSelectedTicketId(all[0].id);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0] || null;

  useEffect(() => {
    if (selectedTicketId) {
      db.markTicketAsReadByAdmin(selectedTicketId);
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicketId, selectedTicket?.messages.length]);

  // Calculations & Metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const unreadCount = tickets.filter(t => t.unreadByAdmin).length;

  // Filtered List
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.criatorioName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userWhatsapp?.includes(searchQuery) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedTicket || isSending) return;

    setIsSending(true);
    const adminName = user?.name ? `${user.name} (Suporte BIRDPRO)` : 'Equipe de Suporte BIRDPRO';

    db.addTicketMessage(selectedTicket.id, adminName, replyText.trim(), true, 'ADMIN');
    setReplyText('');
    setIsSending(false);
    loadTickets();
  };

  const handleUpdateStatus = (status: SupportTicket['status']) => {
    if (!selectedTicket) return;
    db.updateTicketStatus(selectedTicket.id, status);
    loadTickets();
  };

  const handleFinalizeTicket = () => {
    if (!selectedTicket) return;
    db.updateTicketStatus(selectedTicket.id, 'RESOLVED');
    loadTickets();
  };

  const handleReopenTicket = () => {
    if (!selectedTicket) return;
    db.updateTicketStatus(selectedTicket.id, 'IN_PROGRESS');
    loadTickets();
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este chamado permanentemente?')) {
      db.deleteTicket(id);
      setSelectedTicketId(null);
      loadTickets();
    }
  };

  const handleQuickReply = (text: string) => {
    setReplyText(text);
  };

  const getWhatsAppUrl = (phone: string, ticket: SupportTicket) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const defaultMsg = `Olá ${ticket.userName}, sou da equipe de Suporte Oficial do BIRDPRO a respeito do seu chamado #${ticket.ticketCode} (${ticket.subject}). Como posso te auxiliar melhor?`;
    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(defaultMsg)}`;
  };

  return (
    <div className="space-y-6 pb-12 w-full font-sans text-slate-800 dark:text-slate-100">
      
      {/* ==================================================================== */}
      {/* HEADER BANNER                                                        */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-[#141b22] via-[#1a2332] to-[#0f241a] p-6 sm:p-7 rounded-3xl border border-emerald-500/30 shadow-2xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Headphones className="w-3.5 h-3.5" />
              <span>Central Oficial de Atendimento ao Criador</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Gestão de Chamados &amp; Bate-Papo ao Vivo
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black animate-pulse">
                  {unreadCount} novos
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Atenda criatórios em tempo real, responda dúvidas de genealogia e SISPASS, e contate diretamente os usuários via WhatsApp oficial com um clique.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={loadTickets}
              variant="outline"
              size="sm"
              className="border-emerald-700/60 bg-slate-900/60 text-slate-200 hover:bg-emerald-950/60 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Atualizar Lista
            </Button>
            <Link href="/dashboard/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Painel Master
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* METRIC COUNTER CARDS                                                 */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#212830] p-4 sm:p-5 rounded-2xl border border-[#30363d] space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total de Chamados</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalTickets}</span>
            <span className="text-xs text-slate-400">registrados</span>
          </div>
        </div>

        <div className="bg-[#212830] p-4 sm:p-5 rounded-2xl border border-rose-500/40 space-y-2 shadow-md bg-gradient-to-br from-rose-950/20 to-transparent">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Aguardando Resposta
            </span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{openTickets}</span>
            <span className="text-xs text-rose-300 font-semibold">abertos</span>
          </div>
        </div>

        <div className="bg-[#212830] p-4 sm:p-5 rounded-2xl border border-amber-500/40 space-y-2 shadow-md bg-gradient-to-br from-amber-950/20 to-transparent">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>Em Atendimento</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{inProgressTickets}</span>
            <span className="text-xs text-amber-300 font-semibold">em análise</span>
          </div>
        </div>

        <div className="bg-[#212830] p-4 sm:p-5 rounded-2xl border border-emerald-500/40 space-y-2 shadow-md bg-gradient-to-br from-emerald-950/20 to-transparent">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>Resolvidos / Fechados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{resolvedTickets}</span>
            <span className="text-xs text-emerald-400 font-semibold">concluídos</span>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SEARCH AND FILTERS BAR                                               */}
      {/* ==================================================================== */}
      <div className="bg-[#212830] p-4 rounded-2xl border border-[#30363d] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, criatório, WhatsApp..."
            className="w-full pl-10 pr-4 py-2 bg-[#1b2229] border border-[#30363d] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#1b2229] text-slate-400 hover:text-white border border-[#30363d]'
            }`}
          >
            Todos ({tickets.length})
          </button>
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'OPEN'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-[#1b2229] text-rose-300 hover:text-white border border-rose-900/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Abertos ({openTickets})
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#1b2229] text-amber-300 hover:text-white border border-amber-900/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Em Atendimento ({inProgressTickets})
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#1b2229] text-emerald-300 hover:text-white border border-emerald-900/40'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Resolvidos ({resolvedTickets})
          </button>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SPLIT SCREEN CHAT & TICKETS CONTAINER                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================================================================== */}
        {/* LEFT COLUMN: TICKETS LIST (4 COLS)                                 */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#212830] rounded-3xl border border-[#30363d] overflow-hidden shadow-xl flex flex-col h-[750px]">
          
          <div className="p-4 bg-[#1b2229] border-b border-[#30363d] flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Chamados Cadastrados ({filteredTickets.length})
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {unreadCount > 0 ? `${unreadCount} não lidos` : 'Todos lidos'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#30363d] custom-scrollbar">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center space-y-3 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
                <p className="text-xs font-semibold">Nenhum chamado encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const lastMsg = t.messages[t.messages.length - 1];

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 transition cursor-pointer flex flex-col gap-2 relative ${
                      isSelected 
                        ? 'bg-emerald-950/40 border-l-4 border-emerald-500 pl-3' 
                        : 'hover:bg-[#1b2229]'
                    }`}
                  >
                    {/* Top Row: Ticket Code, Status Badge & Priority */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                          {t.ticketCode || '#TKT-2026'}
                        </span>
                        {t.unreadByAdmin && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Nova mensagem não lida" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {t.status === 'OPEN' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Aberto
                          </span>
                        )}
                        {t.status === 'IN_PROGRESS' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Em Atendimento
                          </span>
                        )}
                        {t.status === 'RESOLVED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Resolvido
                          </span>
                        )}
                        {t.status === 'CLOSED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-600/30 text-slate-300 border border-slate-600">
                            Fechado
                          </span>
                        )}

                        {t.priority === 'HIGH' && (
                          <span className="text-[10px] font-bold text-rose-400 flex items-center">
                            <Flame className="w-3 h-3 mr-0.5" /> Alta
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Criatório & Solicitante */}
                    <div>
                      <h4 className="font-extrabold text-sm text-white leading-tight">
                        {t.subject}
                      </h4>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{t.criatorioName || 'Criatório'}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 truncate">{t.userName}</span>
                      </p>
                    </div>

                    {/* WhatsApp Fast Call Pill */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <a
                        href={getWhatsAppUrl(t.userWhatsapp, t)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] font-bold border border-[#25D366]/40 transition hover:scale-105"
                        title="Chamar no WhatsApp Oficial"
                      >
                        {/* Official WhatsApp SVG Vector Icon */}
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        <span>{t.userWhatsapp}</span>
                      </a>

                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: LIVE BATE-PAPO / CHAT WINDOW (8 COLS)                */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#212830] rounded-3xl border border-[#30363d] overflow-hidden shadow-2xl flex flex-col h-[750px]">
          
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 sm:p-5 bg-[#1b2229] border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
                      {selectedTicket.ticketCode}
                    </span>
                    <h3 className="text-base font-black text-white">
                      {selectedTicket.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                    <span className="font-bold flex items-center gap-1 text-emerald-400">
                      <Building2 className="w-3.5 h-3.5" />
                      {selectedTicket.criatorioName}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {selectedTicket.userName} ({selectedTicket.userEmail})
                    </span>
                  </div>
                </div>

                {/* Direct Actions: WhatsApp Call & Status Dropdown */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  
                  {/* WhatsApp Direct Action Button */}
                  <a
                    href={getWhatsAppUrl(selectedTicket.userWhatsapp, selectedTicket)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black rounded-xl shadow-lg shadow-[#25D366]/30 transition hover:scale-105"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>Conversar no WhatsApp</span>
                  </a>

                  {/* Primary Finalize Button */}
                  {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' ? (
                    <button
                      type="button"
                      onClick={handleFinalizeTicket}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-950/60 transition transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Finalizar Atendimento</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Concluído
                      </span>
                      <button
                        type="button"
                        onClick={handleReopenTicket}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl transition cursor-pointer"
                        title="Reabrir Chamado"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reabrir</span>
                      </button>
                    </div>
                  )}

                  {/* Status Switcher Button Group */}
                  <div className="flex items-center gap-1 p-1 bg-[#141a20] rounded-xl border border-[#30363d]">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        selectedTicket.status === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Em Atendimento
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        selectedTicket.status === 'RESOLVED'
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Resolvido
                    </button>
                  </div>

                  {/* Delete Ticket Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    title="Excluir Chamado Permanentemente"
                    className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/50 rounded-xl transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                </div>

              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#171c22] custom-scrollbar text-xs">
                
                {/* Initial Context Capsule */}
                <div className="p-3.5 rounded-2xl bg-[#1b2229] border border-[#30363d] space-y-1 text-slate-300 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Dados Oficiais da Abertura do Chamado
                    </span>
                    <span>{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div><strong>WhatsApp:</strong> {selectedTicket.userWhatsapp}</div>
                    <div><strong>Categoria:</strong> {selectedTicket.category}</div>
                    <div><strong>Prioridade:</strong> {selectedTicket.priority}</div>
                  </div>
                </div>

                {/* Messages Loop */}
                {selectedTicket.messages.map((m) => {
                  const isStaff = m.isStaff || m.senderRole === 'ADMIN' || m.senderRole === 'SUPPORT_AGENT';

                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 shadow-md ${
                        isStaff
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                          : 'bg-slate-700 text-slate-200'
                      }`}>
                        {isStaff ? 'ADM' : 'USER'}
                      </div>

                      {/* Bubble */}
                      <div className={`p-4 rounded-2xl max-w-[80%] space-y-1.5 shadow-md ${
                        isStaff
                          ? 'bg-gradient-to-br from-emerald-950/90 to-[#0c1f17] text-emerald-100 rounded-tr-xs border border-emerald-500/50'
                          : 'bg-[#212830] text-slate-100 rounded-tl-xs border border-[#30363d]'
                      }`}>
                        <div className="flex items-center justify-between gap-4 text-[11px]">
                          <span className={`font-black ${isStaff ? 'text-emerald-300 flex items-center gap-1' : 'text-slate-300'}`}>
                            {m.sender}
                            {isStaff && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line font-normal">
                          {m.content}
                        </p>
                      </div>

                    </div>
                  );
                })}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Reply Presets Bar */}
              <div className="px-4 py-2 bg-[#1b2229] border-t border-[#30363d] flex items-center gap-2 overflow-x-auto custom-scrollbar text-[11px]">
                <span className="text-slate-400 font-bold shrink-0">Respostas Rápidas:</span>
                <button
                  onClick={() => handleQuickReply('Olá! Recebemos sua solicitação e já estamos verificando no banco de dados do seu criatório.')}
                  className="px-2.5 py-1 rounded-lg bg-[#212830] hover:bg-emerald-950/60 hover:text-emerald-300 border border-[#30363d] text-slate-300 transition shrink-0 cursor-pointer"
                >
                  ⚡ Análise iniciada
                </button>
                <button
                  onClick={() => handleQuickReply('O ajuste foi realizado com sucesso em sua conta! Por favor, recarregue a página do painel.')}
                  className="px-2.5 py-1 rounded-lg bg-[#212830] hover:bg-emerald-950/60 hover:text-emerald-300 border border-[#30363d] text-slate-300 transition shrink-0 cursor-pointer"
                >
                  ✅ Ajuste concluído
                </button>
                <button
                  onClick={() => handleQuickReply('Te enviei uma mensagem direta no seu WhatsApp cadastrado com os detalhes e orientações!')}
                  className="px-2.5 py-1 rounded-lg bg-[#212830] hover:bg-emerald-950/60 hover:text-emerald-300 border border-[#30363d] text-slate-300 transition shrink-0 cursor-pointer"
                >
                  💬 Chamado via WhatsApp
                </button>
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-[#1b2229] border-t border-[#30363d] flex items-center gap-3"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Digite sua resposta oficial como Administrador BIRDPRO..."
                  className="flex-1 px-4 py-3 bg-[#141a20] border border-[#30363d] rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 font-medium"
                />

                <Button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="bg-[#00c853] hover:bg-emerald-600 disabled:opacity-50 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-950/60 transition cursor-pointer"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>Enviar</span>
                </Button>
              </form>

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
              <Headphones className="w-12 h-12 text-emerald-500 opacity-40" />
              <div>
                <h4 className="text-base font-bold text-white">Nenhum chamado selecionado</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Selecione um chamado na lista à esquerda para abrir a janela de bate-papo em tempo real.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
