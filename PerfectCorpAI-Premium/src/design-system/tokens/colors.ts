export const colors = {
  primary: {
    50: '#FFF3E6',
    100: '#FFE6CC',
    200: '#FFD1A3',
    300: '#FFB870',
    400: '#FF9A3D',
    500: '#FF6B2C',
    600: '#E85A1F',
    700: '#C94716',
    800: '#A63A12',
    900: '#7E2A0E'
  },
  secondary: {
    50: '#E7ECF6',
    100: '#CFD8EA',
    200: '#AABBD6',
    300: '#869FC2',
    400: '#5E7AA8',
    500: '#2D3A50',
    600: '#233044',
    700: '#1A2638',
    800: '#131C2B',
    900: '#0D1520'
  },
  accent: {
    50: '#FFF7E0',
    100: '#FFEAB3',
    200: '#FFD980',
    300: '#FFC34D',
    400: '#FFB523',
    500: '#FFB800',
    600: '#E4A600',
    700: '#C08D00',
    800: '#9A7200',
    900: '#6B4F00'
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#EEF2F7',
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
    primary: '#F8FAFC',
    secondary: '#EEF2F7',
    tertiary: '#E3E8EF',
    dark: '#0F1419',
    card: '#FFFFFF',
    elevated: '#FFFFFF'
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    medium: 'rgba(255, 255, 255, 0.5)',
    dark: 'rgba(255, 255, 255, 0.25)',
    darkMode: 'rgba(0, 0, 0, 0.3)'
  },
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.7)'
  }
};

export type ColorToken = typeof colors;
