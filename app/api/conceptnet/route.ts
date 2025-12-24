import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = (searchParams.get('term') ?? '').trim();
  if (!term) return NextResponse.json({ edges: [] });

  const url = `https://api.conceptnet.io/c/en/${encodeURIComponent(term)}`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!r.ok) return NextResponse.json({ error: 'ConceptNet failed' }, { status: 502 });
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'ConceptNet timeout' }, { status: 504 });
  } finally {
    clearTimeout(t);
  }
}
