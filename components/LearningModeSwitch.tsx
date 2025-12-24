'use client';
import type { LearningMode } from '../engine/learningModes';

export function LearningModeSwitch({ mode, setMode }: { mode: LearningMode; setMode: (m: LearningMode) => void }) {
  const opts: LearningMode[] = ['beginner', 'intermediate', 'pro'];
  return (
    <div className="seg">
      {opts.map((m) => (
        <button key={m} className={mode === m ? 'segBtn active' : 'segBtn'} onClick={() => setMode(m)}>
          {m}
        </button>
      ))}
    </div>
  );
}
