'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Check, 
  X, 
  Sparkles, 
  ExternalLink,
  Laptop
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  triggerInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  canInstall: false,
  isInstalled: false,
  isIOS: false,
  isAndroid: false,
  openInstallModal: () => {},
  closeInstallModal: () => {},
  triggerInstall: async () => {},
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration note:', err);
      });
    }

    // 2. Detect platform
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroidDevice = /android/.test(ua);
      setIsIOS(isIosDevice);
      setIsAndroid(isAndroidDevice);

      // Check if already in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    }

    // 3. Capture beforeinstallprompt for Android & Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error('PWA install error:', err);
      }
    } else {
      // If no native prompt available (iOS or desktop or already prompted), open the interactive guide
      setIsModalOpen(true);
    }
  };

  const openInstallModal = () => setIsModalOpen(true);
  const closeInstallModal = () => setIsModalOpen(false);

  return (
    <PWAContext.Provider
      value={{
        canInstall: !isInstalled,
        isInstalled,
        isIOS,
        isAndroid,
        openInstallModal,
        closeInstallModal,
        triggerInstall,
      }}
    >
      {children}
      {isModalOpen && (
        <InstallAppModal
          isOpen={isModalOpen}
          onClose={closeInstallModal}
          onDirectInstall={triggerInstall}
          hasPrompt={!!deferredPrompt}
          isIOS={isIOS}
          isAndroid={isAndroid}
          isInstalled={isInstalled}
        />
      )}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}

// Botão moderno de Criar / Instalar App
export function InstallAppButton({ 
  className = '',
  variant = 'default'
}: { 
  className?: string;
  variant?: 'default' | 'topbar' | 'sidebar' | 'banner';
}) {
  const { isInstalled, openInstallModal, triggerInstall, isAndroid } = usePWA();

  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    if (isAndroid) {
      triggerInstall();
    } else {
      openInstallModal();
    }
  };

  if (variant === 'topbar') {
    return (
      <button
        onClick={handleClick}
        className={`px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] rounded-lg shadow-sm border border-emerald-400/30 flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${className}`}
        title="Criar App no Celular (iOS e Android)"
      >
        <Smartphone className="w-3.5 h-3.5 animate-pulse text-amber-300" />
        <span className="hidden sm:inline">Criar App no Celular</span>
        <span className="sm:hidden">App</span>
      </button>
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all duration-200 bg-gradient-to-r from-emerald-950/70 to-[#1b2229] hover:from-emerald-900/90 hover:to-[#222933] text-emerald-300 hover:text-white border-l-4 border-[#00c853] cursor-pointer group ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-[#00c853] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
            <Smartphone className="w-3.5 h-3.5 text-[#00c853]" />
          </div>
          <div className="text-left">
            <p className="leading-tight font-black text-white">Criar App no Celular</p>
            <p className="text-[10px] text-emerald-400/90 font-medium">Instalar no iOS &amp; Android</p>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 shadow-xs">
          1 Clique
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer ${className}`}
    >
      <Smartphone className="w-4 h-4" />
      <span>Criar App no Celular</span>
    </button>
  );
}

// Modal Inteligente de Instalação do App
function InstallAppModal({
  isOpen,
  onClose,
  onDirectInstall,
  hasPrompt,
  isIOS,
  isAndroid,
  isInstalled
}: {
  isOpen: boolean;
  onClose: () => void;
  onDirectInstall: () => void;
  hasPrompt: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isInstalled: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const appUrl = typeof window !== 'undefined' ? window.location.origin + '/dashboard' : 'https://www.birdpro.com.br/dashboard';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in text-slate-900 dark:text-slate-100 font-sans">
        
        {/* Header com Logo */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center p-1 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.svg" alt="BirdPro App" className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Aplicativo Oficial
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight">Criar App BIRDPRO</h3>
              <p className="text-xs text-emerald-100">Instalação direta no iOS &amp; Android</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 text-xs">

          {isInstalled ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                Aplicativo Já Instalado!
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                O BirdPro já está funcionando como aplicativo no seu dispositivo. Você pode acessá-lo diretamente pelo ícone na tela inicial.
              </p>
            </div>
          ) : isIOS ? (
            /* =================================================== */
            /* GUIA AUTOMATIZADO PARA APPLE IPHONE / IPAD (iOS)   */
            /* =================================================== */
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-3.5 text-amber-900 dark:text-amber-200">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Como criar o App no iPhone em 2 segundos:</span>
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-1">
                  O iOS não requer baixar nada da App Store. Siga estes 2 passos simples:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black shrink-0 text-sm shadow-xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Toque no botão</span>
                      <Share2 className="w-4 h-4 text-blue-500" />
                      <strong>Compartilhar</strong>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Fica na barra inferior do Safari (o ícone do quadrado com a seta para cima).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 text-sm shadow-xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Selecione</span>
                      <PlusSquare className="w-4 h-4 text-emerald-500" />
                      <strong>Adicionar à Tela de Início</strong>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Role o menu para baixo e toque em &quot;Adicionar à Tela de Início&quot; e depois em &quot;Adicionar&quot;.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                ✓ O ícone do BIRDPRO aparecerá na tela do seu iPhone como um App nativo de tela cheia!
              </div>
            </div>
          ) : (
            /* =================================================== */
            /* INSTALAÇÃO AUTOMÁTICA ANDROID & NAVEGADORES CHROME  */
            /* =================================================== */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <Smartphone className="w-10 h-10 text-[#00c853] mx-auto animate-bounce" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Instalação em 1 Toque sem Burocracia
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Instala o aplicativo oficial do BirdPro diretamente no seu aparelho, com ícone próprio e funcionamento rápido em tela cheia.
                </p>
              </div>

              {hasPrompt ? (
                <button
                  type="button"
                  onClick={onDirectInstall}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-[#00c853] hover:from-emerald-500 hover:to-[#00e676] text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Criar &amp; Instalar App Agora (1 Clique)</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onDirectInstall}
                    className="w-full py-3.5 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Aplicativo no Celular</span>
                  </button>

                  <p className="text-[10px] text-slate-400 text-center">
                    Caso o navegador não abra o pop-up automaticamente, toque nos <strong>3 pontinhos do menu</strong> do seu navegador e escolha <strong>&quot;Instalar Aplicativo&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Opção Adicional: QR Code para Celular se estiver no Computador */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                <span>Está no computador? Abra direto no celular:</span>
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 bg-white p-1 rounded-xl shadow-xs border border-slate-200 shrink-0 flex items-center justify-center">
                <QRCodeSVG value={appUrl} size={70} level="M" />
              </div>
              <div className="space-y-1.5 flex-1">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight">
                  Aponte a câmera do celular para este QR Code
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Ele abre o criatório direto no seu celular para você criar o app com 1 toque.
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
                >
                  <span>{copied ? '✓ Link copiado!' : 'Copiar link do aplicativo'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
