import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  if (!q) return NextResponse.json({ results: [] });

  // Openverse has a public API (no key required for simple search in many cases).
  const url = new URL('https://api.openverse.engineering/v1/images/');
  url.searchParams.set('q', q);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', '12');
  url.searchParams.set('license_type', 'commercial'); // keep safe reuse-friendly

  const r = await fetch(url.toString(), { cache: 'no-store' });
  if (!r.ok) return NextResponse.json({ results: [], error: 'openverse_failed' }, { status: 502 });

  const data = await r.json();
  return NextResponse.json({
    results: (data?.results ?? []).map((x: any) => ({
      id: x?.id,
      title: x?.title,
      url: x?.url,
      thumbnail: x?.thumbnail,
      creator: x?.creator,
      license: x?.license,
      license_version: x?.license_version,
      license_url: x?.license_url,
      source: x?.source,
    })),
  });
}
