import { colors } from './tokens/colors';
import { gradients } from './tokens/gradients';
import { typography } from './tokens/typography';
import { spacing, borderRadius } from './tokens/spacing';
import { shadows } from './tokens/shadows';
import { animations } from './tokens/animations';

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints: {
    phone: 0,
    tablet: 768,
    desktop: 1024
  },
  dimensions: {
    tabBarHeight: 60,
    headerHeight: 56,
    buttonHeight: {
      small: 32,
      medium: 44,
      large: 56
    },
    inputHeight: {
      small: 36,
      medium: 44,
      large: 52
    },
    iconSize: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
      '2xl': 48
    }
  },
  zIndex: {
    background: -1,
    normal: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  }
};

export type Theme = typeof theme;

export const darkTheme: Theme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      primary: '#0F1419',
      secondary: '#1A1F3A',
      tertiary: '#2D3250',
      dark: '#000000',
      card: '#1A1F3A',
      elevated: '#2D3250'
    }
  }
};
