// Glowverse Dark Theme - Men's Beauty & Accessories
// Inspired by fitness app with dark backgrounds and neon accents

export const darkTheme = {
    colors: {
        // Base colors - Softer, more professional
        background: {
            primary: '#0D1117',      // Softer than #0A0E1A
            secondary: '#161B22',
            tertiary: '#21262D',
            elevated: '#1C2128',
            card: '#1C2128',         // Card background (derived from elevated)
            overlay: 'rgba(13, 17, 23, 0.95)', // Derived from primary
        },

        // Brand colors - Professional & Elegant (matching light theme)
        accent: {
            emerald: '#10B981',      // Primary accent (was neon green)
            emeraldLight: '#34D399',
            emeraldDark: '#059669',
            blue: '#3B82F6',         // Secondary accent (was electric blue)
            blueLight: '#60A5FA',
            blueDark: '#2563EB',
            purple: '#B537F2',       // Tertiary accent (retained)
            gold: '#F59E0B',         // Premium/Featured (was #FFD700)
            amber: '#FBBF24',        // Additional warm accent
            rose: '#FB7185',         // Alerts/Discounts (was orange #FF6B35)
        },


        // Text Colors
        text: {
            primary: '#E6EDF3',
            secondary: '#8B949E',
            tertiary: '#6E7681',
            inverse: '#0D1117',
            muted: '#484F58',
        },

        // UI Elements
        border: {
            light: '#30363D',
            DEFAULT: '#21262D',
            dark: '#161B22',
        },

        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#F87171',
        info: '#60A5FA',

        // Gradients - Professional
        gradients: {
            primary: ['#10B981', '#059669'],
            secondary: ['#3B82F6', '#2563EB'],
            productCard: ['#161B22', '#0D1117'],
            background: ['#0D1117', '#161B22'],
            hero: ['#1C2128', '#161B22'],
        },

        // Category colors (matching light theme)
        categories: {
            sunglasses: '#FBBF24',
            watches: '#9CA3AF',
            clothes: '#60A5FA',
            shoes: '#EF4444',
            gym: '#34D399',
            tech: '#A78BFA',
        } as const,
    },

    // Typography
    typography: {
        fonts: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
            black: 'System',
        },

        sizes: {
            xs: 10,
            sm: 12,
            base: 14,
            md: 16,
            lg: 18,
            xl: 22,
            xxl: 28,
            xxxl: 36,
            hero: 48,
        },

        weights: {
            regular: '400' as const,
            medium: '500' as const,
            semibold: '600' as const,
            bold: '700' as const,
            black: '900' as const,
        },

        lineHeights: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.8,
        },
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },

    // Border Radius
    radius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        xxl: 24,
        round: 999,
    },

    // Shadows & Glows
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 8,
        },
        glow: {
            shadowColor: '#39FF14',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            elevation: 10,
        },
        glowBlue: {
            shadowColor: '#00D9FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
            elevation: 8,
        },
    },

    // Animations
    animations: {
        durations: {
            instant: 100,
            fast: 200,
            normal: 300,
            slow: 500,
            verySlow: 800,
        },

        easings: {
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
            spring: { damping: 15, stiffness: 150 },
            bounce: { damping: 10, stiffness: 100 },
        },
    },

    // Glassmorphism
    glass: {
        light: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
        },
        medium: {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(15px)',
        },
        strong: {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
        },
    },
} as const;

export type DarkTheme = typeof darkTheme;
