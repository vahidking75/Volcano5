import type { PromptFields, PromptFieldKey } from './promptSchema';
import { normalizeToken } from './promptSchema';

export type BrainIssue = { type: 'missing'|'conflict'|'clarity'|'risk'; message: string; severity: 1|2|3 };
export type BrainAction = { id: string; label: string; why: string; field: PromptFieldKey; tokens: string[]; boost: number };

const CONTRA = [
  { a: /monochrome/i, b: /(rainbow|multicolor|vibrant palette)/i, msg: 'You asked for monochrome but also multicolor/vibrant palette.' },
  { a: /minimal/i, b: /(ultra detailed|highly detailed|intricate)/i, msg: 'Minimalist conflicts with ultra-detailed/intricate.' },
  { a: /no text/i, b: /(typography|logo|title|text)/i, msg: 'No-text conflicts with typography/logo/text.' },
];

function hasAny(arr: string[]) { return arr.length > 0; }

export function scorePrompt(f: PromptFields): number {
  let s = 30;
  if (normalizeToken(f.subject)) s += 20;
  if (hasAny(f.composition)) s += 8;
  if (hasAny(f.camera)) s += 8;
  if (hasAny(f.lighting)) s += 10;
  if (hasAny(f.materials)) s += 6;
  if (hasAny(f.style)) s += 8;
  if (hasAny(f.mood)) s += 4;
  if (hasAny(f.color)) s += 3;
  if (hasAny(f.constraints)) s += 2;
  if (hasAny(f.negative)) s += 1;
  // penalty for too many tokens without structure
  const total = ['composition','camera','lighting','materials','style','mood','color','render','constraints','negative']
    .flatMap((k:any)=> (f as any)[k] as string[]).length;
  if (total > 40) s -= 5;
  return Math.max(0, Math.min(100, s));
}

export function analyzePrompt(f: PromptFields) {
  const issues: BrainIssue[] = [];
  const actions: BrainAction[] = [];

  if (!normalizeToken(f.subject)) {
    issues.push({ type:'missing', message:'Subject is empty. Add what the image is about.', severity:3 });
    actions.push({
      id:'add-subject',
      label:'Add a clear subject line',
      why:'A specific subject dramatically improves controllability.',
      field:'composition',
      tokens:['(describe your main subject clearly)'],
      boost:18
    });
  }

  const need: Array<{k: PromptFieldKey, name: string, severity: 1|2|3, suggestions: string[]}> = [
    { k:'composition', name:'Composition', severity:2, suggestions:['rule of thirds', 'foreground subject, background context', 'leading lines']},
    { k:'camera', name:'Camera', severity:2, suggestions:['35mm lens', 'shallow depth of field', 'eye-level shot']},
    { k:'lighting', name:'Lighting', severity:3, suggestions:['soft diffused key light', 'rim light', 'volumetric haze']},
    { k:'materials', name:'Materials', severity:1, suggestions:['realistic texture', 'micro-detail', 'subsurface scattering']},
    { k:'style', name:'Style', severity:2, suggestions:['cinematic', 'photoreal', 'high detail']},
  ];

  need.forEach(n => {
    const arr = (f as any)[n.k] as string[];
    if (!arr || arr.length === 0) {
      issues.push({ type:'missing', message:`${n.name} is missing.`, severity:n.severity });
      actions.push({
        id:`suggest-${n.k}`,
        label:`Add ${n.name.toLowerCase()} anchors`,
        why:`Prompts with explicit ${n.name.toLowerCase()} produce more consistent results.`,
        field:n.k,
        tokens:n.suggestions,
        boost: n.severity === 3 ? 14 : 9
      });
    }
  });

  // conflicts
  const allText = [
    f.subject, ...f.composition, ...f.camera, ...f.lighting, ...f.materials, ...f.style, ...f.mood, ...f.color, ...f.render, ...f.constraints
  ].join(' | ');
  CONTRA.forEach(c => {
    if (c.a.test(allText) && c.b.test(allText)) {
      issues.push({ type:'conflict', message:c.msg, severity:3 });
    }
  });

  // risk: text artifacts if not constrained
  if (/text|typography|logo|title/i.test(allText) && !f.constraints.some(x=>/no text/i.test(x))) {
    issues.push({ type:'risk', message:'You mention text/logo, but there is no constraint about legibility or placement.', severity:2 });
    actions.push({
      id:'text-constraints',
      label:'Add text constraints',
      why:'Text rendering benefits from clear constraints to avoid gibberish.',
      field:'constraints',
      tokens:['clean readable typography', 'no gibberish text', 'high-contrast lettering'],
      boost:10
    });
  }

  // rank actions
  actions.sort((a,b)=> b.boost - a.boost);
  return { score: scorePrompt(f), issues, actions };
}
