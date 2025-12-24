import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = (searchParams.get('term') ?? '').trim();
  if (!term) return NextResponse.json({ entries: [] });

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return NextResponse.json({ entries: [], error: 'dictionary_failed' }, { status: 502 });

  const data = await r.json();
  return NextResponse.json({ entries: data });
}
