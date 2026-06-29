export const colors = {
  background: {
    primary: '#0A0C12',
    secondary: '#12161D',
    card: '#161B24',
    elevated: '#1C2130',
  },
  gradient: {
    primary: ['#99E1D9', '#E43414'] as const,
    cyan: ['#99E1D9', '#B2D5E5'] as const,
    orange: ['#E43414', '#E43414'] as const,
    dark: ['#12161D', '#0A0C12'] as const,
    card: ['rgba(22,27,36,0.95)', 'rgba(22,27,36,0.7)'] as const,
  },
  accent: {
    cyan: '#99E1D9',
    candyBlue: '#B2D5E5',
    orange: '#E43414',
    orangeLight: '#E43414',
    blue: '#B2D5E5',
    red: '#E43414',
    green: '#2ED573',
    purple: '#A855F7',
    pink: '#EC4899',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.65)',
    muted: 'rgba(255,255,255,0.45)',
    inverse: '#0A0C12',
  },
  border: {
    light: 'rgba(255,255,255,0.07)',
    medium: 'rgba(255,255,255,0.12)',
    focus: 'rgba(153,225,217,0.5)',
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
    activeExplore: '#78a7adff',
    inactive: 'rgba(255,255,255,0.4)',
  },
  status: {
    confirmed: '#99E1D9',
    interested: '#E43414',
    past: 'rgba(255,255,255,0.4)',
  },
} as const;

export type ColorKeys = typeof colors;
