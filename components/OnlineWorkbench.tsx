'use client';

import { useMemo, useState } from 'react';
import type { PromptFieldKey } from '../engine/promptSchema';

type Suggestion = { text: string; source: string; weight: number; fieldHint?: PromptFieldKey };

function uniq(arr: Suggestion[]) {
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const s of arr) {
    const k = s.text.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

export function OnlineWorkbench({
  onAdd,
}: {
  onAdd: (token: string, field?: PromptFieldKey) => void;
}) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [syn, setSyn] = useState<Suggestion[]>([]);
  const [trg, setTrg] = useState<Suggestion[]>([]);
  const [adj, setAdj] = useState<Suggestion[]>([]);
  const [concepts, setConcepts] = useState<Suggestion[]>([]);
  const [wiki, setWiki] = useState<{ title?: string; extract?: string; thumbnail?: string | null } | null>(null);
  const [dict, setDict] = useState<string | null>(null);
  const [refs, setRefs] = useState<Array<{ thumbnail: string; title?: string; url?: string }>>([]);

  const run = async () => {
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    setErr(null);

    try {
      const [synR, trgR, adjR, cnR, wikiR, dictR, ovR] = await Promise.all([
        fetch(`/api/datamuse?mode=rel_syn&q=${encodeURIComponent(term)}&max=14`).then(r => r.json()),
        fetch(`/api/datamuse?mode=rel_trg&q=${encodeURIComponent(term)}&max=14`).then(r => r.json()),
        fetch(`/api/datamuse?mode=rel_jjb&q=${encodeURIComponent(term)}&max=14`).then(r => r.json()),
        fetch(`/api/conceptnet?term=${encodeURIComponent(term)}`).then(r => r.json()),
        fetch(`/api/wikipedia?term=${encodeURIComponent(term)}`).then(r => r.json()),
        fetch(`/api/dictionary?term=${encodeURIComponent(term)}`).then(r => r.json()),
        fetch(`/api/openverse?q=${encodeURIComponent(term)}`).then(r => r.json()),
      ]);

      const synS = (synR ?? []).map((x: any) => ({ text: x.word, source: 'syn', weight: x.score ?? 1 }));
      const trgS = (trgR ?? []).map((x: any) => ({ text: x.word, source: 'trg', weight: x.score ?? 1 }));
      const adjS = (adjR ?? []).map((x: any) => ({ text: x.word, source: 'adj', weight: x.score ?? 1, fieldHint: 'mood' as const }));

      const edges = (cnR?.edges ?? []) as any[];
      const rel = edges
        .filter(e => ['RelatedTo','HasProperty','UsedFor','PartOf'].includes(e?.rel?.label))
        .slice(0, 30)
        .map(e => e?.end?.label)
        .filter(Boolean);

      const cnS = rel.map((t: string) => ({ text: t, source: 'concept', weight: 1 }));

      setSyn(synS);
      setTrg(trgS);
      setAdj(adjS);
      setConcepts(cnS);

      setWiki({ title: wikiR?.title, extract: wikiR?.extract, thumbnail: wikiR?.thumbnail ?? null });

      const entries = dictR?.entries ?? [];
      const first = entries?.[0]?.meanings?.[0]?.definitions?.[0]?.definition ?? null;
      setDict(first);

      setRefs((ovR?.results ?? []).filter((x: any) => !!x.thumbnail).map((x: any) => ({
        thumbnail: x.thumbnail,
        title: x.title,
        url: x.url
      })));
    } catch (e: any) {
      setErr('Online fetch failed. Check /api routes or rate limits.');
    } finally {
      setLoading(false);
    }
  };

  const bundle = useMemo(() => {
    const all = uniq([...syn, ...trg, ...adj, ...concepts])
      .sort((a,b)=> (b.weight ?? 0) - (a.weight ?? 0))
      .slice(0, 24);
    return all;
  }, [syn, trg, adj, concepts]);

  return (
    <div className="card">
      <div className="rowBetween">
        <div>
          <div className="label">Online Workbench</div>
          <div className="mutedSmall">Vocabulary + concepts + references. Click to add.</div>
        </div>
        <div className="row">
          <input className="input" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search: cinematic, baroque, waterfall..." />
          <button className="btn primary" onClick={run}>Search</button>
        </div>
      </div>

      {loading && <div className="mutedSmall">Fetching online sources…</div>}
      {err && <div className="errorSmall">⚠ {err}</div>}

      {wiki?.extract && (
        <div className="miniCard">
          <div className="label small">Subject enrichment</div>
          <div className="mutedSmall"><b>{wiki.title}</b>: {wiki.extract}</div>
        </div>
      )}

      {dict && (
        <div className="miniCard">
          <div className="label small">Definition</div>
          <div className="mutedSmall">{dict}</div>
        </div>
      )}

      <div className="label small">Smart bundle</div>
      <div className="chips">
        {bundle.map((s) => (
          <button key={s.source + s.text} className="chip" onClick={() => onAdd(s.text, s.fieldHint)}>
            {s.text} <span className="mutedSmall">({s.source})</span>
          </button>
        ))}
      </div>

      {refs.length > 0 && (
        <>
          <div className="label small">Reference images</div>
          <div className="refGrid">
            {refs.slice(0, 12).map((r, i) => (
              <a key={i} className="ref" href={r.url ?? '#'} target="_blank" rel="noreferrer" title={r.title ?? ''}>
                <img src={r.thumbnail} alt={r.title ?? 'reference'} />
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
