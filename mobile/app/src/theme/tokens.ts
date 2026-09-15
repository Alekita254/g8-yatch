export const Colors = {
  appBackground: '#08161A',
  surface: '#10252B',
  surfaceStrong: '#13313A',
  border: '#1F4954',
  borderStrong: '#2C606D',
  textPrimary: '#F8FBF8',
  textSecondary: '#D9E8DF',
  textMuted: '#ADC6BA',
  brandHighlight: '#EAC57A',
  brandSoft: '#F6E8C3',
  brandText: '#132227',
  success: '#0F7A63',
  warning: '#8A6728',
  danger: '#A14334',
  cardBackground: '#10252B',
  cardBorder: '#1F4954',
  title: '#F8FBF8',
  subtitle: '#D9E8DF',
  body: '#D9E8DF',
  accent: '#EAC57A',
  online: '#0F7A63',
  sync: '#8A6728',
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const Typography = {
  caption: 11,
  label: 12,
  body: 15,
  bodyLineHeight: 22,
  title: 20,
  h1: 30,
  weightMedium: '500',
  weightSemiBold: '600',
  weightBold: '700',
  weightExtraBold: '800',
} as const;

export const Shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;
