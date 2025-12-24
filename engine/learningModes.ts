export type LearningMode = 'beginner' | 'intermediate' | 'pro';

export const LEARNING_MODE = {
  beginner: {
    showExplain: true,
    showGlossary: true,
    maxSuggestions: 6,
    lintStrictness: 'high',
    uiDensity: 'low',
  },
  intermediate: {
    showExplain: true,
    showGlossary: true,
    maxSuggestions: 10,
    lintStrictness: 'medium',
    uiDensity: 'medium',
  },
  pro: {
    showExplain: false,
    showGlossary: true,
    maxSuggestions: 16,
    lintStrictness: 'low',
    uiDensity: 'high',
  }
} as const;
