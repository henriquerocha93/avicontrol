'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Menu, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Building2,
  Check
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { db } from '@/lib/db'

interface TopbarProps {
  onOpenSidebar: () => void;
  onOpenGlobalSearch?: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { user, tenant, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const notifications = db.getNotifications(tenant?.id)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="sticky top-0 z-30 h-14 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs transition-colors duration-200">
      {/* Left side: Hamburger toggle button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right side: Dark Mode toggle & User Avatar Profile */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title={theme === 'dark' ? "Ativar Modo Claro (Dia)" : "Ativar Modo Escuro (Noite)"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded relative transition cursor-pointer"
            title="Notificações"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs overflow-hidden">
              <div className="px-4 py-2 font-bold text-slate-800 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="flex items-center gap-1.5 font-black text-slate-900">
                  <Bell className="w-3.5 h-3.5 text-emerald-600" />
                  Alertas & Avisos
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {notifications.filter(n => n.status !== 'COMPLETED').length} ativos
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 4).map((n) => (
                  <Link 
                    key={n.id} 
                    href="/dashboard/alertas"
                    onClick={() => setIsNotifOpen(false)}
                    className="p-3 hover:bg-slate-50 transition block"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 truncate pr-2">{n.title}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {n.dueTime || n.dueDate || 'Aviso'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                  </Link>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50/80 text-center">
                <Link
                  href="/dashboard/alertas"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 block py-1"
                >
                  Central de Push Notificações & Alertas →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 overflow-hidden shadow-2xs">
              <User className="w-4 h-4" />
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800 truncate">{tenant?.name || 'Luis Henrique'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'criador@birdpro.com'}</p>
              </div>
              <Link
                href="/dashboard/configuracoes/criatorio"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Dados do Criatório</span>
              </Link>
              <Link
                href="/dashboard/configuracoes"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Configurações</span>
              </Link>
              <button
                onClick={() => {
                  setIsProfileOpen(false)
                  logout()
                }}
                className="w-full text-left flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition border-t border-slate-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
