import { connection } from 'next/server';
import { leadSchema } from '@/lib/leadSchema';
import { deliverLead, leadsEnabled, rateLimited } from '@/lib/leads.server';

/** Is the enquiry form connected? Read at request time (env may change without a rebuild). */
export async function GET() {
  await connection();
  return Response.json({ enabled: leadsEnabled() }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!leadsEnabled()) return Response.json({ error: 'not_configured' }, { status: 503 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
  if (rateLimited(ip)) return Response.json({ error: 'rate_limited' }, { status: 429 });
  const raw = await req.text();
  if (raw.length > 16_000) return Response.json({ error: 'too_large' }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    return Response.json({ error: 'invalid', fields }, { status: 400 });
  }
  // honeypot filled: a bot — accept silently, deliver nothing
  if (parsed.data.company) return Response.json({ ok: true });
  const ok = await deliverLead(parsed.data);
  return ok ? Response.json({ ok: true }) : Response.json({ error: 'delivery_failed' }, { status: 502 });
}
