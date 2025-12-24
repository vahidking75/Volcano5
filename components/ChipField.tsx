'use client';

import { useState } from 'react';

export function ChipField({
  label,
  items,
  placeholder,
  onAdd,
  onRemove,
  suggested,
  compact,
}: {
  label: string;
  items: string[];
  placeholder?: string;
  onAdd: (t: string) => void;
  onRemove: (idx: number) => void;
  suggested?: string[];
  compact?: boolean;
}) {
  const [value, setValue] = useState('');

  return (
    <div className={compact ? 'field compact' : 'field'}>
      <div className="fieldHeader">
        <div className="fieldLabel">{label}</div>
        <div className="fieldAdd">
          <input
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder ?? `Add ${label.toLowerCase()}...`}
          />
          <button
            className="btn"
            onClick={() => {
              onAdd(value);
              setValue('');
            }}
          >
            Add
          </button>
        </div>
      </div>

      {suggested && suggested.length > 0 && (
        <div className="chips subtle">
          {suggested.slice(0, 6).map((s) => (
            <button key={s} className="chip" onClick={() => onAdd(s)}>
              {s} +
            </button>
          ))}
        </div>
      )}

      <div className="chips">
        {items.map((t, i) => (
          <button key={t + i} className="chip" onClick={() => onRemove(i)} title="Tap to remove">
            {t} ✕
          </button>
        ))}
        {items.length === 0 && <div className="mutedSmall">—</div>}
      </div>
    </div>
  );
}
