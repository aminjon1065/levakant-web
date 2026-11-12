import type { PublicConfig } from './config';

/** WhatsApp chat link with a prefilled message, or null when no verified number is configured. */
export const waHref = (cfg: Pick<PublicConfig, 'whatsapp'>, text: string) =>
  cfg.whatsapp ? `https://wa.me/${cfg.whatsapp.number}?text=${encodeURIComponent(text)}` : null;
