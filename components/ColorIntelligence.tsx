'use client';
import { useEffect, useMemo, useState } from 'react';

export function ColorIntelligence({ onAddColorWords }: { onAddColorWords: (words: string[]) => void }) {
  const [hex, setHex] = useState('#22c55e');
  const [name, setName] = useState('');
  const [scheme, setScheme] = useState<'analogic'|'complement'|'triad'|'monochrome'>('analogic');
  const [palette, setPalette] = useState<{ hex: string; name?: string }[]>([]);

  useEffect(() => {
    fetch(`/api/color?mode=id&hex=${hex.replace('#','')}`)
      .then(r => r.json())
      .then(d => setName(d?.name?.value ?? ''))
      .catch(() => setName(''));
  }, [hex]);

  useEffect(() => {
    fetch(`/api/color?mode=scheme&scheme=${scheme}&hex=${hex.replace('#','')}&count=6`)
      .then(r => r.json())
      .then(d => {
        const cols = (d?.colors ?? []).map((c: any) => ({
          hex: c?.hex?.value,
          name: c?.name?.value,
        }));
        setPalette(cols);
      })
      .catch(() => setPalette([]));
  }, [hex, scheme]);

  const colorWords = useMemo(() => {
    const base = name ? [name] : [];
    const extras =
      scheme === 'monochrome' ? ['monochrome palette'] :
      scheme === 'complement' ? ['complementary colors'] :
      scheme === 'triad' ? ['triadic palette'] :
      ['analogous palette'];
    return [...base, ...extras];
  }, [name, scheme]);

  return (
    <div className="card">
      <div className="rowBetween">
        <h3>Color Intelligence</h3>
        <span className="mutedSmall">Pick a color → get prompt words + palettes</span>
      </div>

      <div className="row">
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} />
        <div>
          <div className="textStrong">{name || '—'}</div>
          <div className="mutedSmall">{hex}</div>
        </div>
        <div className="spacer" />
        <select className="select" value={scheme} onChange={(e) => setScheme(e.target.value as any)}>
          <option value="analogic">Analogous</option>
          <option value="complement">Complement</option>
          <option value="triad">Triad</option>
          <option value="monochrome">Monochrome</option>
        </select>
        <button className="btn primary" onClick={() => onAddColorWords(colorWords)}>Add color words</button>
      </div>

      <div className="subsection">
        <div className="mutedSmall">Palette</div>
        <div className="palette">
          {palette.map((p) => (
            <button key={p.hex} className="paletteItem" onClick={() => onAddColorWords([p.name || p.hex])}>
              <span className="swatch" style={{ background: p.hex }} />
              <span className="paletteName">{p.name || p.hex}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
