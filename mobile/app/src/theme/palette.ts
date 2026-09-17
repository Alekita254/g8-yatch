export type ColorMode = 'light' | 'dark';

export interface AppPalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandSoft: string;
  chipText: string;
  success: string;
  danger: string;
}

const lightPalette: AppPalette = {
  background: '#F6FAF8',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F6F3',
  border: '#E0EBE5',
  textPrimary: '#15243A',
  textSecondary: '#5D7285',
  textMuted: '#8A9EAF',
  brand: '#1E8A63',
  brandSoft: '#E8F3ED',
  chipText: '#2C435A',
  success: '#1F925E',
  danger: '#D05248',
};

const darkPalette: AppPalette = {
  background: '#08141C',
  surface: '#0F212D',
  surfaceMuted: '#132A37',
  border: '#1E3B4E',
  textPrimary: '#F2F8FD',
  textSecondary: '#B6CAD8',
  textMuted: '#8CA2B5',
  brand: '#2AA875',
  brandSoft: '#123326',
  chipText: '#D7E8F3',
  success: '#32BA7A',
  danger: '#FF7267',
};

export function getPalette(mode: ColorMode): AppPalette {
  return mode === 'dark' ? darkPalette : lightPalette;
}
