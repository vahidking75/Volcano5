import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const text = (body?.text ?? '').toString();
  const language = (body?.language ?? 'en-US').toString();

  if (!text.trim()) return NextResponse.json({ matches: [] });

  const form = new URLSearchParams();
  form.set('text', text);
  form.set('language', language);

  // Public LanguageTool endpoint (rate-limited; best-effort).
  const r = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    cache: 'no-store',
  });

  if (!r.ok) return NextResponse.json({ matches: [], error: 'languagetool_failed' }, { status: 502 });

  const data = await r.json();
  return NextResponse.json({
    matches: (data?.matches ?? []).slice(0, 8).map((m: any) => ({
      message: m?.message,
      shortMessage: m?.shortMessage,
      offset: m?.offset,
      length: m?.length,
      replacements: (m?.replacements ?? []).slice(0, 4).map((x: any) => x?.value),
      rule: m?.rule?.id ?? null,
    })),
  });
}
