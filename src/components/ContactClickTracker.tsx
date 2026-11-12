'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** One delegated listener: clicks on WhatsApp / Telegram / phone / e-mail links anywhere on the page. */
export function ContactClickTracker() {
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const h = a.getAttribute('href') || '';
      const channel = h.startsWith('https://wa.me')
        ? 'whatsapp'
        : h.startsWith('https://t.me')
          ? 'telegram'
          : h.startsWith('tel:')
            ? 'phone'
            : h.startsWith('mailto:')
              ? 'email'
              : '';
      if (channel)
        track('contact_click', {
          channel,
          place: a.closest('section,footer,.mcta')?.id || a.className.split(' ')[0] || 'page',
        });
    };
    document.addEventListener('click', on, true);
    return () => document.removeEventListener('click', on, true);
  }, []);
  return null;
}
