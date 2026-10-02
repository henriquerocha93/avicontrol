'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Clock, 
  Egg, 
  Pill, 
  Sparkles, 
  CircleDot, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { NotificationItem } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default function NotificacoesPage() {
  const { tenant } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState('ALL');

  const loadData = () => {
    setNotifications(db.getNotifications(tenant?.id));
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const handleMarkAll = () => {
    db.markAllNotificationsAsRead(tenant?.id);
    loadData();
  };

  const handleMarkOne = (id: string) => {
    db.markNotificationAsRead(id);
    loadData();
  };

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'ALERT') return n.type === 'ALERT';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Central de Alertas & Notificações</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {notifications.filter(n => !n.read).length} Não Lidas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Alertas automatizados de eclosão de ovos, medicação diária, prazos de sexagem e avisos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Marcar Todas como Lidas
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === 'UNREAD' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Não Lidas ({notifications.filter(n => !n.read).length})
        </button>
        <button
          onClick={() => setFilter('ALERT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === 'ALERT' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Alertas Urgentes
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
              !item.read 
                ? 'bg-white border-emerald-500/40 shadow-sm' 
                : 'bg-slate-50/60 border-slate-200/80 text-slate-600'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${
                item.category === 'MEDICATION' ? 'bg-amber-100 text-amber-800' :
                item.category === 'EGG_HATCH' ? 'bg-emerald-100 text-emerald-800' :
                item.category === 'SEXING' ? 'bg-sky-100 text-sky-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {item.category === 'MEDICATION' ? <Pill className="w-5 h-5" /> :
                 item.category === 'EGG_HATCH' ? <Egg className="w-5 h-5" /> :
                 item.category === 'SEXING' ? <Sparkles className="w-5 h-5" /> :
                 <CircleDot className="w-5 h-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span>{formatDate(item.createdAt)}</span>
                  {item.link && (
                    <Link href={item.link} className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                      <span>Acessar Módulo</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {!item.read && (
              <button
                onClick={() => handleMarkOne(item.id)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 whitespace-nowrap p-1 rounded hover:bg-slate-100"
              >
                Marcar lida
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
