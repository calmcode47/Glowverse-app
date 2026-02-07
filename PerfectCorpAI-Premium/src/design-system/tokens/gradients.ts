export const gradients = {
  primary: {
    default: ['#FF6B2C', '#FFB800'],
    soft: ['#FFF3E6', '#FFE6CC'],
    vibrant: ['#FF6B2C', '#FF8C2F'],
    shimmer: ['#FF6B2C', '#FFB800', '#FFD180']
  },
  secondary: {
    default: ['#2D3A50', '#1A1F3A']
  },
  accent: {
    default: ['#FFB800', '#FFD180']
  },
  sunrise: ['#FF6B9D', '#FFA07A', '#FFD700'],
  sunset: ['#FF6E7F', '#BFE9FF'],
  dusk: ['#4A00E0', '#8E2DE2'],
  gold: ['#FFD700', '#FFA500', '#FF8C00'],
  roseGold: ['#F4C2C2', '#D4A5A5', '#BC8F8F'],
  silver: ['#E8E8E8', '#C0C0C0', '#A8A8A8'],
  bronze: ['#CD7F32', '#B87333', '#A67356'],
  ocean: ['#667eea', '#764ba2'],
  forest: ['#11998e', '#38ef7d'],
  lavender: ['#c471f5', '#fa71cd'],
  peachy: ['#FFA17F', '#FF6E7F'],
  darkPurple: ['#3B2667', '#BC78EC'],
  darkBlue: ['#0F1419', '#1A1F3A', '#2D3250'],
  brandLight: ['#FFFFFF', '#F8FAFC'],
  shopDark: ['#233044', '#2D3250'],
  darkGreen: ['#0F2027', '#2C5364'],
  holographic: ['#FF6EC4', '#7873F5', '#4FACFE', '#00F2FE'],
  aurora: ['#667eea', '#764ba2', '#f093fb', '#fccb90'],
  neon: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF00FF'],
  skinHealthy: ['#10B981', '#34D399'],
  skinConcern: ['#F59E0B', '#EF4444'],
  skinNeutral: ['#737373', '#A3A3A3']
};

export type GradientToken = typeof gradients;
