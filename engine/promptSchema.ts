export type PromptFieldKey =
  | 'composition'
  | 'camera'
  | 'lighting'
  | 'materials'
  | 'style'
  | 'mood'
  | 'color'
  | 'render'
  | 'constraints'
  | 'negative';

export type PromptFields = {
  subject: string;
  composition: string[];
  camera: string[];
  lighting: string[];
  materials: string[];
  style: string[];
  mood: string[];
  color: string[];
  render: string[];
  constraints: string[];
  negative: string[];
};

export const EMPTY_FIELDS: PromptFields = {
  subject: '',
  composition: [],
  camera: [],
  lighting: [],
  materials: [],
  style: [],
  mood: [],
  color: [],
  render: [],
  constraints: [],
  negative: [],
};

export function normalizeToken(t: string): string {
  return (t ?? '').trim().replace(/\s+/g, ' ');
}

export function addUnique(list: string[], token: string): string[] {
  const t = normalizeToken(token);
  if (!t) return list;
  const low = t.toLowerCase();
  return list.some(x => x.toLowerCase() === low) ? list : [...list, t];
}

export function removeAt(list: string[], idx: number): string[] {
  return list.filter((_, i) => i !== idx);
}

export function serializeFields(fields: PromptFields) {
  return fields;
}

export function deserializeFields(data: any): PromptFields {
  const f: PromptFields = { ...EMPTY_FIELDS, ...(data ?? {}) };
  // Ensure arrays
  (Object.keys(EMPTY_FIELDS) as (keyof PromptFields)[]).forEach((k) => {
    if (k === 'subject') return;
    const v: any = (f as any)[k];
    (f as any)[k] = Array.isArray(v) ? v.map(normalizeToken).filter(Boolean) : [];
  });
  f.subject = normalizeToken(f.subject ?? '');
  return f;
}
