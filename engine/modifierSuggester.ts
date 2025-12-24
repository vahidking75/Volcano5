export function suggestModifiers(subject: string, descriptors: string[]) {
  const d = descriptors.map(x => (x ?? '').toLowerCase());
  const has = (kw: string) => d.some(x => x.includes(kw));

  const suggestions: string[] = [];

  if (!subject.trim()) return ['Start with a clear subject (who/what).'];

  if (!has('lighting') && !has('golden hour') && !has('cinematic') && !has('softbox') && !has('chiaroscuro')) {
    suggestions.push('cinematic lighting');
  }

  if (!has('lens') && !has('wide angle') && !has('macro') && !has('telephoto') && !has('35mm')) {
    suggestions.push('35mm lens');
  }

  if (!has('depth of field') && !has('bokeh')) {
    suggestions.push('shallow depth of field');
  }

  if (!has('mood') && !has('atmosphere') && !has('serene') && !has('ominous') && !has('whimsical')) {
    suggestions.push('serene atmosphere');
  }

  if (!has('texture') && !has('material') && !has('metal') && !has('fabric') && !has('stone')) {
    suggestions.push('highly detailed materials');
  }

  return suggestions.slice(0, 10);
}
