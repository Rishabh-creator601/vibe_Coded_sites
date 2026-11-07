import type { Metadata } from 'next';

export type ThemeInfo = {
  slug: string;
  name: string;
  blurb: string;
  /** Background, accent and text colours, for the theme list and the gallery. */
  light: [string, string, string];
  dark: [string, string, string];
};

export const THEMES: ThemeInfo[] = [
  { slug: 'night-chart', name: 'Night Chart', blurb: 'A star atlas of the hours before dawn', light: ['#E4E8F7', '#B8660A', '#1B2260'], dark: ['#12163A', '#F5B84B', '#F2EDD7'] },
  { slug: 'meter-kaapi', name: 'Meter Kaapi', blurb: 'A hand-painted darshini signboard', light: ['#F6C22D', '#D32F2B', '#0B3B32'], dark: ['#07332C', '#FFD23F', '#FFF4C9'] },
  { slug: 'riso-zine', name: 'Riso Zine', blurb: 'A two-ink misprinted zine', light: ['#E9EBE6', '#FF4C8B', '#1F2A8C'], dark: ['#16173B', '#FF5C97', '#F4F4FF'] },
  { slug: 'departures', name: 'Departures', blurb: 'A station board where coffees depart', light: ['#FFCE1F', '#141414', '#141414'], dark: ['#0A1E3A', '#FFC53D', '#F4F6F8'] },
  { slug: 'cupping-notes', name: 'Cupping Notes', blurb: "The roaster's working notebook", light: ['#F0F4F7', '#D8342C', '#1D3FA8'], dark: ['#23302E', '#F4D35E', '#F4D35E'] },
  { slug: 'marine-drive', name: 'Marine Drive', blurb: 'Bombay art deco cinema', light: ['#F4CFC0', '#0F6B6B', '#143F40'], dark: ['#06363B', '#D9AE55', '#F7DDD0'] },
  { slug: 'supergraphic', name: 'Supergraphic', blurb: '1970s stripes on a hi-fi sleeve', light: ['#FCE9B2', '#E4572E', '#3A1F12'], dark: ['#2A1420', '#FF7A4D', '#FCE9B2'] },
  { slug: 'receipt', name: 'Receipt', blurb: 'The page is a long thermal receipt', light: ['#1D3FD1', '#FAFAF5', '#FAFAF5'], dark: ['#0B1438', '#1A1D2B', '#E8ECEF'] },
  { slug: 'herbarium', name: 'Herbarium', blurb: 'Pressed specimens on botanical sheets', light: ['#DCE6D2', '#B3123A', '#1E3A2A'], dark: ['#10261C', '#F0527A', '#DDE8D2'] },
  { slug: 'kissa', name: 'Kissa', blurb: 'A quiet cafe with almost no decoration', light: ['#DEDCD6', '#A8321F', '#1C2230'], dark: ['#1C1F24', '#BFA968', '#D8D6CE'] },
];

export type ThemeCategory = { id: string; name: string; description: string; slugs: string[] };

export const CATEGORIES: ThemeCategory[] = [
  { id: 'paper', name: 'Paper and print', description: 'Zines, notebooks and receipts', slugs: ['riso-zine', 'cupping-notes', 'receipt'] },
  { id: 'retro', name: 'Bold and retro', description: 'Painted signs, deco cinemas and 1970s stripes', slugs: ['meter-kaapi', 'marine-drive', 'supergraphic'] },
  { id: 'signs', name: 'Maps and signs', description: 'Star charts and station boards', slugs: ['night-chart', 'departures'] },
  { id: 'calm', name: 'Calm and natural', description: 'Pressed plants and quiet rooms', slugs: ['herbarium', 'kissa'] },
];

export const MODE_COOKIE = 'oh-mode';

export function themeMetadata(slug: string): Metadata {
  const position = THEMES.findIndex((theme) => theme.slug === slug);
  const theme = THEMES[position];
  return {
    title: `Odd Hour Coffee Roasters, theme ${position + 1}: ${theme.name}`,
    description: 'Small-batch Indian coffee, roasted in Bengaluru every Tuesday at 4 a.m.',
  };
}
