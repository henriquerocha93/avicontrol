'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { WhatsAppButton } from './whatsapp-button';
import { AviBotWidget } from './avibot-widget';
import { ScrollToTop } from './scroll-to-top';

export function FloatingWidgets() {
  const pathname = usePathname();

  // Only render on the public landing/sales home page ('/').
  // Do NOT render inside any panel, dashboard, login, register or internal pages.
  if (pathname !== '/') {
    return null;
  }

  return (
    <>
      <WhatsAppButton />
      <AviBotWidget />
      <ScrollToTop />
    </>
  );
}
