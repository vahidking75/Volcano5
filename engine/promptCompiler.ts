import { MODEL_PROFILES } from './modelProfiles';
import type { VolcanoModel } from './modelProfiles';
import type { PromptFields } from './promptSchema';

function clean(arr: string[]) {
  const out: string[] = [];
  for (const x of arr ?? []) {
    const t = (x ?? '').trim();
    if (!t) continue;
    if (!out.some(y => y.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out;
}

// Legacy compiler (V2): subject + descriptors + negative
export function compilePrompt({
  model,
  subject,
  descriptors,
  negative,
}: {
  model: VolcanoModel;
  subject: string;
  descriptors: string[];
  negative: string[];
}) {
  const profile = MODEL_PROFILES[model];
  const s = (subject ?? '').trim();
  const d = clean(descriptors ?? []);
  const n = clean(negative ?? []);

  if (profile.format === 'natural') {
    const parts = [s, d.join(', ')].filter(Boolean).join('. ');
    const neg = n.length ? `Avoid: ${n.join(', ')}.` : '';
    return [parts, neg].filter(Boolean).join('\n');
  }

  // structured
  const core = [s, ...d].filter(Boolean).join(', ');
  const neg = n.length ? `--no ${n.join(', ')}` : '';
  return [core, neg].filter(Boolean).join('\n');
}

// Volcano V5: compile from structured fields
export function compileFromFields(model: VolcanoModel, fields: PromptFields): string {
  const profile = MODEL_PROFILES[model];

  const subject = (fields.subject ?? '').trim();
  const sections = [
    ['Composition', clean(fields.composition)],
    ['Camera', clean(fields.camera)],
    ['Lighting', clean(fields.lighting)],
    ['Materials', clean(fields.materials)],
    ['Style', clean(fields.style)],
    ['Mood', clean(fields.mood)],
    ['Color', clean(fields.color)],
    ['Render', clean(fields.render)],
    ['Constraints', clean(fields.constraints)],
  ] as const;

  const negative = clean(fields.negative);

  if (profile.format === 'natural') {
    const blocks: string[] = [];
    if (subject) blocks.push(subject);

    const sentenceParts: string[] = [];
    sections.forEach(([label, arr]) => {
      if (arr.length) sentenceParts.push(`${label.toLowerCase()}: ${arr.join(', ')}`);
    });
    if (sentenceParts.length) blocks.push(sentenceParts.join('. ') + '.');

    if (negative.length) blocks.push(`Avoid: ${negative.join(', ')}.`);
    return blocks.join('\n');
  }

  // structured: ordered dense list + negative flag line
  const ordered = [
    subject,
    ...clean(fields.composition),
    ...clean(fields.camera),
    ...clean(fields.lighting),
    ...clean(fields.materials),
    ...clean(fields.style),
    ...clean(fields.mood),
    ...clean(fields.color),
    ...clean(fields.render),
    ...clean(fields.constraints),
  ].filter(Boolean);

  const core = ordered.join(', ');
  const neg = negative.length ? `--no ${negative.join(', ')}` : '';
  return [core, neg].filter(Boolean).join('\n');
}
