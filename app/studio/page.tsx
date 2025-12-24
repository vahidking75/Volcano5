'use client';

import { useMemo, useState } from 'react';

import { LearningModeSwitch } from '../../components/LearningModeSwitch';
import { ModeSwitch } from '../../components/ModeSwitch';
import { PromptBuilder } from '../../components/PromptBuilder';
import { AssistantPanel } from '../../components/AssistantPanel';
import { OnlineWorkbench } from '../../components/OnlineWorkbench';
import { PromptOutput } from '../../components/PromptOutput';
import { ClarityCheck } from '../../components/ClarityCheck';
import { ProjectBar } from '../../components/ProjectBar';

import type { VolcanoModel } from '../../engine/modelProfiles';
import type { LearningMode } from '../../engine/learningModes';
import { LEARNING_MODE } from '../../engine/learningModes';

import { EMPTY_FIELDS, type PromptFields, type PromptFieldKey } from '../../engine/promptSchema';
import { addSmart } from '../../engine/tokenRouter';
import { analyzePrompt } from '../../engine/assistantBrain';
import { compileFromFields } from '../../engine/promptCompiler';

export default function StudioPage() {
  const [model, setModel] = useState<VolcanoModel>('chatgpt_image_1_5');
  const [learningMode, setLearningMode] = useState<LearningMode>('beginner');
  const [fields, setFields] = useState<PromptFields>(EMPTY_FIELDS);

  const ui = LEARNING_MODE[learningMode];

  const compiled = useMemo(() => compileFromFields(model, fields), [model, fields]);
  // expose compiled for project version saving
  if (typeof window !== 'undefined') (window as any).__VOLCANO_COMPILED_PROMPT__ = compiled;

  const brain = useMemo(() => analyzePrompt(fields), [fields]);

  const setSubject = (s: string) => setFields((prev) => ({ ...prev, subject: s }));

  const addToField = (k: PromptFieldKey, t: string) => {
    setFields((prev) => addSmart(prev, t, k));
  };

  const removeFromField = (k: PromptFieldKey, idx: number) => {
    setFields((prev) => {
      const next = { ...prev } as any;
      next[k] = (prev as any)[k].filter((_: any, i: number) => i !== idx);
      return next;
    });
  };

  const addAuto = (token: string, hintField?: PromptFieldKey) => {
    // For beginner mode, keep "negative" explicit (avoid accidental negatives)
    const forced = ui.lintStrictness >= 2 ? hintField : undefined;
    setFields((prev) => addSmart(prev, token, forced));
  };

  const applyTokens = (k: PromptFieldKey, tokens: string[]) => {
    tokens.forEach((t) => addToField(k, t));
  };

  const autoImprove = () => {
    const top = brain.actions.slice(0, 3);
    top.forEach((a) => applyTokens(a.field, a.tokens));
    // add baseline negative pack for beginners
    if (learningMode === 'beginner' && fields.negative.length === 0) {
      ['blurry', 'low quality', 'watermark', 'text', 'extra fingers'].forEach((n) => addToField('negative', n));
    }
  };

  return (
    <main className="studioShell">
      <header className="topbar">
        <div className="brand">
          <div className="badge">VOLCANO</div>
          <div>
            <div className="title">Virtuoso Prompt Studio</div>
            <div className="subtitle">AI-level prompt engineering for Image Gen 1.5 + Nano Banana Pro</div>
          </div>
        </div>
        <div className="topControls">
          <LearningModeSwitch mode={learningMode} setMode={setLearningMode} />
          <ModeSwitch model={model} setModel={setModel} />
        </div>
      </header>

      <section className="studioGrid">
        <section className="col left">
          <ProjectBar
            fields={fields}
            onLoad={(f) => setFields(f)}
            onSavedVersion={() => {}}
          />

          <PromptBuilder
            fields={fields}
            setSubject={setSubject}
            addToField={addToField}
            removeFromField={removeFromField}
          />
        </section>

        <section className="col mid">
          <PromptOutput model={model} compiled={compiled} />
          <ClarityCheck text={compiled} />
        </section>

        <aside className="col right">
          <AssistantPanel
            fields={fields}
            onApplyTokens={applyTokens}
            onAutoImprove={autoImprove}
          />
          <OnlineWorkbench onAdd={addAuto} />
        </aside>
      </section>
    </main>
  );
}
