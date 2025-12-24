import type { VolcanoModel } from './modelProfiles';
import { MODEL_PROFILE } from './modelProfiles';
import type { PromptFields } from './promptSchema';

const cleanList = (arr: string[]) =>
  (arr ?? [])
    .map((x) => (x ?? '').trim())
    .filter(Boolean)
    .filter((v, i, a) => a.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);

const joinNonEmpty = (parts: string[], sep: string) => parts.map((p) => p.trim()).filter(Boolean).join(sep);

export function compileFromFields(model: VolcanoModel, fields: PromptFields): string {
  const profile = MODEL_PROFILE[model];

  const subject = (fields.subject ?? '').trim();

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

  // ---- Descriptive (Image Gen 1.5 style) ----
  if (profile.style === 'descriptive') {
    const sentenceParts: string[] = [];

    if (subject) sentenceParts.push(subject);

    const detailLine = joinNonEmpty(
      [
        composition.length ? `Composition: ${composition.join(', ')}` : '',
        camera.length ? `Camera: ${camera.join(', ')}` : '',
        lighting.length ? `Lighting: ${lighting.join(', ')}` : '',
        materials.length ? `Materials: ${materials.join(', ')}` : '',
        style.length ? `Style: ${style.join(', ')}` : '',
        mood.length ? `Mood: ${mood.join(', ')}` : '',
        color.length ? `Color: ${color.join(', ')}` : '',
        render.length ? `Render: ${render.join(', ')}` : '',
        constraints.length ? `Constraints: ${constraints.join(', ')}` : '',
      ],
      '\n'
    );

    if (detailLine) sentenceParts.push(detailLine);

    // Even if supportsNegative is false, we can add an "Avoid" line (harmless)
    const avoidLine = negative.length ? `Avoid: ${negative.join(', ')}.` : '';
    if (avoidLine) sentenceParts.push(avoidLine);

    return sentenceParts.filter(Boolean).join('\n');
  }

  // ---- Structured (Nano Banana Pro style) ----
  const pos = cleanList([
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

  const posLine = pos.join(', ');

  if (profile.supportsNegative && negative.length) {
    // Common structured pattern: `--no ...`
    return `${posLine}\n--no ${negative.join(', ')}`;
  }

  // If no negative support, just append as "Avoid:"
  if (negative.length) return `${posLine}\nAvoid: ${negative.join(', ')}`;

  return posLine;
}
