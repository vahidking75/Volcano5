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

export default function StudioPage(): JSX.Element {
  const [model, setModel] = useState<VolcanoModel>('chatgpt_image_1_5');
  const [learningMode, setLearningMode] = useState<LearningMode>('beginner');
  const [fields, setFields] = useState<PromptFields>(EMPTY_FIELDS);

  const ui = LEARNING_MODE[learningMode];

  const compiled = useMemo(() => {
    return compileFromFields(model, fields);
  }, [model, fields]);

  const brain = useMemo(() => {
    return analyzePrompt(fields);
  }, [fields]);

  const setSubject = (s: string) => {
    setFields((prev) => ({ ...prev, subject: s }));
  };

  const addToField = (k: PromptFieldKey, t: string) => {
    const token = (t ?? '').trim();
    if (!token) return;
    setFields((prev) => addSmart(prev, token, k));
  };

  const removeFromField = (k: PromptFieldKey, idx: number) => {
    setFields((prev) => {
      const next: any = { ...prev };
      next[k] = (prev as any)[k].filter((_: any, i: number) => i !== idx);
      return next as PromptFields;
    });
  };

  const addAuto = (token: string, hintField?: PromptFieldKey) => {
    const t = (token ?? '').trim();
    if (!t) return;

    // Beginner mode: avoid implicitly forcing negatives
    const forced = learningMode === 'beginner' ? undefined : hintField;

    setFields((prev) => addSmart(prev, t, forced));
  };

  const applyTokens = (k: PromptFieldKey, tokens: string[]) => {
    tokens.forEach((t) => addToField(k, t));
  };

  const autoImprove = () => {
    const top = (brain.actions ?? []).slice(0, 3);
    top.forEach((a: any) => {
      applyTokens(a.field as PromptFieldKey, a.tokens as string[]);
    });

    if (learningMode === 'beginner' && fields.negative.length === 0) {
      ['blurry', 'low quality', 'watermark', 'text', 'extra fingers'].forEach((n) =>
        addToField('negative', n)
      );
    }
  };

  // Optional: expose compiled prompt for other components if they read it
  if (typeof window !== 'undefined') {
    (window as any).__VOLCANO_COMPILED_PROMPT__ = compiled;
  }

  return (
    <main className="studioShell">
      <header className="topbar">
        <div className="brand">
          <div className="badge">VOLCANO</div>
          <div>
            <div className="title">Virtuoso Prompt Studio</div>
            <div className="subtitle">
              AI-level prompt engineering for Image Gen 1.5 + Nano Banana Pro
            </div>
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
            onLoad={(f: PromptFields) => setFields(f)}
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
          <AssistantPanel fields={fields} onApplyTokens={applyTokens} onAutoImprove={autoImprove} />
          <OnlineWorkbench onAdd={addAuto} />
        </aside>
      </section>
    </main>
  );
    }
