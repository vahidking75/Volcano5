'use client';
import type { VolcanoModel } from '../engine/modelProfiles';

export function ModeSwitch({ model, setModel }: { model: VolcanoModel; setModel: (m: VolcanoModel) => void }) {
  return (
    <div className="seg">
      <button className={model === 'chatgpt_image_1_5' ? 'segBtn active' : 'segBtn'} onClick={() => setModel('chatgpt_image_1_5')}
        title="Natural-language mode">
        Image Gen 1.5
      </button>
      <button className={model === 'nano_banana_pro' ? 'segBtn active' : 'segBtn'} onClick={() => setModel('nano_banana_pro')}
        title="Structured, dense mode">
        Nano Banana Pro
      </button>
    </div>
  );
}
