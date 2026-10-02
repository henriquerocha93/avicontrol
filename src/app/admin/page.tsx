'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  ArrowLeft,
  Search,
  Edit,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { db } from '@/lib/db';
import { Tenant, PlanType } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [form, setForm] = useState({
    plan: 'PREMIUM' as PlanType,
    maxBirds: 9999,
    planStatus: 'ACTIVE' as Tenant['planStatus']
  });

  const loadData = () => {
    setTenants(db.getAllTenants());
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.planStatus === 'ACTIVE').length;
  const estimatedMRR = tenants.reduce((acc, t) => {
    if (t.billingCycle === 'ISENTO') return acc;
    if (t.billingCycle === 'MENSAL') return acc + 14.99;
    if (t.billingCycle === 'ANUAL') return acc + (169.99 / 12);
    return acc + 14.99;
  }, 0);

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.document.includes(search)
  );

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    db.updateTenant({
      plan: form.plan,
      maxBirds: Number(form.maxBirds),
      planStatus: form.planStatus
    }, editingTenant.id);

    loadData();
    setEditingTenant(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <Logo variant="light" size="md" href="/admin" />
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
            SUPER ADMIN
          </span>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar ao Dashboard do Criatório
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPI Platform Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Criatórios (Tenants)</span>
            <p className="text-3xl font-black text-white">{totalTenants}</p>
            <p className="text-[11px] text-emerald-400 font-semibold">{activeTenants} ativos na plataforma</p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">MRR Mensal Estimado</span>
            <p className="text-3xl font-black text-emerald-400">{formatCurrency(estimatedMRR)}</p>
            <p className="text-[11px] text-slate-400">Receita Recorrente Mensal</p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Usuários</span>
            <p className="text-3xl font-black text-blue-400">{db.getUsers().length}</p>
            <p className="text-[11px] text-slate-400">Criadores, tratadores e veterinários</p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Armazenamento em Nuvem</span>
            <p className="text-3xl font-black text-purple-400">1.8 GB</p>
            <p className="text-[11px] text-slate-400">Fotos, PDFs e Laudos armazenados</p>
          </div>
        </div>

        {/* Tenant Management Table */}
        <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-white">Criatórios Cadastrados na Plataforma</h3>
              <p className="text-xs text-slate-400">Gerenciamento de planos, limites de aves e status da conta</p>
            </div>

            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar criatório por nome ou CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl focus:outline-none text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Criatório</th>
                  <th className="py-3.5 px-4">Documento</th>
                  <th className="py-3.5 px-4">E-mail / Contato</th>
                  <th className="py-3.5 px-4">Plano Atual</th>
                  <th className="py-3.5 px-4">Limite de Aves</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{t.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{t.document}</td>
                    <td className="py-3 px-4 text-slate-300">{t.email}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{t.plan}</td>
                    <td className="py-3 px-4 text-slate-300">{t.maxBirds ? `${t.maxBirds} aves` : 'Ilimitado'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {t.planStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-200 hover:bg-slate-700 text-xs h-8"
                        onClick={() => {
                          setEditingTenant(t);
                          setForm({
                            plan: t.plan,
                            maxBirds: t.maxBirds || 9999,
                            planStatus: t.planStatus
                          });
                        }}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Gerenciar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <Modal
          isOpen={!!editingTenant}
          onClose={() => setEditingTenant(null)}
          title={`Gerenciar Criatório: ${editingTenant.name}`}
          description="Altere o plano contratado, limite de aves cadastradas e status de liberação."
          maxWidth="md"
        >
          <form onSubmit={handleSaveTenant} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plano da Plataforma</label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value as PlanType })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
              >
                <option value="PRO">Plano Mensal (Completo)</option>
                <option value="PREMIUM">Plano Anual (Completo VIP)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Limite Máximo de Aves Permitidas</label>
              <input
                type="number"
                value={form.maxBirds}
                onChange={(e) => setForm({ ...form, maxBirds: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status da Assinatura</label>
              <select
                value={form.planStatus}
                onChange={(e) => setForm({ ...form, planStatus: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="ACTIVE">Ativo / Regular</option>
                <option value="TRIAL">Carência / Ativação</option>
                <option value="PAST_DUE">Inadimplente / Bloqueado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setEditingTenant(null)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
