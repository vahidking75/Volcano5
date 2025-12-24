import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = (searchParams.get('term') ?? '').trim();
  if (!term) return NextResponse.json({ extract: '' });

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return NextResponse.json({ extract: '', error: 'wikipedia_failed' }, { status: 502 });

  const data = await r.json();
  return NextResponse.json({
    title: data?.title ?? term,
    extract: data?.extract ?? '',
    thumbnail: data?.thumbnail?.source ?? null,
    page: data?.content_urls?.desktop?.page ?? null
  });
}
