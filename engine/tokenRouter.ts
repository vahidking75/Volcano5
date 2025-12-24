import type { PromptFields, PromptFieldKey } from './promptSchema';

type Best = { k: PromptFieldKey; s: number } | null;

const RE = {
  camera: /\b(35mm|50mm|85mm|macro|telephoto|wide[-\s]?angle|fisheye|bokeh|depth of field|dof|tilt[-\s]?shift|shutter|aperture|iso|f\/\d+|cinemascope|anamorphic|rule of thirds)\b/i,
  lighting: /\b(cinematic lighting|soft light|hard light|rim light|backlight|key light|fill light|global illumination|volumetric|god rays|neon|studio lighting|tungsten|daylight|golden hour)\b/i,
  composition: /\b(close[-\s]?up|wide shot|medium shot|overhead|top[-\s]?down|low angle|high angle|symmetrical|leading lines|centered|portrait|landscape|full body|headshot)\b/i,
  materials: /\b(leather|metal|chrome|glass|wood|stone|marble|fabric|silk|velvet|plastic|ceramic|rust|patina|wet|glossy|matte|translucent|subsurface)\b/i,
  style: /\b(photoreal|photorealistic|hyperreal|anime|manga|comic|pixel art|watercolor|oil painting|ink|sketch|concept art|cinematic|film still|3d render|octane|unreal|blender)\b/i,
  mood: /\b(moody|dramatic|melancholic|whimsical|eerie|cozy|epic|dreamy|surreal|tense|calm|peaceful)\b/i,
  color: /\b(monochrome|duotone|pastel|muted|vibrant|neon|teal and orange|warm palette|cool palette|high contrast|low saturation|golden|crimson|cyan|magenta)\b/i,
  render: /\b(high detail|ultra[-\s]?detailed|4k|8k|hdr|ray tracing|global illumination|sharp focus|film grain|kodak|fuji|cinematic grading)\b/i,
  constraints: /\b(no text|no watermark|no logo|no signature|clean background|isolated|transparent background|centered product|accurate anatomy)\b/i,
  negative: /\b(blurry|low quality|watermark|logo|text|extra fingers|bad anatomy|deformed|duplicate|artifact|jpeg artifacts)\b/i,
};

// A very light scoring function: regex hit = 1.0 else 0
function scoreField(field: PromptFieldKey, token: string): number {
  const r = (RE as any)[field] as RegExp | undefined;
  if (!r) return 0;
  return r.test(token) ? 1.0 : 0;
}

export function guessField(token: string): PromptFieldKey | null {
  const t = (token ?? '').trim();
  if (!t) return null;

  let best: Best = null;

  const keys: PromptFieldKey[] = [
    'camera',
    'lighting',
    'composition',
    'materials',
    'style',
    'mood',
    'color',
    'render',
    'constraints',
    'negative',
  ];

  keys.forEach((k) => {
    const s = scoreField(k, t);
    if (s > 0 && (!best || s > best.s)) best = { k, s };
  });

  if (best && best.s >= 0.8) return best.k;

  // fallback heuristics
  if (RE.negative.test(t)) return 'negative';
  if (RE.camera.test(t)) return 'camera';
  if (RE.lighting.test(t)) return 'lighting';
  if (RE.style.test(t)) return 'style';
  if (RE.color.test(t)) return 'color';
  if (RE.mood.test(t)) return 'mood';
  if (RE.materials.test(t)) return 'materials';
  if (RE.composition.test(t)) return 'composition';
  if (RE.render.test(t)) return 'render';
  if (RE.constraints.test(t)) return 'constraints';

  return null;
}

/**
 * Add token into fields:
 * - If `forced` is provided, always use it
 * - Else route by guessField()
 * - Default route is "style" (safe + useful)
 */
export function addSmart(prev: PromptFields, token: string, forced?: PromptFieldKey): PromptFields {
  const t = (token ?? '').trim();
  if (!t) return prev;

  const target: PromptFieldKey = forced ?? guessField(t) ?? 'style';

  const next: any = { ...prev };
  const arr: string[] = Array.isArray(next[target]) ? [...next[target]] : [];
  const exists = arr.some((x) => x.toLowerCase() === t.toLowerCase());
  if (!exists) arr.push(t);
  next[target] = arr;

  return next as PromptFields;
}
