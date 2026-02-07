export const typography = {
  fonts: {
    primary: 'System',
    heading: 'System',
    mono: 'Courier'
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72
  },
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1
  },
  styles: {
    h1: {
      fontSize: 48,
      fontWeight: '700',
      lineHeight: 1.2,
      letterSpacing: -0.5
    },
    h2: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.3,
      letterSpacing: -0.25
    },
    h3: {
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 1.4,
      letterSpacing: 0
    },
    h4: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.4
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.5
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.5,
      letterSpacing: 0.5
    }
  }
};

export type TypographyToken = typeof typography;
