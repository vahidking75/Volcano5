import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawHex = (searchParams.get('hex') ?? '').replace('#', '').trim();
  const mode = (searchParams.get('mode') ?? 'id').trim();
  const scheme = (searchParams.get('scheme') ?? 'analogic').trim();
  const count = Math.min(Number(searchParams.get('count') ?? '6'), 8);

  if (!rawHex) return NextResponse.json({ error: 'Missing hex' }, { status: 400 });

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    if (mode === 'id') {
      const r = await fetch(`https://www.thecolorapi.com/id?hex=${rawHex}`, { cache: 'no-store', signal: controller.signal });
      if (!r.ok) return NextResponse.json({ error: 'Color API failed' }, { status: 502 });
      return NextResponse.json(await r.json());
    }

    const r = await fetch(
      `https://www.thecolorapi.com/scheme?hex=${rawHex}&mode=${encodeURIComponent(scheme)}&count=${count}`,
      { cache: 'no-store', signal: controller.signal }
    );
    if (!r.ok) return NextResponse.json({ error: 'Color API failed' }, { status: 502 });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ error: 'Color API timeout' }, { status: 504 });
  } finally {
    clearTimeout(t);
  }
}
