'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { GlobalSearchModal } from '@/components/modals/global-search-modal';
import { AuthProvider } from '@/lib/auth-context';
import { PlanGuard } from '@/components/billing/plan-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  return (
    <AuthProvider>
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
              {children}
            </PlanGuard>
          </main>
        </div>

        {/* Universal Global Search Modal */}
        <GlobalSearchModal 
          isOpen={searchOpen} 
          onClose={() => setSearchOpen(false)} 
        />
      </div>
    </AuthProvider>
  );
}
