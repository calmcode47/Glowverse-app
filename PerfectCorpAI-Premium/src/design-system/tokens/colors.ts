export const colors = {
  primary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87'
  },
  secondary: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337'
  },
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    1000: '#000000'
  },
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#065F46'
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#92400E'
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#991B1B'
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1E40AF'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    dark: '#0F0F0F',
    card: '#FFFFFF',
    elevated: '#FFFFFF'
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    medium: 'rgba(255, 255, 255, 0.5)',
    dark: 'rgba(255, 255, 255, 0.3)',
    darkMode: 'rgba(0, 0, 0, 0.3)'
  },
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.7)'
  }
};

export type ColorToken = typeof colors;
