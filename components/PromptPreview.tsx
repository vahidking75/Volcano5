'use client';
import { useState } from 'react';
import type { VolcanoModel } from '../engine/modelProfiles';

export function PromptPreview({
  model,
  subject,
  descriptors,
  negative,
  compiled,
  onRemoveDescriptor,
  onRemoveNegative,
}: {
  model: VolcanoModel;
  subject: string;
  descriptors: string[];
  negative: string[];
  compiled: string;
  onRemoveDescriptor: (idx: number) => void;
  onRemoveNegative: (idx: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = compiled || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return;
    } catch {
      // Fallback for iOS / older browsers
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      } catch {
        // no-op
      }
    }
  };

  return (
    <section className="card">
      <div className="rowBetween">
        <h2>Prompt Studio</h2>
        <div className="row">
          <span className="chip">{model === 'chatgpt_image_1_5' ? 'Image Gen 1.5' : 'Nano Banana Pro'}</span>
          <button className="btn primary" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      </div>

      <div className="subsection">
        <div className="mutedSmall">Descriptors</div>
        <div className="pillRow">
          {descriptors.length === 0 ? <span className="mutedSmall">Add descriptors from panels or type above.</span> : null}
          {descriptors.map((d, idx) => (
            <button key={`${d}-${idx}`} className="pill" onClick={() => onRemoveDescriptor(idx)} title="Remove">
              {d} <span className="pillX">×</span>
            </button>
          ))}
        </div>
      </div>

      <div className="subsection">
        <div className="mutedSmall">Negative</div>
        <div className="pillRow">
          {negative.length === 0 ? <span className="mutedSmall">Optional. Add with “-word” in the input.</span> : null}
          {negative.map((n, idx) => (
            <button key={`${n}-${idx}`} className="pill danger" onClick={() => onRemoveNegative(idx)} title="Remove">
              {n} <span className="pillX">×</span>
            </button>
          ))}
        </div>
      </div>

      <div className="subsection">
        <div className="mutedSmall">Compiled output</div>
        <pre className="pre">{compiled || (subject ? 'Add at least one descriptor for stronger results.' : 'Start by describing your subject.')}</pre>
      </div>
    </section>
  );
}
