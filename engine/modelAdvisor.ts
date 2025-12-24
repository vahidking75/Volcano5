import type { VolcanoModel } from './modelProfiles';

export function suggestForModel(model: VolcanoModel) {
  if (model === 'nano_banana_pro') {
    return [
      'cinematic lighting',
      'ultra-detailed textures',
      '35mm lens',
      'depth of field',
      'material realism',
      'atmospheric haze'
    ];
  }

  return [
    'describe mood in sentences',
    'include environment details',
    'mention lighting (golden hour / softbox)',
    'camera viewpoint (close-up / wide)',
    'key textures and materials'
  ];
}
