'use client';
import type { VolcanoModel } from '../engine/modelProfiles';
import type { LearningMode } from '../engine/learningModes';

export function IntelligencePanel({
  learningMode,
  model,
  warnings,
  modelTips,
  missingSuggestions,
  onAddDescriptor,
  onAddNegative,
}: {
  learningMode: LearningMode;
  model: VolcanoModel;
  warnings: string[];
  modelTips: string[];
  missingSuggestions: string[];
  onAddDescriptor: (t: string) => void;
  onAddNegative: (t: string) => void;
}) {
  return (
    <section className="card">
      <div className="rowBetween">
        <h3>Volcano Intelligence</h3>
        <span className="chip">{learningMode}</span>
      </div>

      <div className="subsection">
        <div className="mutedSmall">Model tips</div>
        <div className="pillRow">
          {modelTips.map((t) => (
            <button key={t} className="pill" onClick={() => onAddDescriptor(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="subsection">
        <div className="mutedSmall">Suggested missing modifiers</div>
        <div className="pillRow">
          {missingSuggestions.length === 0 ? <span className="mutedSmall">Looks good.</span> : null}
          {missingSuggestions.map((t) => (
            <button key={t} className="pill" onClick={() => onAddDescriptor(t)}>{t}</button>
          ))}
          {model === 'nano_banana_pro' && (
            <button className="pill danger" onClick={() => onAddNegative('text, watermark, low quality')}>Add common negatives</button>
          )}
        </div>
      </div>

      <div className="subsection">
        <div className="mutedSmall">Warnings</div>
        {warnings.length === 0 ? (
          <div className="ok">No issues detected.</div>
        ) : (
          <ul className="warnList">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
