import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const mode = (searchParams.get('mode') ?? 'ml').trim();
  const max = Math.min(Number(searchParams.get('max') ?? '15'), 30);

  if (!q) return NextResponse.json([]);

  const url = new URL('https://api.datamuse.com/words');
  url.searchParams.set(mode, q);
  url.searchParams.set('max', String(max));

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(url.toString(), { cache: 'no-store', signal: controller.signal });
    if (!r.ok) return NextResponse.json({ error: 'Datamuse failed' }, { status: 502 });
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Datamuse timeout' }, { status: 504 });
  } finally {
    clearTimeout(t);
  }
}
