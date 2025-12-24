// Lightweight local “word mode” hints. These are fast and do not require network.
// (You still have Glossary + Datamuse/ConceptNet for online intelligence.)

const RULES: Array<{ test: RegExp; add: string[] }> = [
  { test: /portrait|face|person|character/i, add: ['portrait framing', 'catchlight', 'skin texture', 'shallow depth of field'] },
  { test: /city|street|urban/i, add: ['wide angle', 'wet asphalt', 'neon signage', 'atmospheric haze'] },
  { test: /desert|sand|dune/i, add: ['golden hour', 'windblown sand', 'heat haze', 'high contrast shadows'] },
  { test: /forest|jungle/i, add: ['volumetric rays', 'mist', 'lush foliage', 'dappled light'] },
  { test: /underwater|ocean|sea/i, add: ['caustics', 'particles in water', 'blue-green palette', 'soft light falloff'] },
  { test: /dragon|monster|creature/i, add: ['detailed scales', 'rim light', 'dynamic pose', 'cinematic composition'] },
];

export function expandLocalKeywords(text: string) {
  const out: string[] = [];
  for (const r of RULES) {
    if (r.test.test(text)) out.push(...r.add);
  }
  // Always useful basics
  out.push('high detail', 'cinematic lighting', '35mm lens', 'depth of field');
  return Array.from(new Set(out));
}
