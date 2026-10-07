'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { GlobalSearchModal } from '@/components/modals/global-search-modal';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { PlanGuard } from '@/components/billing/plan-guard';

function DashboardProtectedArea({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);

  // Quando a primeira sincronização com a nuvem traz dados novos, remonta o conteúdo da página
  useEffect(() => {
    const onInitialSync = () => setSyncVersion((v) => v + 1);
    window.addEventListener('birdpro_initial_sync_done', onInitialSync);
    return () => window.removeEventListener('birdpro_initial_sync_done', onInitialSync);
  }, []);

  // Global hotkey handler (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Strict check: unauthenticated users are never allowed into the dashboard and go to /login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Carregando painel...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Fixed Left Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Sticky Bar */}
        <Topbar 
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenGlobalSearch={() => setSearchOpen(true)}
        />

        {/* Page Container - Full Width with PlanGuard Protection */}
        <main className="flex-1 px-4 py-3 w-full animate-in fade-in duration-200">
          <PlanGuard>
            <React.Fragment key={syncVersion}>{children}</React.Fragment>
          </PlanGuard>
        </main>
      </div>

      {/* Universal Global Search Modal */}
      <GlobalSearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProtectedArea>
      {children}
    </DashboardProtectedArea>
  );
}
