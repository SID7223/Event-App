export const colors = {
  background: {
    primary: '#000000',
    secondary: '#12161D',
    card: '#161B24',
    elevated: '#1C2130',
  },
  gradient: {
    primary: ['#FF6B4A', '#E43414'] as const,
    cyan: ['#FF6B4A', '#E43414'] as const,
    orange: ['#E43414', '#E43414'] as const,
    dark: ['#12161D', '#000000'] as const,
    card: ['rgba(22,27,36,0.95)', 'rgba(22,27,36,0.7)'] as const,
  },
  accent: {
    cyan: '#FF6B4A',
    candyBlue: '#E43414',
    orange: '#E43414',
    orangeLight: '#FF6B4A',
    blue: '#E43414',
    red: '#E43414',
    green: '#2ED573',
    purple: '#A855F7',
    pink: '#EC4899',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.65)',
    muted: 'rgba(255,255,255,0.45)',
    inverse: '#000000',
  },
  border: {
    light: 'rgba(255,255,255,0.07)',
    medium: 'rgba(255,255,255,0.12)',
    focus: 'rgba(255,107,74,0.5)',
  },
  glass: {
    light: 'rgba(255,255,255,0.04)',
    medium: 'rgba(255,255,255,0.07)',
    heavy: 'rgba(255,255,255,0.11)',
  },
  overlay: {
    dark: 'rgba(0,0,0,0.7)',
    medium: 'rgba(0,0,0,0.45)',
    light: 'rgba(0,0,0,0.25)',
  },
  tab: {
    active: '#E43414',
    activeExplore: '#FF6B4A',
    inactive: 'rgba(255,255,255,0.4)',
  },
  status: {
    confirmed: '#FF6B4A',
    interested: '#E43414',
    past: 'rgba(255,255,255,0.4)',
  },
} as const;

export type ColorKeys = typeof colors;
