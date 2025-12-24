import type { VolcanoModel } from './modelProfiles';

export function explainPrompt({
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
  const s = (subject ?? '').trim() || '—';
  const desc = descriptors.map(d => (d ?? '').trim()).filter(Boolean);
  const neg = negative.map(n => (n ?? '').trim()).filter(Boolean);

  const modelNote = model === 'chatgpt_image_1_5'
    ? 'Image Gen 1.5 prefers clear descriptive sentences and coherent scene storytelling.'
    : 'Nano Banana Pro prefers structured, dense descriptors and benefits from explicit constraints (negatives).';

  return {
    subject: `Subject sets the main focus: ${s}`,
    descriptors: desc.length
      ? desc.map((d) => `“${d}” adds a visual constraint (style, lighting, camera, mood, material, etc.).`)
      : ['No descriptors yet. Add lighting/camera/materials for stronger results.'],
    negative: neg.length
      ? neg.map((n) => `“${n}” removes unwanted artifacts or styles.`)
      : [],
    modelNote,
  };
}
