'use client';

import { NotificationItem } from '@/types';

// Play a pleasant notification chime using Web Audio API (no external asset needed)
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // First tone (pleasant high chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.35);

    // Second tone (higher harmony)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.55);
  } catch {
    // Audio might be blocked by autoplay policies
  }
}

// Check notification permission
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Erro ao solicitar permissão de notificação:', err);
    return 'denied';
  }
}

// Send system notification
export function sendPushNotification(title: string, options?: {
  body?: string;
  icon?: string;
  tag?: string;
  data?: any;
  playSound?: boolean;
}): boolean {
  if (options?.playSound !== false) {
    playNotificationChime();
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: options?.body || 'Lembrete do BIRDPRO',
        icon: options?.icon || '/favicon.ico',
        tag: options?.tag || `birdpro-alert-${Date.now()}`,
        badge: '/favicon.ico',
        silent: options?.playSound === false,
      });

      notif.onclick = () => {
        window.focus();
        if (options?.data?.link) {
          window.location.href = options.data.link;
        }
        notif.close();
      };

      return true;
    } catch (e) {
      console.warn('Falha ao disparar Notification nativa:', e);
      return false;
    }
  }

  return false;
}

// Trigger alert for a specific NotificationItem
export function triggerNotificationAlert(notif: NotificationItem, playSound = true) {
  let categoryLabel = 'Lembrete';
  if (notif.category === 'MEDICATION') categoryLabel = '💊 Medicamento';
  else if (notif.category === 'EGG_HATCH') categoryLabel = '🥚 Previsão de Eclosão';
  else if (notif.category === 'SEXING') categoryLabel = '🧬 Sexagem DNA';
  else if (notif.category === 'RING') categoryLabel = '⚪ Anilhamento';
  else if (notif.category === 'CAGE') categoryLabel = '🏠 Manejo Gaiolas';
  
  const title = `BIRDPRO • ${categoryLabel}: ${notif.title}`;
  const body = `${notif.message}${notif.dosage ? `\nDosagem: ${notif.dosage}` : ''}${notif.dueTime ? ` • Horário: ${notif.dueTime}` : ''}`;

  return sendPushNotification(title, {
    body,
    playSound,
    tag: `birdpro-${notif.id}`,
    data: { link: notif.link || '/dashboard/alertas' }
  });
}
