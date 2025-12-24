'use client';

import type { PromptFields, PromptFieldKey } from '../engine/promptSchema';
import { analyzePrompt } from '../engine/assistantBrain';

function scoreLabel(score: number) {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Okay';
  return 'Needs work';
}

export function AssistantPanel({
  fields,
  onApplyTokens,
  onAutoImprove,
}: {
  fields: PromptFields;
  onApplyTokens: (field: PromptFieldKey, tokens: string[]) => void;
  onAutoImprove: () => void;
}) {
  const { score, issues, actions } = analyzePrompt(fields);

  return (
    <div className="card sticky">
      <div className="rowBetween">
        <div>
          <div className="label">Assistant Brain</div>
          <div className="mutedSmall">
            Score: <b>{score}</b>/100 · {scoreLabel(score)}
          </div>
        </div>
        <button className="btn primary" onClick={onAutoImprove} title="Apply top-ranked improvements">
          Auto-Improve
        </button>
      </div>

      <div className="divider" />

      <div className="label small">What to fix next</div>
      {issues.length === 0 ? (
        <div className="mutedSmall">No major issues detected. Try refining style or mood.</div>
      ) : (
        <ul className="list">
          {issues.slice(0, 6).map((i, idx) => (
            <li key={idx}>
              <span className={i.severity === 3 ? 'sev3' : i.severity === 2 ? 'sev2' : 'sev1'}>
                ●
              </span>{' '}
              {i.message}
            </li>
          ))}
        </ul>
      )}

      <div className="divider" />

      <div className="label small">Ranked actions</div>
      {actions.length === 0 ? (
        <div className="mutedSmall">No actions available.</div>
      ) : (
        <div className="actionList">
          {actions.slice(0, 6).map((a) => (
            <div key={a.id} className="actionCard">
              <div className="actionTop">
                <div className="actionLabel">{a.label}</div>
                <button className="btn" onClick={() => onApplyTokens(a.field, a.tokens)}>
                  Apply
                </button>
              </div>
              <div className="mutedSmall">{a.why}</div>
              <div className="chips subtle">
                {a.tokens.slice(0, 5).map((t) => (
                  <span key={t} className="chip static">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
