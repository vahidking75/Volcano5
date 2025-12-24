import type { VolcanoModel } from './modelProfiles';
import { MODEL_PROFILES } from './modelProfiles';
import type { PromptFields } from './promptSchema';

const clean = (s: string) => (s ?? '').trim();

const cleanList = (arr: string[]) =>
  (arr ?? [])
    .map((x) => clean(x))
    .filter(Boolean)
    .filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);

const joinNonEmpty = (parts: string[], sep: string) =>
  parts.map((p) => clean(p)).filter(Boolean).join(sep);

/**
 * Compile Volcano structured fields into a model-optimized prompt string.
 * - chatgpt_image_1_5 -> descriptive, readable blocks
 * - nano_banana_pro   -> dense structured line + optional negatives
 */
export function compileFromFields(model: VolcanoModel, fields: PromptFields): string {
  const profile = MODEL_PROFILES[model];

  const subject = clean(fields.subject);

  const composition = cleanList(fields.composition);
  const camera = cleanList(fields.camera);
  const lighting = cleanList(fields.lighting);
  const materials = cleanList(fields.materials);
  const style = cleanList(fields.style);
  const mood = cleanList(fields.mood);
  const color = cleanList(fields.color);
  const render = cleanList(fields.render);
  const constraints = cleanList(fields.constraints);
  const negative = cleanList(fields.negative);

  // If completely empty, return a friendly placeholder
  const hasAny =
    Boolean(subject) ||
    composition.length ||
    camera.length ||
    lighting.length ||
    materials.length ||
    style.length ||
    mood.length ||
    color.length ||
    render.length ||
    constraints.length ||
    negative.length;

  if (!hasAny) return '';

  // ---- Descriptive mode (Image Gen 1.5 / prose-friendly) ----
  if (profile.style === 'descriptive') {
    // Start with a clean intent line
    const lines: string[] = [];
    if (subject) lines.push(subject);

    // Prefer readable labeled blocks; they're easy to edit and iterate
    const blocks = [
      composition.length ? `Composition: ${composition.join(', ')}` : '',
      camera.length ? `Camera: ${camera.join(', ')}` : '',
      lighting.length ? `Lighting: ${lighting.join(', ')}` : '',
      materials.length ? `Materials: ${materials.join(', ')}` : '',
      style.length ? `Style: ${style.join(', ')}` : '',
      mood.length ? `Mood: ${mood.join(', ')}` : '',
      color.length ? `Color: ${color.join(', ')}` : '',
      render.length ? `Render: ${render.join(', ')}` : '',
      constraints.length ? `Constraints: ${constraints.join(', ')}` : '',
    ];

    const blockText = joinNonEmpty(blocks, '\n');
    if (blockText) lines.push(blockText);

    // Negative: even if supportsNegative is false, "Avoid:" is safe text guidance
    if (negative.length) lines.push(`Avoid: ${negative.join(', ')}.`);

    // If prefersSentences, we can optionally add a sentence-style line,
    // but keep it simple and stable for build safety.
    return lines.filter(Boolean).join('\n');
  }

  // ---- Structured mode (Nano Banana Pro / dense) ----
  // Order matters: subject -> composition -> camera -> lighting -> material -> style -> mood -> color -> render -> constraints
  const positive = cleanList([
    subject,
    ...composition,
    ...camera,
    ...lighting,
    ...materials,
    ...style,
    ...mood,
    ...color,
    ...render,
    ...constraints,
  ]);

  const positiveLine = positive.join(', ');

  if (profile.supportsNegative && negative.length) {
    // Common pattern for structured models
    return `${positiveLine}\n--no ${negative.join(', ')}`;
  }

  if (negative.length) {
    return `${positiveLine}\nAvoid: ${negative.join(', ')}`;
  }

  return positiveLine;
}
