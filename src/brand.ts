import type { Brand } from '@/kit/theme';

export const brand: Brand = {
  slug: 'loopday',
  name: 'LoopDay',
  tagline: 'Tiny habits that forgive you',
  fonts: { display: 'Fredoka_600SemiBold' },
  defaultTheme: 'orange',
  radius: 22,
  light: {
    bg: '#FFF7EF',
    surface: '#FFFFFF',
    surfaceAlt: '#FCE9D8',
    text: '#22150C',
    textMuted: '#6B5646',
    border: '#F1D9C2',
    primary: '#C2410C',
    primaryText: '#FFFFFF',
    accent: '#FFB703',
    accentText: '#22150C',
    success: '#2F7D32',
    warning: '#9A5B00',
    danger: '#B3261E',
    focus: '#C2410C',
  },
  dark: {
    bg: '#18110C',
    surface: '#231912',
    surfaceAlt: '#33251A',
    text: '#FBEFE4',
    textMuted: '#C2AE9C',
    border: '#3E2D20',
    primary: '#FF8A4C',
    primaryText: '#1A0F08',
    accent: '#FFB703',
    accentText: '#22150C',
    success: '#7BD88F',
    warning: '#F3B44C',
    danger: '#FF8A80',
    focus: '#FF8A4C',
  },
  premiumPerks: ['Up to 10 habits (free has 3)', 'Full stats and the year heatmap', 'Themes and home-screen widgets as they launch', 'No ads, ever'],
  privacyUrl: 'https://kaoticchainz.com/privacy',
  termsUrl: 'https://kaoticchainz.com/terms',
  supportEmail: 'hello@kaoticchainz.com',
};

export const FREE_HABITS = 3;
export const MAX_HABITS = 10;
