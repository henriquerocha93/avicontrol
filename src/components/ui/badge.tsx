import React from 'react';
import { cn } from '@/lib/utils';
import { BirdSex, BirdStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className, 
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
    amber: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border shadow-xs transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function SexBadge({ sex, className }: { sex: BirdSex; className?: string }) {
  if (sex === 'MALE') {
    return (
      <span className={cn('inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200', className)}>
        <span>♂</span> Macho
      </span>
    );
  }
  if (sex === 'FEMALE') {
    return (
      <span className={cn('inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200', className)}>
        <span>♀</span> Fêmea
      </span>
    );
  }
  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200', className)}>
      <span>?</span> Indefinido
    </span>
  );
}

export function StatusBadge({ status, className }: { status: BirdStatus; className?: string }) {
  const config: Record<BirdStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default' }> = {
    ACTIVE: { label: 'Ativa', variant: 'success' },
    BREEDING: { label: 'Em Reprodução', variant: 'purple' },
    FOR_SALE: { label: 'À Venda', variant: 'info' },
    TRANSFERRED: { label: 'Transferida', variant: 'default' },
    DECEASED: { label: 'Falecida', variant: 'danger' },
    LOST: { label: 'Perdida', variant: 'danger' },
    IN_TREATMENT: { label: 'Em Tratamento', variant: 'warning' },
    QUARANTINE: { label: 'Quarentena', variant: 'warning' },
  };

  const item = config[status] || { label: status, variant: 'default' };
  return (
    <Badge variant={item.variant} className={className}>
      {item.label}
    </Badge>
  );
}
