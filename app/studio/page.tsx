'use client';

import { useMemo, useState } from 'react';

import type { VolcanoModel } from '../../engine/modelProfiles';
import type { LearningMode } from '../../engine/learningModes';
import { LEARNING_MODE } from '../../engine/learningModes';

import type { PromptFields, PromptFieldKey } from '../../engine/promptSchema';
import { DEFAULT_FIELDS } from '../../engine/promptSchema';

import { compileFromFields } from '../../engine/promptCompiler';
import { lintFromFields } from '../../engine/qualityLinter';
import { suggestForModel } from '../../engine/modelAdvisor';
import { suggestModifiersFromFields } from '../../engine/modifierSuggester';
import { assistantBrain } from '../../engine/assistantBrain';
import { addSmart } from '../../engine/tokenRouter';

import { LearningModeSwitch } from '../../components/LearningModeSwitch';
import { ModeSwitch } from '../../components/ModeSwitch';
import { PromptBuilder } from '../../components/PromptBuilder';
import { PromptPreviewV4 } from '../../components/PromptPreviewV4';
import { AssistantPanel } from '../../components/AssistantPanel';
import { OnlineWorkbench } from '../../components/OnlineWorkbench';
import { StyleDNABlender } from '../../components/StyleDNABlender';
import { ColorIntelligence } from '../../components/ColorIntelligence';
import { ImageReferenceInput } from '../../components/ImageReferenceInput';
import { ExplainPrompt } from '../../components/ExplainPrompt';
import { ProjectBar } from '../../components/ProjectBar';

type TabKey = 'online' | 'style' | 'color' | 'image' | 'explain';

export default function StudioPage() {
  const [model, setModel] = useState<VolcanoModel>('chatgpt_image_1_5');
  const [learningMode, setLearningMode] = useState<LearningMode>('beginner');
  const [activeTab, setActiveTab] = useState<TabKey>('online');

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

  const missingSuggestions = useMemo(() => suggestModifiersFromFields(fields), [fields]);

  const brain = useMemo(() => {
    return assistantBrain({
      model,
      learningMode,
      fields,
      compiledPrompt: compiled,
      warnings,
    });
  }, [model, learningMode, fields, compiled, warnings]);

  const setSubject = (v: string) => setFields((prev) => ({ ...prev, subject: v }));

  // Smart routing add
  const addAuto = (token: string, hintField?: PromptFieldKey) => {
    const cleaned = (token ?? '').trim();
    if (!cleaned) return;

    // Beginner mode: do not force negatives implicitly
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

  const applyAction = (action: { token: string; target?: PromptFieldKey }) => {
    addAuto(action.token, action.target);
  };

  const autoImprove = () => {
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

      <ProjectBar model={model} learningMode={learningMode} fields={fields} setFields={setFields} />

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
          <div className="tabs mini">
            {([
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
          </div>

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
            <OnlineWorkbench subject={fields.subject} onAdd={(token, hint) => addAuto(token, hint)} />
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
            <ImageReferenceInput onExtract={(info) => info.suggestions.forEach((t) => addAuto(t))} />
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
