'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Search, Activity, ShieldCheck } from 'lucide-react'
import { db } from '@/lib/db'
import { AuditLog } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setLogs(db.getAuditLogs())
  }, [])

  const filteredLogs = logs.filter(l => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return l.userName.toLowerCase().includes(q) || 
           l.module.toLowerCase().includes(q) || 
           l.action.toLowerCase().includes(q) || 
           l.details.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6 pb-12 w-full font-sans">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 px-1">
        <Link href="/dashboard" className="text-[#00c853] hover:underline font-medium">Home</Link>
        <span>/</span>
        <Link href="/dashboard/admin" className="text-[#00c853] hover:underline font-medium">Super Admin</Link>
        <span>/</span>
        <span className="text-slate-400">Logs de Auditoria</span>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">
              Logs de Auditoria do Sistema
            </h1>
            <p className="text-xs text-slate-500">
              Histórico de alterações, acessos e operações realizadas em toda a plataforma BirdPro
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded border border-slate-200 shadow-xs flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por usuário, módulo, ação ou detalhes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-[#00c853]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="text-left px-4 py-2.5 font-semibold">Data/Hora</th>
                <th className="text-left px-4 py-2.5 font-semibold">Usuário</th>
                <th className="text-left px-4 py-2.5 font-semibold">Módulo</th>
                <th className="text-left px-4 py-2.5 font-semibold">Ação</th>
                <th className="text-left px-4 py-2.5 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Nenhum log de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-500 font-mono">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{l.userName}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-600 uppercase">{l.module}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                        l.action === 'UPDATE' ? 'bg-blue-100 text-[#00c853]' :
                        l.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{l.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

