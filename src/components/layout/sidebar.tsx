'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  LayoutDashboard, 
  DollarSign, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Send, 
  Bird,
  GitFork, 
  Binary, 
  Globe, 
  Bookmark, 
  Tag, 
  ShoppingCart, 
  Wallet, 
  Settings, 
  Headphones, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  List, 
  Users, 
  ShieldCheck, 
  Building2, 
  Percent,
  ExternalLink,
  Layers,
  Bell,
  Gift,
  Sparkles,
  Briefcase,
  Target,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { Logo } from '@/components/ui/logo';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, tenant } = useAuth();
  
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(false);
  const [isPassaroOpen, setIsPassaroOpen] = useState(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isSeller = user?.role === 'SELLER';
  const pendingAlertsCount = db.getNotifications(tenant?.id).filter(n => n.status !== 'COMPLETED').length;

  // Seller exclusive menu
  const sellerMenuItems = [
    { name: 'Painel de Vendas', href: '/dashboard/vendedor', icon: Briefcase },
    { name: 'Metas & Performance', href: '/dashboard/vendedor', icon: Target },
    { name: 'Links & Cupons', href: '/dashboard/vendedor', icon: Gift },
    { name: 'Extrato & Saque PIX', href: '/dashboard/vendedor', icon: DollarSign },
    { name: 'Suporte ao Parceiro', href: '/dashboard/suporte', icon: Headphones },
  ];

  // Config submenu for normal criatório users
  const configSubmenu = [
    { name: 'Criatório', href: '/dashboard/configuracoes/criatorio', icon: List },
    { name: 'Anilha', href: '/dashboard/configuracoes/anilha', icon: List },
    { name: 'Participante', href: '/dashboard/configuracoes/participante', icon: Users },
    { name: 'Produto', href: '/dashboard/configuracoes/produto', icon: List },
    { name: 'Classificação', href: '/dashboard/configuracoes/classificacao', icon: List },
    { name: 'Comportamento', href: '/dashboard/configuracoes/comportamento', icon: List },
    { name: 'Gaiola', href: '/dashboard/configuracoes/gaiola', icon: List },
    { name: 'Mutação', href: '/dashboard/configuracoes/mutacao', icon: List },
    { name: 'Tipo de Participante', href: '/dashboard/configuracoes/tipo-participante', icon: List },
    { name: 'Tipo de Raça', href: '/dashboard/configuracoes/tipo-raca', icon: List },
    { name: 'Nova Genealogia', href: '/dashboard/configuracoes/nova-genealogia', icon: List },
  ];

  // Main menu for normal criatório users
  const mainMenuItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Painel de Pássaro', href: '/dashboard/aves', icon: LayoutDashboard },
    { name: 'Painel do Financeiro', href: '/dashboard/painel-financeiro', icon: DollarSign },
    { name: 'Treinamento', href: '/dashboard/treinamento', icon: GraduationCap },
    { name: 'Calendário', href: '/dashboard/calendario', icon: Calendar },
    { name: 'Anotação', href: '/dashboard/anotacao', icon: FileText },
    { name: 'Pássaro', href: '/dashboard/aves', icon: Send },
    { name: 'Árvore Genealógica', href: '/dashboard/genealogia', icon: Bird },
    { name: 'Nova Genealogia', href: '/dashboard/configuracoes/nova-genealogia', icon: Edit3 },
    { name: 'Simulador de Árvore', href: '/dashboard/simulador-arvore', icon: Binary },
    { name: 'Alertas & Notificações', href: '/dashboard/alertas', icon: Bell },
    { name: 'Reserva de Pássaro', href: '/dashboard/reserva', icon: Bookmark },
    { name: 'Venda de Pássaro', href: '/dashboard/venda', icon: Tag },
    { name: 'Compra', href: '/dashboard/compra', icon: ShoppingCart },
    { name: 'Indique & Ganhe', href: '/dashboard/indique-e-ganhe', icon: Gift },
  ];

  // Exclusive menu items for Super Admin
  const openTicketsCount = db.getAllTickets().filter(t => t.status === 'OPEN' || t.unreadByAdmin).length;

  const adminMenuItems = [
    { name: 'Painel Master ADM', href: '/dashboard/admin', icon: ShieldCheck },
    { name: 'Central de Chamados', href: '/dashboard/admin/chamados', icon: Headphones, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
    { name: 'Vendedores & Afiliados', href: '/dashboard/admin/vendedores', icon: Users },
    { name: 'Criatórios & Licenças', href: '/dashboard/admin/criatorios', icon: Building2 },
    { name: 'Financeiro & Saques', href: '/dashboard/admin/financeiro', icon: DollarSign },
    { name: 'Configurações Globais', href: '/dashboard/admin/configuracoes', icon: Settings },
    { name: 'Logs de Auditoria', href: '/dashboard/admin/logs', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        'fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#212830] text-[#c9d1d9] flex flex-col border-r border-[#30363d] transition-transform duration-300 ease-in-out lg:translate-x-0 select-none',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        
        {/* Logo & Header */}
        <div className="h-16 px-4 bg-[#1b2229] border-b border-[#30363d] flex items-center justify-between">
          <Logo 
            variant={isSuperAdmin ? 'admin' : 'light'} 
            size="sm" 
            href={isSuperAdmin ? '/dashboard/admin' : '/dashboard'} 
          />
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar text-xs">
          
          {/* ================================================================ */}
          {/* SUPER ADMIN EXCLUSIVE SIDEBAR                                    */}
          {/* ================================================================ */}
          {isSuperAdmin ? (
            <div className="space-y-1">
              <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                Menu Super Administrador
              </div>

              {adminMenuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors hover:bg-[#2d333b]',
                      isActive 
                        ? 'bg-amber-500/20 text-amber-300 font-bold border-l-4 border-amber-500 pl-3' 
                        : 'text-[#8b949e] hover:text-amber-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-amber-400' : 'text-[#8b949e]')} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-4 px-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Sessão
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sair da Conta (Logout)</span>
              </button>
            </div>
          ) : isSeller ? (
            /* ================================================================ */
            /* SELLER / AMBASSADOR EXCLUSIVE SIDEBAR                            */
            /* ================================================================ */
            <div className="space-y-1">
              <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portal de Vendas &amp; Ganhos</span>
              </div>

              {sellerMenuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors hover:bg-[#2d333b]',
                      isActive 
                        ? 'bg-emerald-600 text-white font-bold border-l-4 border-emerald-400 pl-3' 
                        : 'text-[#8b949e] hover:text-emerald-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-[#8b949e]')} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}

              <div className="pt-4 px-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Sessão
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          ) : (
            /* ================================================================ */
            /* NORMAL CRIATÓRIO USER SIDEBAR (No Super Admin menu visible!)     */
            /* ================================================================ */
            <div className="space-y-0.5">
              {mainMenuItems.map((item) => {
                if (item.name === 'Pássaro') {
                  const isPassaroActive = pathname === '/dashboard/aves' || pathname.startsWith('/dashboard/sispass');
                  return (
                    <div key="passaro-group">
                      <button
                        onClick={() => setIsPassaroOpen(!isPassaroOpen)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors hover:bg-[#2d333b] hover:text-white cursor-pointer',
                          isPassaroActive
                            ? 'text-white font-semibold'
                            : 'text-[#8b949e]'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Send className={cn('w-4 h-4 shrink-0', isPassaroActive ? 'text-[#00c853]' : 'text-[#8b949e]')} />
                          <span>Pássaro</span>
                        </div>
                        {isPassaroOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                      </button>

                      {isPassaroOpen && (
                        <div className="bg-[#1c2128] py-1 space-y-0.5">
                          <Link
                            href="/dashboard/aves"
                            onClick={onClose}
                            className={cn(
                              'flex items-center gap-3 pl-8 pr-4 py-2 text-xs transition-colors',
                              pathname === '/dashboard/aves'
                                ? 'bg-[#00c853] text-white font-bold'
                                : 'text-[#8b949e] hover:text-white hover:bg-[#2d333b]'
                            )}
                          >
                            <List className="w-3.5 h-3.5" />
                            <span>Plantel de Pássaros</span>
                          </Link>

                          <Link
                            href="/dashboard/sispass"
                            onClick={onClose}
                            className={cn(
                              'flex items-center justify-between pl-8 pr-4 py-2 text-xs transition-colors',
                              pathname === '/dashboard/sispass'
                                ? 'bg-[#00c853] text-white font-bold'
                                : 'text-[#8b949e] hover:text-white hover:bg-[#2d333b]'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                              <span>SISPASS</span>
                            </div>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              IBAMA
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = pathname === item.href && !pathname.includes('/configuracoes');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors hover:bg-[#2d333b] hover:text-white',
                      isActive 
                        ? 'bg-[#00c853] text-white font-semibold' 
                        : 'text-[#8b949e]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-[#8b949e]')} />
                      <span>{item.name}</span>
                    </div>
                    {item.name === 'Treinamento' && (
                      <span className={cn(
                        'px-2 py-0.5 text-[9px] font-black uppercase rounded-full tracking-wider animate-pulse flex items-center gap-1 shadow-xs',
                        isActive 
                          ? 'bg-white text-emerald-800' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                        Em Breve
                      </span>
                    )}
                    {item.name === 'Indique & Ganhe' && (
                      <span className={cn(
                        'px-2 py-0.5 text-[9px] font-black rounded-full tracking-wide flex items-center gap-1 shadow-xs uppercase',
                        isActive 
                          ? 'bg-white text-emerald-800' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white animate-pulse shadow-sm shadow-emerald-500/30'
                      )}>
                        <span>🎁 Ganhe PIX</span>
                      </span>
                    )}
                    {item.href === '/dashboard/alertas' && pendingAlertsCount > 0 && (
                      <span className={cn(
                        'px-1.5 py-0.5 text-[10px] font-black rounded-full',
                        isActive ? 'bg-white text-emerald-700' : 'bg-emerald-500 text-white animate-pulse'
                      )}>
                        {pendingAlertsCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Financeiro Dropdown */}
              <div>
                <button
                  onClick={() => setIsFinanceiroOpen(!isFinanceiroOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#8b949e] hover:bg-[#2d333b] hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-[#8b949e]" />
                    <span>Financeiro</span>
                  </div>
                  {isFinanceiroOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {isFinanceiroOpen && (
                  <div className="bg-[#1c2128] py-1 space-y-0.5">
                    <Link
                      href="/dashboard/painel-financeiro"
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 pl-8 pr-4 py-2 text-xs transition-colors',
                        pathname === '/dashboard/painel-financeiro' || pathname === '/dashboard/financeiro'
                          ? 'bg-[#00c853] text-white font-bold'
                          : 'text-[#8b949e] hover:text-white hover:bg-[#2d333b]'
                      )}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Painel Financeiro</span>
                    </Link>
                    <Link
                      href="/dashboard/financeiro/contas-pagar"
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 pl-8 pr-4 py-2 text-xs transition-colors',
                        pathname === '/dashboard/financeiro/contas-pagar'
                          ? 'bg-[#00c853] text-white font-bold'
                          : 'text-[#8b949e] hover:text-white hover:bg-[#2d333b]'
                      )}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Contas a Pagar</span>
                    </Link>
                    <Link
                      href="/dashboard/financeiro/contas-receber"
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 pl-8 pr-4 py-2 text-xs transition-colors',
                        pathname === '/dashboard/financeiro/contas-receber'
                          ? 'bg-[#00c853] text-white font-bold'
                          : 'text-[#8b949e] hover:text-white hover:bg-[#2d333b]'
                      )}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Contas a Receber</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Configuração Dropdown */}
              <div>
                <button
                  onClick={() => setIsConfigOpen(!isConfigOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#8b949e] hover:bg-[#2d333b] hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-[#8b949e]" />
                    <span className="font-semibold text-slate-200">Configuração</span>
                  </div>
                  {isConfigOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {isConfigOpen && (
                  <div className="bg-[#1c2128] space-y-0.5">
                    {configSubmenu.map((sub) => {
                      const isSubActive = pathname === sub.href || (sub.name === 'Criatório' && pathname.startsWith('/dashboard/configuracoes/criatorio')) || (sub.name === 'Criatório' && pathname === '/dashboard/configuracoes');
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={onClose}
                          className={cn(
                            'flex items-center gap-3 pl-6 pr-4 py-2 text-xs transition-colors',
                            isSubActive
                              ? 'bg-[#00c853] text-white font-bold'
                              : 'text-[#8b949e] hover:text-white hover:bg-[#2d333b]'
                          )}
                        >
                          <SubIcon className={cn('w-3.5 h-3.5 shrink-0', isSubActive ? 'text-white' : 'text-[#8b949e]')} />
                          <span>{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Suporte do Sistema */}
              <Link
                href="/dashboard/suporte"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors hover:bg-[#2d333b] hover:text-white',
                  pathname === '/dashboard/suporte' ? 'bg-[#00c853] text-white' : 'text-[#8b949e]'
                )}
              >
                <Headphones className="w-4 h-4 text-[#8b949e]" />
                <span>Suporte do Sistema</span>
              </Link>

              {/* Sair */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[#8b949e] hover:bg-rose-950/40 hover:text-rose-400 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#171b21] border-t border-[#30363d] text-[10px] text-[#6e7681] text-center">
          {isSuperAdmin ? 'PAINEL MASTER • BIRDPRO' : 'BIRDPRO v1.0.95'}
        </div>
      </aside>
    </>
  );
}
