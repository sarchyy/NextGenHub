import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';

/*
  Kontakt forma: browser -> POST /api/send -> Supabase (service role, samo na serveru).
  E-mail obavijest šalje baza (okidač contacts_email_notification + Vault),
  pa ovdje nema Resend ključa ni paketa.

  Potrebne varijable okruženja (samo server, bez NEXT_PUBLIC_):
    SUPABASE_SERVICE_ROLE_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
  (NEXT_PUBLIC_SUPABASE_URL već postoji.)
*/

const MAX_BODY_CHARS = 20_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isProduction = process.env.NODE_ENV === 'production';

// Limiteri postoje samo ako su Upstash varijable podešene.
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : null;
const perIpLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '10 m'), prefix: 'nextgenhub:contact:ip' })
  : null;
const globalLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(40, '1 h'), prefix: 'nextgenhub:contact:global' })
  : null;

const reply = (body: Record<string, unknown>, status: number, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers });

const unavailable = () => reply({ error: 'Slanje trenutno nije dostupno. Pokušajte ponovo kasnije.' }, 503);

const tooManyRequests = (resetMs: number) =>
  reply(
    { error: 'Previše pokušaja. Pokušajte ponovo za nekoliko minuta.' },
    429,
    { 'Retry-After': String(Math.max(1, Math.ceil((resetMs - Date.now()) / 1000))) },
  );

// Uklanja kontrolne znakove; novi redovi se čuvaju samo ako keepNewlines = true.
const stripControl = (value: string, keepNewlines: boolean) =>
  Array.from(value.replace(/\r\n?/g, '\n'), (ch) => {
    if (ch === '\n') return keepNewlines ? '\n' : ' ';
    const code = ch.charCodeAt(0);
    return code < 32 || code === 127 ? ' ' : ch;
  }).join('');

// Čisti, skraćuje na max znakova (po znaku, ne po bajtu) i vraća prazan string za ne-tekst.
const clean = (value: unknown, max: number, keepNewlines = false) =>
  typeof value === 'string'
    ? Array.from(stripControl(value, keepNewlines).trim()).slice(0, max).join('')
    : '';

const getClientIp = (request: Request) =>
  request.headers.get('x-real-ip')?.trim()
  || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  || 'unknown';

export async function POST(request: Request) {
  // 1) Veličina i oblik zahtjeva
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return reply({ error: 'Neispravan zahtjev.' }, 400);
  }
  if (raw.length > MAX_BODY_CHARS) {
    return reply({ error: 'Zahtjev je prevelik.' }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('not an object');
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: 'Neispravan zahtjev.' }, 400);
  }

  // 2) Honeypot: ljudi ne vide polje "website"; botovi ga popunjavaju.
  //    Glumimo uspjeh, ništa ne spremamo.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return reply({ ok: true }, 201);
  }

  // 3) Rate limit (po IP adresi, pa ukupno). Bez Upstasha produkcija ne prima prijave.
  if (!perIpLimiter || !globalLimiter) {
    if (isProduction) {
      console.error('Upstash nije podešen: kontakt forma je isključena.');
      return unavailable();
    }
    console.warn('Upstash nije podešen: rate limit preskočen (samo lokalni razvoj).');
  } else {
    try {
      const ipResult = await perIpLimiter.limit(getClientIp(request));
      if (!ipResult.success) return tooManyRequests(ipResult.reset);
      const globalResult = await globalLimiter.limit('all');
      if (!globalResult.success) return tooManyRequests(globalResult.reset);
    } catch (error) {
      console.error('Rate limiter nije dostupan:', error);
      return unavailable();
    }
  }

  // 4) Sanitizacija i validacija
  const full_name = clean(body.fullName, 120);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const program = clean(body.program, 160) || 'Opšti upit';
  const message = clean(body.message, 4000, true);
  if (full_name.length < 2 || !EMAIL_RE.test(email)) {
    return reply({ error: 'Unesite ispravno ime i email adresu.' }, 400);
  }

  // 5) Upis u bazu (service role samo ovdje, na serveru)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Nedostaje NEXT_PUBLIC_SUPABASE_URL ili SUPABASE_SERVICE_ROLE_KEY.');
    return unavailable();
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.from('contacts').insert({
    full_name,
    email,
    phone: phone || null,
    program,
    message: message || null,
  });
  if (error) {
    console.error('Supabase contact insert failed:', error.message);
    return reply({ error: 'Prijavu trenutno nije moguće sačuvati. Pokušajte ponovo.' }, 500);
  }

  return reply({ ok: true }, 201);
}