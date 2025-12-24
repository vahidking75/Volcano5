import type { PromptFieldKey, PromptFields } from './promptSchema';
import { addUnique, normalizeToken } from './promptSchema';

export type RouteHint = Partial<Record<PromptFieldKey, number>>;

const RE = {
  lens: /(\b(lens|mm|f\/\d+(\.\d+)?|aperture|depth of field|dof|bokeh|tilt-shift)\b)/i,
  camera: /(\b(wide shot|close-up|macro|telephoto|wide angle|35mm|50mm|85mm|isometric|overhead|top-down|low angle|high angle|eye-level)\b)/i,
  lighting: /(\b(rim light|backlight|softbox|diffused|volumetric|god rays|neon glow|tungsten|golden hour|studio lighting|dramatic lighting|ambient occlusion)\b)/i,
  material: /(\b(matte|glossy|metallic|chrome|glass|ceramic|leather|skin texture|micro-detail|patina|velvet|marble|wood grain)\b)/i,
  style: /(\b(anime|manga|pixar|ghibli|cyberpunk|baroque|impressionist|watercolor|oil painting|3d render|octane|unreal|cinematic)\b)/i,
  mood: /(\b(moody|melancholic|serene|ominous|dreamy|whimsical|epic|mysterious|romantic|nostalgic)\b)/i,
  color: /(\b(palette|monochrome|pastel|vibrant|muted|teal|orange|crimson|emerald|gold|neon|warm tones|cool tones)\b)/i,
  render: /(\b(hyperreal|photoreal|film grain|hdr|8k|high detail|ultra detailed|subsurface scattering|global illumination)\b)/i,
  constraint: /(\b(no text|no watermark|clean background|centered|rule of thirds|minimalist|symmetrical)\b)/i,
  negative: /(\b(blurry|low quality|jpeg artifacts|watermark|text|extra fingers|deformed|bad anatomy)\b)/i,
};

export function routeToken(tokenRaw: string, hint?: RouteHint): PromptFieldKey {
  const token = normalizeToken(tokenRaw);
  if (!token) return 'style';

  // strong hint wins
  if (hint) {
    let best: { k: PromptFieldKey; s: number } | null = null;
    (Object.keys(hint) as PromptFieldKey[]).forEach((k) => {
      const s = hint[k] ?? 0;
      if (s > 0 && (!best || s > best.s)) best = { k, s };
    });
    if (best && best.s >= 0.8) return best.k;
  }

  if (RE.negative.test(token)) return 'negative';
  if (RE.lighting.test(token)) return 'lighting';
  if (RE.lens.test(token) || RE.camera.test(token)) return 'camera';
  if (RE.material.test(token)) return 'materials';
  if (RE.render.test(token)) return 'render';
  if (RE.color.test(token)) return 'color';
  if (RE.mood.test(token)) return 'mood';
  if (RE.style.test(token)) return 'style';
  if (RE.constraint.test(token)) return 'constraints';
  // default: style
  return 'style';
}

export function addSmart(fields: PromptFields, token: string, field?: PromptFieldKey, hint?: RouteHint): PromptFields {
  const t = normalizeToken(token);
  if (!t) return fields;
  const k = field ?? routeToken(t, hint);
  const next = { ...fields };
  if (k === 'negative') next.negative = addUnique(next.negative, t);
  else (next as any)[k] = addUnique((next as any)[k], t);
  return next;
}
