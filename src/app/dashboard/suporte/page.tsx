'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Send, 
  Zap, 
  MessageSquare, 
  Headphones, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  X, 
  RefreshCw, 
  User, 
  ChevronRight, 
  Lightbulb, 
  LifeBuoy, 
  BadgeCheck,
  Building2,
  FileCheck,
  PhoneCall,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { SupportTicket, AiLearnedInsight } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'consultant' | 'user';
  text: string;
  timestamp: string;
  actionLink?: {
    label: string;
    href: string;
  };
  suggestTicket?: boolean;
}

export default function SuportePage() {
  const { tenant, user } = useAuth();
  
  // Navigation View
  const [activeTab, setActiveTab] = useState<'CONSULTANT_CHAT' | 'TICKETS'>('CONSULTANT_CHAT');
  
  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  
  const [form, setForm] = useState({
    subject: '',
    userWhatsapp: '',
    category: 'QUESTION' as SupportTicket['category'],
    priority: 'MEDIUM' as SupportTicket['priority'],
    message: ''
  });

  // Consultant Chat State (Starts clean, initiates only when user speaks)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConsultantTyping, setIsConsultantTyping] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadTickets = () => {
    const list = db.getTickets(tenant?.id);
    setTickets(list);
    if (!selectedTicket && list.length > 0) {
      setSelectedTicket(list[0]);
    }
  };

  const updateLearnedCount = () => {
    const insights = db.getLearnedInsights();
    setLearnedCount(insights.length);
  };

  useEffect(() => {
    loadTickets();
    updateLearnedCount();
    if (tenant?.whatsapp || tenant?.phone) {
      setForm(prev => ({ ...prev, userWhatsapp: tenant.whatsapp || tenant.phone || '' }));
    }
  }, [tenant?.id, tenant?.whatsapp, tenant?.phone]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isConnecting, isConsultantTyping]);

  // Helper to extract a topic summary for continuous learning
  const extractTopic = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('sispass') || lower.includes('ibama')) return 'SISPASS & IBAMA';
    if (lower.includes('árvore') || lower.includes('arvore') || lower.includes('genealog') || lower.includes('pedigree')) return 'Genealogia & Pedigree';
    if (lower.includes('choco') || lower.includes('ovo') || lower.includes('eclos')) return 'Incubação & Choco';
    if (lower.includes('anilha') || lower.includes('anilhamento')) return 'Anilhamento';
    if (lower.includes('calendário') || lower.includes('calendario') || lower.includes('agenda')) return 'Calendário & Lembretes';
    if (lower.includes('plano') || lower.includes('assinatura') || lower.includes('preço') || lower.includes('preco')) return 'Planos & Assinatura';
    if (lower.includes('cruzamento') || lower.includes('genetica') || lower.includes('consang')) return 'Genética & Pareamento';
    return text.length > 30 ? text.slice(0, 30) + '...' : text;
  };

  // Handle Consultant Message Submission with Realistic Human Interaction
  const handleSendConsultantMessage = async (customText?: string) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim() || isConnecting || isConsultantTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const isFirstInteraction = chatMessages.length === 0;
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    if (!customText) setUserInput('');

    // Step 1: Connecting notice ("Rodrigo Matos vai iniciar seu atendimento em instantes...")
    setIsConnecting(true);
    const startTime = Date.now();

    try {
      const payloadMessages = newHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      // Retrieve existing continuous learning insights from local db
      const existingInsights = db.getLearnedInsights();

      // Parallel fetch to backend AI route
      const fetchPromise = fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          userName: user?.name || 'Criador',
          learnedInsights: existingInsights
        })
      });

      // Brief connection transition (1.2s to 1.6s)
      await new Promise(r => setTimeout(r, isFirstInteraction ? 1400 : 800));
      setIsConnecting(false);
      setIsConsultantTyping(true);

      const res = await fetchPromise;
      if (!res.ok) {
        throw new Error('Falha na resposta do servidor');
      }

      const data = await res.json();
      const fullReply = data.reply || 'Olá! Como posso orientar você sobre o manejo do criatório ou sobre o sistema hoje?';

      // Step 2: Natural human reading & thinking pause
      const elapsed = Date.now() - startTime;
      const minDelay = Math.min(3000, Math.max(2200, textToSend.length * 30));
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }

      // Step 3: Persist newly learned insight into client continuous memory
      const topicName = extractTopic(textToSend);
      if (!/^(oi|ola|bom dia|boa tarde|boa noite)\b/i.test(textToSend)) {
        db.addLearnedInsight(topicName, textToSend, fullReply.slice(0, 180) + '...', user?.name);
        updateLearnedCount();
      }

      // Step 4: Stream consultant response smoothly into chat
      const consultantMsgId = `msg-consultant-${Date.now()}`;
      const consultantMsg: ChatMessage = {
        id: consultantMsgId,
        sender: 'consultant',
        text: '',
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: data.actionLink,
        suggestTicket: data.suggestTicket
      };

      setIsConsultantTyping(false);
      setChatMessages(prev => [...prev, consultantMsg]);

      // Stream text in words for a natural human typing feel with punctuation pauses
      const words = fullReply.split(' ');
      let accumulated = '';
      for (let i = 0; i < words.length; i++) {
        accumulated += (i === 0 ? '' : ' ') + words[i];
        const currentText = accumulated;
        setChatMessages(prev => 
          prev.map(m => m.id === consultantMsgId ? { ...m, text: currentText } : m)
        );
        
        if (i < words.length - 1) {
          const word = words[i];
          let delay = 28;
          if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?')) {
            delay = 170;
          } else if (word.endsWith(',') || word.endsWith(';')) {
            delay = 90;
          }
          await new Promise(r => setTimeout(r, delay));
        }
      }

    } catch (err) {
      console.error('Erro no atendimento do consultor:', err);
      setIsConnecting(false);
      setIsConsultantTyping(false);
      const fallbackMsg: ChatMessage = {
        id: `msg-consultant-${Date.now()}`,
        sender: 'consultant',
        text: `Olá! Estou à sua inteira disposição. Por favor, detalhe sua dúvida sobre a plataforma BIRDPRO ou sobre o manejo das suas aves para que eu possa te orientar passo a passo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    }
  };

  const handleOpenTicketWithQuery = (prefillSubject?: string) => {
    setForm({
      subject: prefillSubject || 'Dúvida / Solicitação de Suporte Técnico BIRDPRO',
      userWhatsapp: tenant?.whatsapp || tenant?.phone || '',
      category: 'TECHNICAL',
      priority: 'HIGH',
      message: prefillSubject ? `Olá equipe BIRDPRO, gostaria de solicitar auxílio técnico para a seguinte questão:\n\n"${prefillSubject}"` : ''
    });
    setIsNewTicketOpen(true);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim() || !form.userWhatsapp.trim()) return;

    const newTkt = db.addTicket({
      tenantId: tenant?.id || 'tenant-demo-01',
      criatorioName: tenant?.name || 'Meu Criatório',
      userName: user?.name || tenant?.name || 'Criador',
      userEmail: user?.email || tenant?.email || 'contato@criatorio.com.br',
      userWhatsapp: form.userWhatsapp.trim(),
      subject: form.subject.trim(),
      category: form.category,
      priority: form.priority,
      status: 'OPEN'
    }, form.message.trim());

    loadTickets();
    setSelectedTicket(newTkt);
    setIsNewTicketOpen(false);
    setActiveTab('TICKETS');
    setForm({ subject: '', userWhatsapp: tenant?.whatsapp || tenant?.phone || '', category: 'QUESTION', priority: 'MEDIUM', message: '' });
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    db.addTicketMessage(selectedTicket.id, user?.name || tenant?.name || 'Criador', replyMessage.trim(), false, 'USER');
    setReplyMessage('');
    loadTickets();
    const updated = db.getTickets(tenant?.id).find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket({ ...updated });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-slate-800">
      
      {/* Top Professional Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          {/* Consultant Real Photo Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-400/60 shadow-lg relative bg-slate-800">
              <img
                src="/images/support_agent.jpg"
                alt="Rodrigo Matos - Consultor Técnico BIRDPRO"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Central de Atendimento &amp; Consultoria
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Atendimento Imediato
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consultoria técnica e zootécnica com <strong className="text-white">Rodrigo Matos</strong> e equipe de suporte especializado da BIRDPRO.
            </p>
          </div>
        </div>

        {/* Tab & Action Buttons */}
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <div className="inline-flex rounded-xl bg-slate-950/80 p-1 border border-slate-700 w-full md:w-auto justify-center">
            <button
              onClick={() => setActiveTab('CONSULTANT_CHAT')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'CONSULTANT_CHAT'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BadgeCheck className="w-4 h-4 text-emerald-300" />
              <span>Consultor Técnico</span>
            </button>

            <button
              onClick={() => setActiveTab('TICKETS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'TICKETS'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>Chamados Formais ({tickets.length})</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setIsNewTicketOpen(true)}
            className="bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-extrabold text-xs shrink-0 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Abrir Chamado</span>
          </Button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. CONSULTANT CHAT (Professional, Human, Continuous Learning Support)     */}
      {/* ========================================================================= */}
      {activeTab === 'CONSULTANT_CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Consultant Profile & Quick Topics */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Consultant Profile Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shrink-0">
                  <img
                    src="/images/support_agent.jpg"
                    alt="Rodrigo Matos"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-xs text-slate-900">Rodrigo Matos</h3>
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Consultor Técnico BIRDPRO</p>
                  <p className="text-[10px] text-emerald-700 font-bold">Online • Tempo de resposta: &lt; 1 min</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px]">Especialista em SISPASS, Genealogia e Manejo de Passeriformes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px]">Consultoria operacional e regulatória para criatórios comerciais e amadores.</span>
                </div>
                {learnedCount > 0 && (
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Memória de {learnedCount} caso(s) aprendidos e aperfeiçoados com criadores.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Consultation Topics */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                  Tópicos de Ajuda Rápida
                </h3>
              </div>
              <div className="space-y-1.5">
                {[
                  'Como importar o arquivo do SISPASS / IBAMA?',
                  'Como emitir a árvore genealógica de 5 gerações com QR Code?',
                  'Como configurar alertas de eclosão e anilhamento no calendário?',
                  'Como usar o bloco de notas e vincular à agenda?',
                  'Qual é o período ideal de choco e diâmetro de anilhas?',
                  'Quais as vantagens do plano anual?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendConsultantMessage(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200/80 text-[11px] font-medium text-slate-700 transition flex items-center justify-between group cursor-pointer"
                  >
                    <span className="line-clamp-2 leading-tight">{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Formal Ticket Escalation Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 border border-slate-700 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Headphones className="w-4 h-4" />
                <span>Atendimento de Engenharia</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Precisa de uma análise detalhada da nossa equipe técnica ou suporte financeiro com SLA garantido?
              </p>
              <button
                onClick={() => setIsNewTicketOpen(true)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Registrar Chamado Oficial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Column: Live Chat Interface */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[670px] overflow-hidden">
            
            {/* Chat Top Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500/40 relative bg-slate-200 dark:bg-slate-800 shrink-0">
                  <img
                    src="/images/support_agent.jpg"
                    alt="Rodrigo Matos"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Rodrigo Matos</h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                      Consultor Técnico
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">BIRDPRO • Atendimento Técnico Especializado</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChatMessages([])}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Reiniciar Atendimento"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Conversation Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/40 dark:bg-slate-950/40">
              
              {/* Empty state when conversation hasn't been initiated yet */}
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-md relative bg-slate-100 dark:bg-slate-800">
                    <img
                      src="/images/support_agent.jpg"
                      alt="Rodrigo Matos"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Rodrigo Matos online • Pronto para atender
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white pt-1">
                      Como posso orientar você hoje?
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Digite sua dúvida abaixo ou clique em um dos tópicos rápidos ao lado para iniciar seu atendimento técnico com Rodrigo Matos.
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Message List */}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Message Avatar */}
                  {msg.sender === 'consultant' ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/50 shrink-0 bg-slate-200 dark:bg-slate-800 shadow-2xs">
                      <img
                        src="/images/support_agent.jpg"
                        alt="Rodrigo Matos"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Box */}
                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-[#0284c7] text-white rounded-3xl rounded-tr-xs p-4 shadow-sm'
                      : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-3xl rounded-tl-xs p-5 shadow-xs border border-slate-200/90 dark:border-slate-700/80'
                  }`}>
                    {msg.sender === 'consultant' && (
                      <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        <span>Rodrigo Matos</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Consultor BIRDPRO</span>
                      </div>
                    )}

                    <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-200">
                      {msg.text}
                    </div>

                    {/* Contextual direct shortcut link */}
                    {msg.actionLink && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        <Link
                          href={msg.actionLink.href}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-extrabold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition shadow-2xs"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{msg.actionLink.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </div>
                    )}

                    {/* Ticket escalation if needed */}
                    {msg.suggestTicket && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleOpenTicketWithQuery(userInput || 'Atendimento com Suporte')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Abrir Chamado com Engenharia de Suporte</span>
                        </button>
                      </div>
                    )}

                    <span className={`text-[10px] block text-right font-medium ${
                      msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {/* Connecting Notice Indicator */}
              {isConnecting && (
                <div className="flex items-center justify-center my-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/80 text-xs font-bold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span>Rodrigo Matos vai iniciar seu atendimento em instantes...</span>
                  </div>
                </div>
              )}

              {/* Consultant Typing Indicator */}
              {isConsultantTyping && (
                <div className="flex items-center gap-3 animate-in fade-in duration-150">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/50 shrink-0 bg-slate-200 dark:bg-slate-800">
                    <img
                      src="/images/support_agent.jpg"
                      alt="Rodrigo Matos"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-3.5 shadow-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">Rodrigo Matos está digitando...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendConsultantMessage(); }} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Digite sua mensagem para falar com Rodrigo Matos..."
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 font-medium"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isConnecting || isConsultantTyping}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORMAL TICKETS INTERFACE                                               */}
      {/* ========================================================================= */}
      {activeTab === 'TICKETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Tickets List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">
                Seus Chamados ({tickets.length})
              </h3>
              <button
                onClick={() => setIsNewTicketOpen(true)}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Novo Chamado
              </button>
            </div>

            {tickets.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <LifeBuoy className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="text-xs font-bold text-slate-700">Nenhum chamado aberto</h4>
                <p className="text-[11px] text-slate-400">Você ainda não possui chamados pendentes.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                {tickets.map((tkt) => {
                  const isSelected = selectedTicket?.id === tkt.id;
                  return (
                    <div
                      key={tkt.id}
                      onClick={() => setSelectedTicket(tkt)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected 
                          ? 'bg-emerald-50/70 border-emerald-500/40 shadow-xs' 
                          : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">{tkt.subject}</span>
                        <Badge variant={tkt.status === 'RESOLVED' ? 'success' : tkt.status === 'IN_PROGRESS' ? 'warning' : 'info'} size="sm">
                          {tkt.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {tkt.messages[tkt.messages.length - 1]?.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span className="font-bold text-slate-600">{tkt.category}</span>
                        <span>{formatDate(tkt.updatedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Message Conversation */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between min-h-[550px]">
            {selectedTicket ? (
              <>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-black border border-emerald-300 dark:border-emerald-700/60">
                        {selectedTicket.ticketCode || `#${selectedTicket.id}`}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{selectedTicket.subject}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedTicket.status === 'OPEN' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          Aberto
                        </span>
                      )}
                      {selectedTicket.status === 'IN_PROGRESS' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          Em Atendimento
                        </span>
                      )}
                      {selectedTicket.status === 'RESOLVED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Resolvido
                        </span>
                      )}
                      {selectedTicket.status === 'CLOSED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
                          Fechado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap font-medium">
                    <span>Categoria: <strong className="text-slate-700 dark:text-slate-200">{selectedTicket.category}</strong></span>
                    <span>•</span>
                    <span>WhatsApp do Criador: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{selectedTicket.userWhatsapp || 'Não informado'}</strong></span>
                    <span>•</span>
                    <span>Aberto em: {formatDate(selectedTicket.createdAt)}</span>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 py-4 space-y-4 overflow-y-auto max-h-[380px] custom-scrollbar">
                  {selectedTicket.messages.map((msg) => {
                    const isStaff = msg.isStaff || msg.senderRole === 'ADMIN' || msg.senderRole === 'SUPPORT_AGENT';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[11px] font-bold ${isStaff ? 'text-emerald-600 dark:text-emerald-400 flex items-center gap-1' : 'text-slate-700 dark:text-slate-300'}`}>
                            {isStaff ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Suporte Oficial BIRDPRO</span>
                              </>
                            ) : (
                              msg.sender
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>

                        <div className={`p-4 rounded-2xl max-w-lg text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                          isStaff
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/50 text-slate-800 dark:text-emerald-100 rounded-tl-xs'
                            : 'bg-[#00c853] text-white rounded-tr-xs shadow-md'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Bar */}
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Digite sua resposta para a equipe de suporte..."
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  <Button type="submit" className="bg-[#00c853] hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl cursor-pointer shadow-md">
                    <Send className="w-4 h-4 mr-1.5" />
                    Responder
                  </Button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-12">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhum chamado selecionado</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Selecione um chamado na lista ao lado para ver o histórico de mensagens ou consulte nosso <strong>Consultor Técnico Rodrigo Matos</strong> para suporte imediato.
                </p>
                <Button onClick={() => setActiveTab('CONSULTANT_CHAT')} variant="outline" size="sm">
                  <BadgeCheck className="w-4 h-4 mr-1 text-emerald-600" />
                  Falar com o Consultor
                </Button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: ABRIR NOVO CHAMADO OFICIAL                                      */}
      {/* ========================================================================= */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 font-sans">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white">Abrir Chamado Oficial</h3>
              </div>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4 text-xs">
              
              {/* WhatsApp Mandatory Field */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-1.5">
                <label className="block font-black text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    WhatsApp para Contato Direto * (Obrigatório)
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">com DDD</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.userWhatsapp}
                  onChange={(e) => setForm({ ...form, userWhatsapp: e.target.value })}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-slate-900 dark:text-white text-xs"
                />
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Nossa equipe técnica responderá neste painel e poderá enviar avisos pelo WhatsApp oficial.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assunto do Chamado *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ex: Dúvida sobre anilhas, importação SISPASS, alteração de dados..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="QUESTION">Dúvida Geral</option>
                    <option value="TECHNICAL">Suporte Técnico / Sistema</option>
                    <option value="BILLING">Financeiro / Planos</option>
                    <option value="FEATURE_REQUEST">Sugestão de Melhoria</option>
                    <option value="BUG">Problema / Inconsistência</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mensagem / Detalhes *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Descreva detalhadamente sua dúvida ou solicitação para nossa equipe..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  className="bg-[#00c853] hover:bg-emerald-600 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Enviar Chamado Oficial
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
