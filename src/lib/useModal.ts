'use client';

import { useEffect } from 'react';

/**
 * Modal behaviour for the page's dialogs (lightbox, full-screen plan): while open, everything else
 * in the page root is `inert` (focus stays in the dialog, screen readers ignore the background);
 * on close, focus returns to the control that opened it.
 */
export function useModal(open: boolean, selector: string) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const root = document.getElementById('lr-root');
    const dlg = document.querySelector(selector);
    const others = root ? [...root.children].filter((el) => el !== dlg && !el.contains(dlg)) : [];
    others.forEach((el) => el.setAttribute('inert', ''));
    return () => {
      others.forEach((el) => el.removeAttribute('inert'));
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [open, selector]);
}
