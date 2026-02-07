export const gradients = {
  primary: {
    default: ['#A855F7', '#EC4899'],
    soft: ['#F3E8FF', '#FAE8FF'],
    vibrant: ['#9333EA', '#DB2777'],
    shimmer: ['#A855F7', '#EC4899', '#F97316']
  },
  secondary: {
    default: ['#F43F5E', '#FB7185']
  },
  accent: {
    default: ['#F59E0B', '#FBBF24']
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
  darkBlue: ['#0F2027', '#203A43', '#2C5364'],
  darkGreen: ['#0F2027', '#2C5364'],
  holographic: ['#FF6EC4', '#7873F5', '#4FACFE', '#00F2FE'],
  aurora: ['#667eea', '#764ba2', '#f093fb', '#fccb90'],
  neon: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF00FF'],
  skinHealthy: ['#10B981', '#34D399'],
  skinConcern: ['#F59E0B', '#EF4444'],
  skinNeutral: ['#737373', '#A3A3A3']
};

export type GradientToken = typeof gradients;
