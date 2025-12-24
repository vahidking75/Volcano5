'use client';

import { useMemo, useState } from 'react';

// Engine
import type { VolcanoModel } from '../../engine/modelProfiles';
import type { LearningMode } from '../../engine/learningModes';
import { LEARNING_MODE } from '../../engine/learningModes';

import type { PromptFields, PromptFieldKey } from '../../engine/promptSchema';
import { DEFAULT_FIELDS } from '../../engine/promptSchema';

import { compileFromFields } from '../../engine/promptCompiler';
import { lintFromFields } from '../../engine/qualityLinter';
import { addSmart } from '../../engine/tokenRouter';

// UI Components (these match what your build log shows you’re using)
import { LearningModeSwitch } from '../../components/LearningModeSwitch';
import { ModeSwitch } from '../../components/ModeSwitch';
import { ProjectBar } from '../../components/ProjectBar';
import { PromptBuilder } from '../../components/PromptBuilder';
import { PromptOutput } from '../../components/PromptOutput';
import { ClarityCheck } from '../../components/ClarityCheck';
import { AssistantPanel } from '../../components/AssistantPanel';
import { OnlineWorkbench } from '../../components/OnlineWorkbench';

export default function StudioPage() {
  const [model, setModel] = useState<VolcanoModel>('chatgpt_image_1_5');
  const [learningMode, setLearningMode] = useState<LearningMode>('beginner');

  const ui = LEARNING_MODE[learningMode];

  const [fields, setFields] = useState<PromptFields>(() => ({
    ...DEFAULT_FIELDS,
    subject: '',
  }));

  const compiled = useMemo(() => compileFromFields(model, fields), [model, fields]);

  const warnings = useMemo(
    () => lintFromFields(model, fields, ui.lintStrictness),
    [model, fields, ui.lintStrictness]
  );

  // ---- Helpers ----

  const setSubject = (v: string) => setFields((prev) => ({ ...prev, subject: v }));

  const addToField = (key: PromptFieldKey, token: string) => {
    const t = (token ?? '').trim
  const [fields, setFields] = useState<PromptFields>(() => ({
    ...DEFAULT_FIELDS,
    subject: '',
  }));

  const ui = LEARNING_MODE[learningMode];

  const compiled = useMemo(() => compileFromFields(model, fields), [model, fields]);

  const warnings = useMemo(
    () => lintFromFields(model, fields, ui.lintStrictness),
    [model, fields, ui.lintStrictness]
  );

  const modelTips = useMemo(() => suggestForModel(model), [model]);

  const missingSuggestions = useMemo(
    () => suggestModifiersFromFields(fields),
    [fields]
  );

  const brain = useMemo(() => {
    return assistantBrain({
      model,
      learningMode,
      fields,
      compiledPrompt: compiled,
      warnings,
    });
  }, [model, learningMode, fields, compiled, warnings]);

  /** Add token using smart routing:
   *  - If hintField is provided and user is NOT beginner, we allow forcing.
   *  - Beginner mode avoids accidental negatives.
   */
  const addAuto = (token: string, hintField?: PromptFieldKey) => {
    const cleaned = (token ?? '').trim();
    if (!cleaned) return;

    // FIX: lintStrictness is string; compare learningMode directly
    const forced = learningMode === 'beginner' ? undefined : hintField;

    setFields((prev) => addSmart(prev, cleaned, forced));
  };

  const removeFromField = (key: PromptFieldKey, idx: number) => {
    setFields((prev) => {
      const next: PromptFields = { ...prev };
      const arr = [...(next[key] as string[])];
      arr.splice(idx, 1);
      (next as any)[key] = arr;
      return next;
    });
  };

  const setSubject = (v: string) => setFields((prev) => ({ ...prev, subject: v }));

  const applyAction = (action: { token: string; target?: PromptFieldKey }) => {
    addAuto(action.token, action.target);
  };

  const autoImprove = () => {
    // Apply top-ranked suggestions from brain in a safe, field-aware way
    brain.nextActions.slice(0, ui.maxSuggestions).forEach((a) => applyAction(a));
  };

  return (
    <main className="studio">
      <header className="topbar">
        <div className="brand">
          <div className="badge">VOLCANO</div>
          <div>
            <div className="title">Virtuoso AI Art Assistant</div>
            <div className="subtitle">AI-level prompt engineering studio</div>
          </div>
        </div>

        <div className="topControls">
          <LearningModeSwitch mode={learningMode} setMode={setLearningMode} />
          <ModeSwitch model={model} setModel={setModel} />
        </div>
      </header>

      <ProjectBar
        model={model}
        learningMode={learningMode}
        fields={fields}
        setFields={setFields}
      />

      <nav className="tabs">
        {([
          ['studio', 'Studio'],
          ['online', 'Online'],
          ['style', 'Style DNA'],
          ['color', 'Color'],
          ['image', 'Image'],
          ['explain', 'Explain'],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            className={activeTab === k ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(k)}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="grid">
        <section className="col main">
          <PromptBuilder
            learningMode={learningMode}
            model={model}
            fields={fields}
            setSubject={setSubject}
            onAddToken={addAuto}
          />

          <PromptPreviewV4
            model={model}
            fields={fields}
            compiled={compiled}
            onRemoveToken={(fieldKey, idx) => removeFromField(fieldKey, idx)}
          />
        </section>

        <aside className="col side">
          <AssistantPanel
            model={model}
            learningMode={learningMode}
            score={brain.score}
            scoreReasons={brain.scoreReasons}
            warnings={warnings}
            modelTips={modelTips}
            missingSuggestions={missingSuggestions}
            nextActions={brain.nextActions}
            onApplyAction={applyAction}
            onAutoImprove={autoImprove}
          />

          {activeTab === 'online' && (
            <OnlineWorkbench
              subject={fields.subject}
              onAdd={(token, hintField) => addAuto(token, hintField)}
            />
          )}

          {activeTab === 'style' && (
            <StyleDNABlender
              onApply={(pack) => {
                pack.core.forEach((t) => addAuto(t, 'style'));
                pack.motifs.forEach((t) => addAuto(t, 'composition'));
                pack.lighting.forEach((t) => addAuto(t, 'lighting'));
                pack.camera.forEach((t) => addAuto(t, 'camera'));
                pack.materials.forEach((t) => addAuto(t, 'materials'));
                pack.colorBias.forEach((t) => addAuto(t, 'color'));
                pack.bridge.forEach((t) => addAuto(t));
              }}
            />
          )}

          {activeTab === 'color' && (
            <ColorIntelligence onAddColorWords={(words) => words.forEach((w) => addAuto(w, 'color'))} />
          )}

          {activeTab === 'image' && (
            <ImageReferenceInput
              onExtract={(info) => {
                info.suggestions.forEach((t) => addAuto(t));
              }}
            />
          )}

          {activeTab === 'explain' &&
            (ui.showExplain ? (
              <ExplainPrompt model={model} fields={fields} compiled={compiled} />
            ) : (
              <div className="card mutedSmall">
                Explain mode is hidden in PRO learning mode. Switch to Beginner/Intermediate.
              </div>
            ))}
        </aside>
      </section>
    </main>
  );
    }
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
