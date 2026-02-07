export type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  orange: string;
  orangeLight: string;
  yellow: string;
  background: string;
  backgroundDark: string;
  surface: string;
  surfaceDark: string;
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    muted: string;
  };
  success: string;
  warning: string;
  error: string;
  border: string;
  borderOrange: string;
};

export type Typography = {
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeights: {
    regular: "400" | "normal";
    medium: "500";
    semibold: "600";
    bold: "700" | "bold";
  };
  lineHeights: {
    tight: number;
    regular: number;
    relaxed: number;
  };
};

export type Spacing = {
  scale: {
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    8: number;
    10: number;
    12: number;
    16: number;
    20: number;
    24: number;
    32: number;
    40: number;
    48: number;
  };
};

export type Radius = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
};

export type Shadow = {
  level0: {
    elevation: number;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
  };
  level1: {
    elevation: number;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
  };
  level2: {
    elevation: number;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
  };
};

export type Animation = {
  durations: {
    fast: number;
    medium: number;
    slow: number;
  };
};

export type AppTheme = {
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadow: Shadow;
  animation: Animation;
};

// Reference: dark blue/charcoal, bright orange, yellow gradient, white/light grey
export const theme: AppTheme = {
  colors: {
    primary: "#1E2A3B",
    secondary: "#2D3E50",
    accent: "#FFFFFF",
    orange: "#FF6B35",
    orangeLight: "#FF8C5A",
    yellow: "#FFB347",
    background: "#F5F6F8",
    backgroundDark: "#1A2332",
    surface: "#FFFFFF",
    surfaceDark: "#16202D",
    text: {
      primary: "#1E2A3B",
      secondary: "#5A6578",
      inverse: "#FFFFFF",
      muted: "#8B95A5",
    },
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    border: "#2D3E50",
    borderOrange: "#FF6B35",
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
    fontWeights: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeights: {
      tight: 1.2,
      regular: 1.4,
      relaxed: 1.6,
    },
  },
  spacing: {
    scale: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      8: 32,
      10: 40,
      12: 48,
      16: 64,
      20: 80,
      24: 96,
      32: 128,
      40: 160,
      48: 192,
    },
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
  },
  shadow: {
    level0: {
      elevation: 0,
      shadowColor: "#000000",
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    level1: {
      elevation: 2,
      shadowColor: "#000000",
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    level2: {
      elevation: 6,
      shadowColor: "#000000",
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
  },
  animation: {
    durations: {
      fast: 200,
      medium: 350,
      slow: 500,
    },
  },
};
