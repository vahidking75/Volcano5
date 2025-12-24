export type StyleDNA = {
  name: string;
  core: string[];
  motifs: string[];
  materials: string[];
  lighting: string[];
  camera: string[];
  colorBias: string[];
};

export const STYLE_LIBRARY: StyleDNA[] = [
  {
    name: 'Cyberpunk',
    core: ['neon', 'high-tech', 'dystopian', 'rain-slick streets'],
    motifs: ['holograms', 'kanji signage', 'megacity skyline'],
    materials: ['chrome', 'glass', 'wet asphalt'],
    lighting: ['neon rim light', 'volumetric haze'],
    camera: ['wide angle', 'low angle'],
    colorBias: ['magenta', 'cyan', 'electric blue'],
  },
  {
    name: 'Baroque',
    core: ['dramatic', 'ornate', 'high contrast', 'classical'],
    motifs: ['gold filigree', 'rich fabric folds'],
    materials: ['oil paint texture', 'gilded surfaces'],
    lighting: ['chiaroscuro', 'rembrandt lighting'],
    camera: ['portrait framing', 'shallow depth of field'],
    colorBias: ['warm gold', 'deep crimson', 'shadowy brown'],
  },
  {
    name: 'Ukiyo-e',
    core: ['woodblock print', 'flat perspective', 'bold outlines'],
    motifs: ['wave patterns', 'kimono fabric', 'paper texture'],
    materials: ['ink', 'rice paper'],
    lighting: ['even light'],
    camera: ['isometric-like framing'],
    colorBias: ['indigo', 'vermillion', 'cream'],
  },
  {
    name: 'Studio Ghibli',
    core: ['whimsical', 'hand-painted', 'warm'],
    motifs: ['lush backgrounds', 'soft clouds', 'cozy interiors'],
    materials: ['watercolor texture', 'soft shading'],
    lighting: ['golden hour', 'soft ambient light'],
    camera: ['wide establishing shot'],
    colorBias: ['pastel greens', 'warm oranges', 'sky blue'],
  }
];
