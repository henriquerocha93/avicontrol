'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Check, 
  ChevronRight, 
  RefreshCw, 
  Zap, 
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface AviBotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionLink?: {
    label: string;
    href: string;
  };
}

export function AviBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPromptNotification, setHasPromptNotification] = useState(true);
  const [messages, setMessages] = useState<AviBotMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Olá, criador! Eu sou o **AviBot**, o assistente inteligente de dúvidas do **BIRDPRO**. 🤖\n\nEstou aqui para tirar todas as suas dúvidas sobre recursos do sistema, planos, pedigree A4, genealogia ou importação do SISPASS.\n\nComo posso te ajudar agora?',
      timestamp: 'Agora'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    '💰 Quais são os planos e valores?',
    '🧬 Como funciona a árvore genealógica?',
    '📑 Como funciona a importação do SISPASS?',
    '📜 O pedigree tem QR Code e impressão A4?',
    '🛡️ Posso gerenciar quantas aves quiser?'
  ];

  useEffect(() => {
    if (isOpen) {
      setHasPromptNotification(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: AviBotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!customText) setInput('');
    setIsTyping(true);

    try {
      const payloadMessages = newHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          userName: 'Criador'
        })
      });

      if (!res.ok) throw new Error('Falha ao conectar com o AviBot');

      const data = await res.json();
      const botReply = data.reply || 'Posso te ajudar com qualquer dúvida sobre o BIRDPRO! Gostaria de conhecer nossos planos ou ver uma demonstração?';

      // Brief natural pause
      await new Promise(r => setTimeout(r, 600));

      const botMsg: AviBotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: data.actionLink
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'O **BIRDPRO** oferece acesso completo a 100% dos recursos nos planos **Mensal (R$ 14,99)** e **Anual (R$ 169,99)** com aves, gaiolas e anilhas ilimitadas! Como posso te auxiliar melhor?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionLink: {
            label: 'Ver Planos & Assinar',
            href: '/#planos'
          }
        }
      ]);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Olá! Como posso te ajudar hoje com o BIRDPRO? Escolha um tópico abaixo ou faça sua pergunta! 🤖',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Robot Trigger Button (Positioned on the Bottom Left) */}
      <div className="fixed bottom-5 sm:bottom-6 left-4 sm:left-6 z-50 flex items-center group">
        
        {/* Robot Trigger Circle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir AviBot Robô de Dúvidas"
          className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 border-2 border-emerald-400/80 shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer overflow-hidden group shrink-0"
        >
          {/* Subtle Glow Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-40 blur-sm group-hover:opacity-90 transition-opacity" />

          {/* AviBot Mascot Image (Flipped to face inwards to the right) */}
          <img
            src="/images/avibot.jpg"
            alt="AviBot - Robô de Dúvidas BIRDPRO"
            className="w-full h-full object-cover relative z-10 scale-x-[-1]"
          />

          {/* Online badge */}
          <span className="absolute top-0 right-0 z-20 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </span>
        </button>

        {/* Floating Bubble Prompt Notification (Opens to the right) */}
        {hasPromptNotification && !isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="ml-2 sm:ml-3 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-900 dark:bg-slate-800 text-white text-[11px] sm:text-xs font-bold rounded-2xl shadow-xl border border-emerald-500/40 backdrop-blur-md flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:border-emerald-400 transition animate-in fade-in slide-in-from-left-4 max-w-[210px] sm:max-w-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate">Dúvidas? Fale comigo! 🤖</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setHasPromptNotification(false); }}
              className="text-slate-400 hover:text-white ml-1 p-0.5"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Floating Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed inset-x-2 sm:inset-x-auto bottom-2 sm:bottom-20 sm:left-6 sm:right-auto z-50 sm:w-[420px] max-h-[92vh] sm:max-h-[600px] h-[85vh] sm:h-[580px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 font-sans">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-md relative bg-slate-800 shrink-0">
                <img
                  src="/images/avibot.jpg"
                  alt="AviBot"
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white">AviBot</h3>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Robô IA 24h
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Assistente de Dúvidas BIRDPRO</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reiniciar Conversa"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Fechar Chat"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                {m.sender === 'bot' ? (
                  <div className="w-7 h-7 rounded-xl overflow-hidden border border-emerald-400/60 bg-slate-800 shrink-0 shadow-2xs">
                    <img src="/images/avibot.jpg" alt="AviBot" className="w-full h-full object-cover scale-x-[-1]" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    VOCÊ
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-line shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700 font-normal'
                  }`}
                >
                  {m.text}

                  {/* Action Link button */}
                  {m.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <Link
                        href={m.actionLink.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-[11px] font-bold transition"
                      >
                        <Zap className="w-3 h-3 text-emerald-500" />
                        <span>{m.actionLink.label}</span>
                        <ArrowRight className="w-3 h-3 ml-0.5" />
                      </Link>
                    </div>
                  )}

                  <span className={`text-[9px] block text-right mt-1 ${m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl overflow-hidden border border-emerald-400/60 bg-slate-800 shrink-0">
                  <img src="/images/avibot.jpg" alt="AviBot" className="w-full h-full object-cover scale-x-[-1]" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1 font-semibold">AviBot digitando...</span>
                </div>
              </div>
            )}

            {/* Quick Questions suggestion buttons (if fewer than 4 messages) */}
            {messages.length <= 3 && !isTyping && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  Perguntas Frequentes:
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-left px-3 py-2 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-200 transition flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <span>{q}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
            <Link 
              href="/#planos" 
              onClick={() => setIsOpen(false)}
              className="hover:text-emerald-500 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Planos: R$ 14,99/mês</span>
            </Link>
            <Link 
              href="/dashboard/suporte" 
              onClick={() => setIsOpen(false)}
              className="hover:text-emerald-500 transition flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-emerald-500" />
              <span>Consultor Técnico</span>
            </Link>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte ao AviBot sobre o sistema..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-[#00c853] hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-md transition cursor-pointer shrink-0"
              title="Enviar Mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
