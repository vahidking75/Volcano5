'use client';

import { useState } from 'react';
import type { VolcanoModel } from '../engine/modelProfiles';

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

export function PromptOutput({
  model,
  compiled,
}: {
  model: VolcanoModel;
  compiled: string;
}) {
  const [msg, setMsg] = useState('');

  return (
    <div className="card">
      <div className="rowBetween">
        <div>
          <div className="label">Prompt Output</div>
          <div className="mutedSmall">{model === 'chatgpt_image_1_5' ? 'Image Gen 1.5 format' : 'Nano Banana Pro format'}</div>
        </div>
        <button
          className="btn primary"
          onClick={async () => {
            const ok = await copyText(compiled);
            setMsg(ok ? 'Copied!' : 'Copy failed');
            setTimeout(() => setMsg(''), 1400);
          }}
        >
          Copy
        </button>
      </div>

      <pre className="pre">{compiled || '—'}</pre>
      {msg && <div className="mutedSmall">{msg}</div>}
    </div>
  );
}
