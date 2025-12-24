'use client';
import { useEffect, useMemo, useState } from 'react';

type GlossaryCategory =
  | 'Style' | 'Lighting' | 'Camera' | 'Composition' | 'Color'
  | 'Materials' | 'Mood' | 'Rendering' | 'Negative' | 'Keywords';

export function GlossaryPanel({ onAddToken }: { onAddToken: (token: string) => void }) {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState<GlossaryCategory>('Keywords');
  const [syn, setSyn] = useState<string[]>([]);
  const [related, setRelated] = useState<string[]>([]);
  const [ml, setMl] = useState<string[]>([]);

  useEffect(() => {
    const t = term.trim();
    if (!t) {
      setSyn([]); setRelated([]); setMl([]);
      return;
    }

    fetch(`/api/datamuse?mode=rel_syn&q=${encodeURIComponent(t)}&max=12`).then(r => r.json()).then((d) => {
      setSyn((Array.isArray(d) ? d : []).map((x: any) => x.word).filter(Boolean).slice(0, 12));
    }).catch(() => setSyn([]));

    fetch(`/api/datamuse?mode=ml&q=${encodeURIComponent(t)}&max=12`).then(r => r.json()).then((d) => {
      setMl((Array.isArray(d) ? d : []).map((x: any) => x.word).filter(Boolean).slice(0, 12));
    }).catch(() => setMl([]));

    fetch(`/api/conceptnet?term=${encodeURIComponent(t)}`).then(r => r.json()).then((d) => {
      const edges = (d?.edges ?? []) as any[];
      const out = edges
        .filter(e => e?.rel?.label && ['RelatedTo','HasProperty','UsedFor','PartOf'].includes(e.rel.label))
        .map(e => e?.end?.label)
        .filter(Boolean);
      setRelated(Array.from(new Set(out)).slice(0, 12));
    }).catch(() => setRelated([]));

  }, [term]);

  const label = useMemo(() => `${category}: ${term || '...'}`, [category, term]);

  return (
    <div className="card">
      <div className="rowBetween">
        <h3>Glossary</h3>
        <span className="mutedSmall">Search a term → get synonyms & related concepts</span>
      </div>

      <div className="row">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Try: chiaroscuro, bokeh, iridescent, teal"
          className="input"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value as GlossaryCategory)} className="select">
          {['Style','Lighting','Camera','Composition','Color','Materials','Mood','Rendering','Negative','Keywords'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mutedSmall" style={{marginTop: 10}}>{label}</div>

      <Section title="Meaning-like (Datamuse ml)">
        <Pills items={ml} onPick={onAddToken} />
      </Section>

      <Section title="Synonyms (Datamuse rel_syn)">
        <Pills items={syn} onPick={onAddToken} />
      </Section>

      <Section title="Related concepts (ConceptNet)">
        <Pills items={related} onPick={onAddToken} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="subsection">
      <div className="mutedSmall">{title}</div>
      {children}
    </div>
  );
}

function Pills({ items, onPick }: { items: string[]; onPick: (t: string) => void }) {
  if (!items.length) return <div className="mutedSmall">No results.</div>;
  return (
    <div className="pillRow">
      {items.map((w) => (
        <button key={w} className="pill" onClick={() => onPick(w)}>{w}</button>
      ))}
    </div>
  );
}
