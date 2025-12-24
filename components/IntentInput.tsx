'use client';
import { useMemo, useState } from 'react';
import { expandLocalKeywords } from '../engine/wordModeKeywords';

export function IntentInput({
  subject,
  setSubject,
  onAddDescriptor,
  onAddNegative,
  density,
}: {
  subject: string;
  setSubject: (s: string) => void;
  onAddDescriptor: (t: string) => void;
  onAddNegative: (t: string) => void;
  density: 'low' | 'medium' | 'high';
}) {
  const [quickToken, setQuickToken] = useState('');

  const wordModeHints = useMemo(() => expandLocalKeywords(subject).slice(0, density === 'low' ? 6 : 10), [subject, density]);

  return (
    <section className="card">
      <div className="rowBetween">
        <h2>Intent</h2>
        <span className="mutedSmall">Describe what you want to see.</span>
      </div>

      <textarea
        className="textarea"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Example: a colossal obsidian dragon emerging from desert sand, cinematic atmosphere"
      />

      <div className="row">
        <input
          className="input"
          value={quickToken}
          onChange={(e) => setQuickToken(e.target.value)}
          placeholder="Add a descriptor or negative (prefix with -)"
        />
        <button
          className="btn"
          onClick={() => {
            const t = quickToken.trim();
            if (!t) return;
            if (t.startsWith('-')) onAddNegative(t.slice(1).trim());
            else onAddDescriptor(t);
            setQuickToken('');
          }}
        >
          Add
        </button>
      </div>

      <div className="subsection">
        <div className="mutedSmall">Word-mode hints (local)</div>
        <div className="pillRow">
          {wordModeHints.map((w) => (
            <button key={w} className="pill" onClick={() => onAddDescriptor(w)}>{w}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
