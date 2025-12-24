'use client';

import { useState } from 'react';

export function ClarityCheck({ text }: { text: string }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch('/api/languagetool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'en-US' }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error ?? 'failed');
      setMatches(d?.matches ?? []);
    } catch (e: any) {
      setErr('Clarity check failed (rate-limited sometimes).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="rowBetween">
        <div>
          <div className="label">Clarity Check</div>
          <div className="mutedSmall">LanguageTool (free) – catches ambiguity and grammar issues.</div>
        </div>
        <button className="btn" onClick={run} disabled={loading}>
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>

      {err && <div className="errorSmall">⚠ {err}</div>}
      {matches.length === 0 ? (
        <div className="mutedSmall">No suggestions yet.</div>
      ) : (
        <ul className="list">
          {matches.slice(0, 8).map((m, i) => (
            <li key={i}>
              <b>{m.shortMessage || 'Suggestion'}:</b> {m.message}{' '}
              {m.replacements?.length ? <span className="mutedSmall">Try: {m.replacements.join(', ')}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
