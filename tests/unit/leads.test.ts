import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/server', () => ({ connection: async () => {} }));

const lead = {
  name: 'Анвар <b>',
  phone: '+992 90 123 45 67',
  method: 'whatsapp',
  wants: ['prices'],
  interest: null,
  message: '',
  layouts: ['b8029'],
  commercial: false,
  calc: { layout: 'b6329', floors: 'typ', down: 30, term: 24 },
  locale: 'ru',
  page: 'https://example.com/ru',
  utm: { utm_source: 'instagram' },
  company: '',
};
let ipN = 0;
const post = async (body: unknown, ip = `10.0.0.${++ipN}`, extra: Record<string, string> = {}) => {
  const { POST } = await import('@/app/api/leads/route');
  return POST(
    new Request('http://site.test/api/leads', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'x-forwarded-for': ip, host: 'site.test', origin: 'http://site.test', ...extra },
    }),
  );
};

describe('/api/leads', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });
  afterEach(() => vi.restoreAllMocks());

  it('is disabled without a channel and a privacy policy — no fake success', async () => {
    const { GET } = await import('@/app/api/leads/route');
    expect(await (await GET()).json()).toEqual({ enabled: false });
    expect((await post(lead)).status).toBe(503);
    vi.stubEnv('LEADS_WEBHOOK_URL', 'https://crm.example/hook');
    expect((await post(lead)).status).toBe(503); // still no privacy policy
  });

  describe('with a webhook and a privacy policy', () => {
    beforeEach(() => {
      vi.stubEnv('LEADS_WEBHOOK_URL', 'https://crm.example/hook');
      vi.stubEnv('LEADS_WEBHOOK_SECRET', 's3cret');
      vi.stubEnv('PRIVACY_POLICY_URL', 'https://example.com/privacy');
    });

    it('rejects invalid fields with their names', async () => {
      const r = await post({ ...lead, name: 'А', phone: '12' });
      expect(r.status).toBe(400);
      expect((await r.json()).fields).toEqual(expect.arrayContaining(['name', 'phone']));
    });

    it('honeypot: accepted silently, nothing delivered', async () => {
      const f = vi.spyOn(globalThis, 'fetch');
      expect((await post({ ...lead, company: 'bot' })).status).toBe(200);
      expect(f).not.toHaveBeenCalled();
    });

    it('delivers to the webhook and answers ok only after it confirms', async () => {
      const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      const r = await post(lead);
      expect(r.status).toBe(200);
      const [url, init] = f.mock.calls[0];
      expect(url).toBe('https://crm.example/hook');
      expect((init!.headers as Record<string, string>).authorization).toBe('Bearer s3cret');
      expect(JSON.parse(init!.body as string).lead).toMatchObject({ phone: '+992 90 123 45 67', layouts: ['b8029'] });
    });

    it('delivery failure → 502, and no personal data in the logs', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('down', { status: 500 }));
      const err = vi.spyOn(console, 'error').mockImplementation(() => {});
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      expect((await post(lead)).status).toBe(502);
      const printed = JSON.stringify([...err.mock.calls, ...log.mock.calls]);
      expect(printed).not.toContain('Анвар');
      expect(printed).not.toContain('123 45 67');
    });

    it('only the site itself may post (Origin check)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      expect((await post(lead, undefined, { origin: 'https://evil.example' })).status).toBe(403);
      const { POST } = await import('@/app/api/leads/route');
      const noOrigin = await POST(
        new Request('http://site.test/api/leads', {
          method: 'POST',
          body: JSON.stringify(lead),
          headers: { host: 'site.test' },
        }),
      );
      expect(noOrigin.status).toBe(403);
    });

    it('a forged X-Forwarded-For prefix does not bypass the per-client limit', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      const codes = [];
      for (let i = 0; i < 6; i++) codes.push((await post(lead, `1.1.1.${i}, 10.8.8.8`)).status);
      expect(codes.at(-1)).toBe(429);
    });

    it('total cap: 60 enquiries per 10 minutes across all clients', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      let last = 0;
      for (let i = 0; i < 61; i++) last = (await post(lead, `10.7.${i}.1`)).status;
      expect(last).toBe(429);
    });

    it('rate limit: 5 enquiries per 10 minutes per IP', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
      const codes = [];
      for (let i = 0; i < 6; i++) codes.push((await post(lead, '10.9.9.9')).status);
      expect(codes).toEqual([200, 200, 200, 200, 200, 429]);
    });
  });

  it('Telegram message: escaped HTML, readable summary', async () => {
    vi.stubEnv('LEADS_TELEGRAM_BOT_TOKEN', '123:abc');
    vi.stubEnv('LEADS_TELEGRAM_CHAT_ID', '-100');
    vi.stubEnv('PRIVACY_POLICY_URL', 'https://example.com/privacy');
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ ok: true }));
    expect((await post(lead)).status).toBe(200);
    const body = JSON.parse(f.mock.calls[0][1]!.body as string);
    expect(f.mock.calls[0][0]).toBe('https://api.telegram.org/bot123:abc/sendMessage');
    expect(body.text).toContain('Анвар &lt;b&gt;');
    expect(body.text).toContain('2-комнатная 80,29 м² (b8029)');
    expect(body.text).toContain('взнос 30%, 24 мес.');
  });
});
