import type { VolcanoModel } from './modelProfiles';

export function lintPrompt({
  model,
  subject,
  descriptors,
  negative,
  strictness,
}: {
  model: VolcanoModel;
  subject: string;
  descriptors: string[];
  negative: string[];
  strictness: 'high'|'medium'|'low';
}) {
  const warnings: string[] = [];
  const s = (subject ?? '').trim();
  const d = descriptors.map(x => (x ?? '').toLowerCase());
  const has = (kw: string) => d.some(x => x.includes(kw));

  if (!s || s.length < 6) warnings.push('Subject looks vague. Add a clearer main subject (who/what).');

  if (strictness !== 'low' && descriptors.length < 3) {
    warnings.push('Prompt may lack depth. Add lighting, camera/view, and materials or mood.');
  }

  if (has('black and white') && (has('vibrant') || has('neon') || has('colorful'))) {
    warnings.push('Possible contradiction: black and white with vibrant/neon/colorful cues.');
  }

  if (has('macro') && has('wide angle')) warnings.push('Possible contradiction: macro shot with wide angle lens.');

  if (model === 'nano_banana_pro' && strictness === 'high' && negative.length === 0) {
    warnings.push('Nano Banana Pro often benefits from negatives (e.g., text, watermark, low quality).');
  }

  // Redundancy check (case-insensitive)
  const seen = new Set<string>();
  for (const x of descriptors) {
    const k = x.trim().toLowerCase();
    if (!k) continue;
    if (seen.has(k)) {
      warnings.push(`Redundant descriptor detected: “${x}”.`);
      break;
    }
    seen.add(k);
  }

  return warnings;
}
