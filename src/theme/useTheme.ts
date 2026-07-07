import { useAuth } from '../store';

interface ThemeTokens {
  bg: string;
  bgCard: string;
  bgItem: string;
  bgElevated: string;
  bgIcon: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  divider: string;
  border: string;
  borderMedium: string;
  glass: string;
  glassMedium: string;
  tabInactive: string;
}

export const themeTokens: Record<'dark' | 'light', ThemeTokens> = {
  dark: {
    bg: '#000000',
    bgCard: '#0C0C0C',
    bgItem: '#121212',
    bgElevated: '#1C2130',
    bgIcon: '#1A1A1A',
    accent: '#E43414',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textMuted: '#A0A0A0',
    divider: '#222222',
    border: 'rgba(255,255,255,0.07)',
    borderMedium: 'rgba(255,255,255,0.12)',
    glass: 'rgba(255,255,255,0.04)',
    glassMedium: 'rgba(255,255,255,0.07)',
    tabInactive: 'rgba(255,255,255,0.4)',
  },
  light: {
    bg: '#F9F8F3',
    bgCard: '#FFFFFF',
    bgItem: '#F0EDE4',
    bgElevated: '#E8E4DA',
    bgIcon: '#E5E0D5',
    accent: '#E43414',
    textPrimary: '#000000',
    textSecondary: '#444444',
    textMuted: '#606060',
    divider: '#E5E0D5',
    border: '#E5E0D5',
    borderMedium: '#D5D0C5',
    glass: 'rgba(0,0,0,0.03)',
    glassMedium: 'rgba(0,0,0,0.06)',
    tabInactive: 'rgba(0,0,0,0.4)',
  },
};

export const useTheme = (): ThemeTokens => {
  const theme = useAuth((s) => s.theme);
  return themeTokens[theme];
};
