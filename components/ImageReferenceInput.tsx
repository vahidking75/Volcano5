'use client';
import { useState } from 'react';
import { extractBasicImageHints } from '../engine/imageHints';

export function ImageReferenceInput({ onExtract }: { onExtract: (info: { suggestions: string[] }) => void }) {
  const [status, setStatus] = useState<string>('');

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setStatus('Analyzing…');
    try {
      const info = await extractBasicImageHints(file);
      onExtract(info);
      setStatus('Added suggestions from image.');
      setTimeout(() => setStatus(''), 2000);
    } catch {
      setStatus('Could not analyze this image.');
      setTimeout(() => setStatus(''), 2500);
    }
  };

  return (
    <div className="card">
      <div className="rowBetween">
        <h3>Reference Image</h3>
        <span className="mutedSmall">Auto-suggest descriptors from aspect + palette</span>
      </div>
      <input className="input" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
      {status ? <div className="mutedSmall" style={{marginTop: 8}}>{status}</div> : null}
      <div className="mutedSmall" style={{marginTop: 8}}>
        Note: this is a free, local analysis (no vision model). It extracts orientation + dominant colors and turns them into prompt words.
      </div>
    </div>
  );
}
