'use client';
import type { VolcanoModel } from '../engine/modelProfiles';
import { explainPrompt } from '../engine/explainPrompt';

export function ExplainPrompt({ model, subject, descriptors, negative }: { model: VolcanoModel; subject: string; descriptors: string[]; negative: string[] }) {
  const explanation = explainPrompt({ model, subject, descriptors, negative });
  return (
    <div className="card">
      <div className="rowBetween">
        <h3>Explain this prompt</h3>
        <span className="mutedSmall">Volcano explains what each part does</span>
      </div>
      <div className="subsection">
        <div className="mutedSmall">Subject</div>
        <div className="textBlock">{explanation.subject}</div>
      </div>
      <div className="subsection">
        <div className="mutedSmall">Descriptors</div>
        <ul className="list">
          {explanation.descriptors.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>
      {explanation.negative.length ? (
        <div className="subsection">
          <div className="mutedSmall">Negative / constraints</div>
          <ul className="list">
            {explanation.negative.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="subsection">
        <div className="mutedSmall">Model guidance</div>
        <div className="textBlock">{explanation.modelNote}</div>
      </div>
    </div>
  );
}
