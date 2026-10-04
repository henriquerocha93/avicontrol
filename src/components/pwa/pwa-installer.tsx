'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Check, 
  X, 
  ExternalLink,
  Download
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Armazena prompt global caso ocorra antes da montagem do componente React
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).__birdpro_install_prompt = e;
  });
}

interface PWAContextType {
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isFirefox: boolean;
  triggerInstall: () => Promise<void>;
  toastMessage: string | null;
  clearToast: () => void;
}

const PWAContext = createContext<PWAContextType>({
  isInstalled: false,
  isIOS: false,
  isAndroid: false,
  isFirefox: false,
  triggerInstall: async () => {},
  toastMessage: null,
  clearToast: () => {},
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const showToast = useCallback((msg: string, duration = 5000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, duration);
  }, []);

  useEffect(() => {
    // 1. Registra Service Worker para PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration note:', err);
      });
    }

    // 2. Detecta plataforma
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroidDevice = /android/.test(ua);
      const isFirefoxBrowser = /firefox|fxios/.test(ua);

      setIsIOS(isIosDevice);
      setIsAndroid(isAndroidDevice);
      setIsFirefox(isFirefoxBrowser);

      // Verifica se já está em modo standalone (PWA instalado e aberto)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);

      // Recupera prompt caso já tenha disparado
      if ((window as any).__birdpro_install_prompt) {
        setDeferredPrompt((window as any).__birdpro_install_prompt);
      }
    }

    // 3. Captura beforeinstallprompt para Chrome, Edge, Samsung Internet, Brave, etc.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__birdpro_install_prompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).__birdpro_install_prompt = null;
      setShowIOSGuide(false);
      showToast('✓ Aplicativo BirdPro instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  /**
   * Instalação automática universal:
   * - Chrome / Edge / Android / Samsung / Brave: Aciona deferredPrompt.prompt() imediatamente (1 clique nativo)
   * - Safari iOS: Aciona Web Share API nativo do iOS ou abre guia discreto
   * - Firefox: Mostra instrução direta de 1 passo
   */
  const triggerInstall = async () => {
    if (isInstalled) {
      showToast('✓ O aplicativo BirdPro já está instalado no seu dispositivo.');
      return;
    }

    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__birdpro_install_prompt : null);

    // 1. Navegadores com suporte nativo de prompt (Google Chrome, Edge, Opera, Samsung Internet)
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          (window as any).__birdpro_install_prompt = null;
          showToast('✓ Aplicativo criado e instalado com sucesso!');
        }
        return;
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    }

    // 2. Safari no iPhone / iPad (iOS)
    if (isIOS) {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          showToast('📲 No menu aberto, toque em "Adicionar à Tela de Início" para criar o App.', 6000);
          await navigator.share({
            title: 'BirdPro • Gestão de Criatórios',
            url: window.location.origin + '/dashboard',
          });
          return;
        } catch (err: any) {
          if (err?.name === 'AbortError') {
            return;
          }
        }
      }
      setShowIOSGuide(true);
      return;
    }

    // 3. Mozilla Firefox
    if (isFirefox) {
      showToast('🦊 No Firefox: abra o menu (⋮) do navegador e toque em "Instalar" ou "Adicionar à tela inicial".', 7000);
      return;
    }

    // 4. Se o navegador é Chrome/Edge mas o prompt ainda não foi despachado
    showToast('💡 Para criar o app: clique no ícone de instalação (⊕ ou monitor) na barra de endereços do seu navegador.', 7000);
  };

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        isIOS,
        isAndroid,
        isFirefox,
        triggerInstall,
        toastMessage,
        clearToast: () => setToastMessage(null),
      }}
    >
      {children}

      {/* Toast flutuante discreto de instrução / confirmação */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-slate-900 text-white text-xs py-2.5 px-4 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="leading-snug font-medium text-slate-100">{toastMessage}</p>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mini guia discreto apenas para iOS caso o share nativo não tenha sido aberto */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-4 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 text-xs text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-[#00c853]" />
                Criar App no iPhone
              </span>
              <button 
                type="button" 
                onClick={() => setShowIOSGuide(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400">
              No Safari do iPhone, basta 1 toque:
            </p>

            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>Toque no botão <Share2 className="w-3.5 h-3.5 inline text-blue-500" /> <strong>Compartilhar</strong> (barra inferior do Safari)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>Role e selecione <PlusSquare className="w-3.5 h-3.5 inline text-emerald-500" /> <strong>Adicionar à Tela de Início</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-bold rounded-lg text-center cursor-pointer transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}

interface InstallAppButtonProps {
  className?: string;
  variant?: 'default' | 'topbar' | 'sidebar';
  onAfterClick?: () => void;
}

/**
 * Botão discreto, elegante e perfeitamente dimensionado para a interface do BirdPro
 */
export function InstallAppButton({ 
  className = '',
  variant = 'default',
  onAfterClick
}: InstallAppButtonProps) {
  const { isInstalled, triggerInstall } = usePWA();

  if (isInstalled) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerInstall();
    if (onAfterClick) {
      onAfterClick();
    }
  };

  // Botão minimalista para a barra superior (Topbar)
  if (variant === 'topbar') {
    return (
      <button
        onClick={handleClick}
        type="button"
        className={`h-8 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700/80 ${className}`}
        title="Instalar Aplicativo (iOS, Android, Chrome, Edge)"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#00c853]" />
        <span className="hidden sm:inline">Instalar App</span>
      </button>
    );
  }

  // Botão elegante perfeitamente integrado no Menu Lateral (Sidebar)
  // Segue exatamente a altura, fontes e cores dos outros itens (Suporte do Sistema, Sair)
  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleClick}
        type="button"
        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[#8b949e] hover:bg-[#2d333b] hover:text-white transition-colors cursor-pointer group text-left ${className}`}
        title="Instalar Aplicativo no Celular ou PC"
      >
        <div className="flex items-center gap-3">
          <Smartphone className="w-4 h-4 text-[#8b949e] group-hover:text-[#00c853] transition-colors shrink-0" />
          <span>Instalar Aplicativo</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30">
          App
        </span>
      </button>
    );
  }

  // Padrão compacto
  return (
    <button
      onClick={handleClick}
      type="button"
      className={`px-3 py-1.5 bg-[#00c853] hover:bg-[#00b84a] text-slate-950 font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer ${className}`}
    >
      <Smartphone className="w-3.5 h-3.5" />
      <span>Instalar App</span>
    </button>
  );
}
