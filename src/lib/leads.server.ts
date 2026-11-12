import 'server-only';
import ru from '@/content/data.ru.json';
import type { Lead } from './leadSchema';
import type { SiteData } from './types';

/**
 * Lead delivery. Configured at runtime (never baked into the build):
 *   LEADS_TELEGRAM_BOT_TOKEN + LEADS_TELEGRAM_CHAT_ID — message to the sales chat
 *   LEADS_WEBHOOK_URL (+ LEADS_WEBHOOK_SECRET)        — JSON POST to a CRM / automation
 * The form only works when a channel AND a published privacy policy (PRIVACY_POLICY_URL) exist.
 * Personal data is never logged.
 */
const d = ru as unknown as SiteData;
const env = (k: string) => process.env[k]?.trim() || null;

const telegram = () => {
  const token = env('LEADS_TELEGRAM_BOT_TOKEN');
  const chat = env('LEADS_TELEGRAM_CHAT_ID');
  return token && chat ? { token, chat } : null;
};
const webhook = () => env('LEADS_WEBHOOK_URL');

export const leadsEnabled = () => !!(telegram() || webhook()) && !!env('PRIVACY_POLICY_URL');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const METHOD = { call: 'звонок', whatsapp: 'WhatsApp', telegram: 'Telegram' } as const;
const WANTS = {
  prices: 'цены и рассрочку',
  catalog: 'каталог планировок',
  viewing: 'запись на показ',
  video: 'видеозвонок',
} as const;
const FLOORS = { typ: 'этажи 2–8', f9: '9 этаж', ph: 'мансарда' } as const;
const layout = (id: string) => (d.L[id] ? `${d.L[id].title} ${d.L[id].as} м² (${id})` : id);

/** Message for the sales team (always in Russian). */
export function formatLead(l: Lead) {
  const lines = [
    '<b>Заявка с сайта LEVAKANT RESIDENCE</b>',
    `Имя: ${esc(l.name)}`,
    `Телефон: ${esc(l.phone)}`,
    l.method && `Связаться: ${METHOD[l.method]}`,
    l.wants.length && `Прислать: ${l.wants.map((w) => WANTS[w]).join(', ')}`,
    l.layouts.length && `Планировки: ${l.layouts.map(layout).map(esc).join('; ')}`,
    l.commercial && 'Интерес: коммерческое помещение',
    l.interest && `Что ищет: ${esc(l.interest)}`,
    l.calc &&
      `Расчёт: ${esc(layout(l.calc.layout))}, ${FLOORS[l.calc.floors]}, ` +
        (l.calc.down >= 100 ? 'оплата сразу' : `взнос ${l.calc.down}%, ${l.calc.term} мес.`),
    l.message && `Сообщение: ${esc(l.message)}`,
    `Язык: ${l.locale.toUpperCase()} · ${esc(l.page)}`,
    Object.keys(l.utm).length &&
      `UTM: ${esc(
        Object.entries(l.utm)
          .map(([k, v]) => `${k}=${v}`)
          .join(' '),
      )}`,
  ];
  return lines.filter(Boolean).join('\n');
}

/** Sends the lead to every configured channel; true only if at least one confirmed delivery. */
export async function deliverLead(l: Lead): Promise<boolean> {
  const jobs: Promise<boolean>[] = [];
  const tg = telegram();
  if (tg)
    jobs.push(
      fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: tg.chat,
          text: formatLead(l),
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(8000),
      })
        .then(async (r) => r.ok && ((await r.json()) as { ok?: boolean }).ok === true)
        .catch(() => false),
    );
  const hook = webhook();
  if (hook) {
    const secret = env('LEADS_WEBHOOK_SECRET');
    jobs.push(
      fetch(hook, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(secret ? { authorization: `Bearer ${secret}` } : {}) },
        body: JSON.stringify({ source: 'levakant-residence-site', receivedAt: new Date().toISOString(), lead: l }),
        signal: AbortSignal.timeout(8000),
      })
        .then((r) => r.ok)
        .catch(() => false),
    );
  }
  const results = await Promise.all(jobs);
  const ok = results.some(Boolean);
  if (!ok) console.error(`[leads] delivery failed (${results.length} channel(s))`);
  return ok;
}

/** Simple per-IP limiter (single server): 5 enquiries per 10 minutes. */
const hits = new Map<string, number[]>();
export function rateLimited(ip: string, now = Date.now()) {
  const win = 10 * 60_000;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  if (list.length >= 5) return true;
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < win)) hits.delete(k);
  return false;
}
