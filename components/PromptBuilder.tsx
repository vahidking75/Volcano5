'use client';

import type { PromptFields, PromptFieldKey } from '../engine/promptSchema';
import { ChipField } from './ChipField';

const QUICK = {
  composition: ['rule of thirds', 'foreground subject, background context', 'leading lines'],
  camera: ['35mm lens', 'shallow depth of field', 'eye-level shot'],
  lighting: ['soft diffused key light', 'rim light', 'volumetric haze'],
  style: ['cinematic', 'photoreal', 'high detail'],
  mood: ['moody', 'dreamy', 'epic'],
  color: ['muted palette', 'warm tones', 'cool tones'],
  constraints: ['no watermark', 'no gibberish text', 'clean background'],
  negative: ['blurry', 'low quality', 'watermark', 'text', 'extra fingers'],
} satisfies Partial<Record<PromptFieldKey, string[]>>;

export function PromptBuilder({
  fields,
  setSubject,
  addToField,
  removeFromField,
}: {
  fields: PromptFields;
  setSubject: (s: string) => void;
  addToField: (k: PromptFieldKey, t: string) => void;
  removeFromField: (k: PromptFieldKey, idx: number) => void;
}) {
  return (
    <div className="card">
      <div className="label">Prompt Builder</div>

      <div className="field">
        <div className="fieldHeader">
          <div className="fieldLabel">Subject</div>
        </div>
        <textarea
          className="textarea"
          value={fields.subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What are we generating? Include key attributes, setting, and the core idea."
        />
        <div className="mutedSmall">
          Tip: write one strong sentence (who/what + where + vibe), then let the assistant fill gaps.
        </div>
      </div>

      <ChipField
        label="Composition"
        items={fields.composition}
        onAdd={(t) => addToField('composition', t)}
        onRemove={(i) => removeFromField('composition', i)}
        suggested={QUICK.composition}
      />

      <ChipField
        label="Camera"
        items={fields.camera}
        onAdd={(t) => addToField('camera', t)}
        onRemove={(i) => removeFromField('camera', i)}
        suggested={QUICK.camera}
      />

      <ChipField
        label="Lighting"
        items={fields.lighting}
        onAdd={(t) => addToField('lighting', t)}
        onRemove={(i) => removeFromField('lighting', i)}
        suggested={QUICK.lighting}
      />

      <ChipField
        label="Materials"
        items={fields.materials}
        onAdd={(t) => addToField('materials', t)}
        onRemove={(i) => removeFromField('materials', i)}
        suggested={['micro-detail', 'realistic texture', 'subsurface scattering']}
      />

      <ChipField
        label="Style DNA"
        items={fields.style}
        onAdd={(t) => addToField('style', t)}
        onRemove={(i) => removeFromField('style', i)}
        suggested={QUICK.style}
      />

      <ChipField
        label="Mood"
        items={fields.mood}
        onAdd={(t) => addToField('mood', t)}
        onRemove={(i) => removeFromField('mood', i)}
        suggested={QUICK.mood}
      />

      <ChipField
        label="Color"
        items={fields.color}
        onAdd={(t) => addToField('color', t)}
        onRemove={(i) => removeFromField('color', i)}
        suggested={QUICK.color}
      />

      <ChipField
        label="Render"
        items={fields.render}
        onAdd={(t) => addToField('render', t)}
        onRemove={(i) => removeFromField('render', i)}
        suggested={['photoreal', 'film grain', 'HDR']}
      />

      <ChipField
        label="Constraints"
        items={fields.constraints}
        onAdd={(t) => addToField('constraints', t)}
        onRemove={(i) => removeFromField('constraints', i)}
        suggested={QUICK.constraints}
      />

      <ChipField
        label="Negative"
        items={fields.negative}
        onAdd={(t) => addToField('negative', t)}
        onRemove={(i) => removeFromField('negative', i)}
        suggested={QUICK.negative}
      />
    </div>
  );
}
