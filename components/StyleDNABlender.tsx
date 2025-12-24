'use client';
import { useMemo, useState } from 'react';
import { STYLE_LIBRARY } from '../engine/styleDNA';
import type { StyleBlendPack } from '../engine/styleDNABlend';

export function StyleDNABlender({ onApply }: { onApply: (pack: StyleBlendPack) => void }) {
  const [selected, setSelected] = useState<string[]>(['Cyberpunk']);
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<StyleBlendPack | null>(null);

  const options = useMemo(() => STYLE_LIBRARY.map(s => s.name), []);

  const toggle = (name: string) => {
    setSelected(prev => {
      const has = prev.includes(name);
      if (has) return prev.filter(x => x !== name);
      if (prev.length >= 4) return prev; // cap
      return [...prev, name];
    });
  };

  const blend = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/datamuse?mode=rel_trg&q=' + encodeURIComponent(selected.join(' ')) + '&max=12');
      const d = await r.json();
      const triggers = (Array.isArray(d) ? d : []).map((x: any) => x.word).filter(Boolean);

      const styles = STYLE_LIBRARY.filter(s => selected.includes(s.name));
      const uniq = (arr: string[]) => Array.from(new Set(arr));

      const next: StyleBlendPack = {
        styleLine: `Style DNA blend: ${selected.join(' + ')}`,
        core: uniq(styles.flatMap(s => s.core)).slice(0, 10),
        motifs: uniq(styles.flatMap(s => s.motifs)).slice(0, 10),
        lighting: uniq(styles.flatMap(s => s.lighting)).slice(0, 8),
        camera: uniq(styles.flatMap(s => s.camera)).slice(0, 6),
        materials: uniq(styles.flatMap(s => s.materials)).slice(0, 8),
        colorBias: uniq(styles.flatMap(s => s.colorBias)).slice(0, 8),
        bridge: uniq(triggers).slice(0, 8),
      };
      setPack(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="rowBetween">
        <h3>Style DNA Blending</h3>
        <span className="mutedSmall">Pick 2–4 styles → generate a blend pack</span>
      </div>

      <div className="pillRow">
        {options.map((o) => (
          <button key={o} className={selected.includes(o) ? 'pill active' : 'pill'} onClick={() => toggle(o)}>
            {o}
          </button>
        ))}
      </div>

      <div className="row" style={{marginTop: 10}}>
        <button className="btn" onClick={blend} disabled={loading || selected.length === 0}>
          {loading ? 'Blending…' : 'Blend styles'}
        </button>
        {pack && <button className="btn primary" onClick={() => onApply(pack)}>Apply pack</button>}
      </div>

      {pack && (
        <div className="subsection">
          <div className="mutedSmall">{pack.styleLine}</div>
          <div className="pillRow">
            {[...pack.core, ...pack.bridge].slice(0, 16).map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
