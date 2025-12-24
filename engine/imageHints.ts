// Client-side image hint extraction (no external vision model).
// We extract orientation + a tiny palette and turn it into prompt-friendly words.

function rgbToHex(r: number, g: number, b: number) {
  const to = (x: number) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export async function extractBasicImageHints(file: File): Promise<{ suggestions: string[] }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { suggestions: [] };

    // Downscale for speed
    const TW = 64;
    const TH = Math.max(1, Math.round((h / w) * TW));
    canvas.width = TW;
    canvas.height = TH;
    ctx.drawImage(img, 0, 0, TW, TH);

    const data = ctx.getImageData(0, 0, TW, TH).data;

    // Simple palette: sample every N pixels and cluster by rounding
    const buckets = new Map<string, { r: number; g: number; b: number; c: number }>();
    const step = 8;
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 200) continue;
      const rr = Math.round(r / 32) * 32;
      const gg = Math.round(g / 32) * 32;
      const bb = Math.round(b / 32) * 32;
      const key = `${rr},${gg},${bb}`;
      const cur = buckets.get(key) ?? { r: rr, g: gg, b: bb, c: 0 };
      cur.c += 1;
      buckets.set(key, cur);
    }

    const palette = Array.from(buckets.values()).sort((a, b) => b.c - a.c).slice(0, 4);

    const suggestions: string[] = [];

    // Orientation / composition hint
    if (w > h) suggestions.push('landscape composition');
    else if (h > w) suggestions.push('portrait composition');
    else suggestions.push('square composition');

    // Brightness hint
    const avgLum = palette.length
      ? palette.reduce((s, p) => s + luminance(p.r, p.g, p.b), 0) / palette.length
      : 128;
    if (avgLum < 80) suggestions.push('low-key lighting');
    else if (avgLum > 180) suggestions.push('high-key lighting');
    else suggestions.push('balanced exposure');

    // Color hints (use TheColorAPI server route to name colors)
    // We return hexes as descriptors; user can later convert to words in Color panel.
    for (const p of palette) {
      suggestions.push(`color palette: ${rgbToHex(p.r, p.g, p.b)}`);
    }

    return { suggestions };
  } finally {
    URL.revokeObjectURL(url);
  }
}
