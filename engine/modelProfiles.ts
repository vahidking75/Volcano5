export type VolcanoModel = 'chatgpt_image_1_5' | 'nano_banana_pro';

export const MODEL_PROFILES = {
  chatgpt_image_1_5: {
    style: 'descriptive',
    supportsNegative: false,
    prefersSentences: true,
  },
  nano_banana_pro: {
    style: 'structured',
    supportsNegative: true,
    prefersSentences: false,
  }
} as const;
