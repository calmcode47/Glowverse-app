export const lightTheme = {
    colors: {
        // Base colors
        background: {
            primary: '#F9FAFB',
            secondary: '#FFFFFF',
            tertiary: '#F3F4F6',
            elevated: '#FFFFFF',
            card: '#FFFFFF',
            overlay: 'rgba(249, 250, 251, 0.95)',
        },
        text: {
            primary: '#1A1A1A',
            secondary: '#5A5A5A',
            tertiary: '#9CA3AF',
            inverse: '#FFFFFF',
            muted: '#D1D5DB',
            link: '#0056B3',
        },
        border: {
            light: '#E5E7EB',
            DEFAULT: '#D1D5DB',
            dark: '#9CA3AF',
        },

        // Brand colors - Professional & Elegant
        accent: {
            emerald: '#059669',      // Primary accent
            emeraldLight: '#10B981',
            emeraldDark: '#047857',
            blue: '#2563EB',         // Secondary accent
            blueLight: '#3B82F6',
            blueDark: '#1D4ED8',
            purple: '#B537F2',
            gold: '#F59E0B',         // Premium/Featured
            amber: '#F59E0B',
            rose: '#F43F5E',         // Alerts/Discounts
        },

        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#C41E3A',
        info: '#3B82F6',

        // Category colors (refined)
        categories: {
            sunglasses: '#F59E0B',
            watches: '#6B7280',
            clothes: '#3B82F6',
            shoes: '#DC2626',
            gym: '#10B981',
            tech: '#8B5CF6',
        } as const,

        // Gradients
        gradients: {
            primary: ['#059669', '#10B981'],
            secondary: ['#2563EB', '#3B82F6'],
            productCard: ['#FFFFFF', '#F9FAFB'],
            background: ['#F9FAFB', '#FFFFFF'],
            hero: ['#EFF6FF', '#F0FDF4'],
        },
    },

    // Typography
    typography: {
        fontFamily: {
            regular: 'System',
            medium: 'System',
            semibold: 'System',
            bold: 'System',
        },
        sizes: {
            xs: 12,
            sm: 14,
            base: 16,
            md: 18,
            lg: 20,
            xl: 24,
            '2xl': 30,
            '3xl': 36,
            '4xl': 48,
        },
        weights: {
            regular: '400' as const,
            medium: '500' as const,
            semibold: '600' as const,
            bold: '700' as const,
            extrabold: '800' as const,
        },
        lineHeights: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    // Spacing
    spacing: {
        xs: 4,
        sm: 8,
        base: 12,
        md: 16,
        lg: 20,
        xl: 24,
        '2xl': 32,
        '3xl': 40,
        '4xl': 48,
    },

    // Border radius
    radius: {
        sm: 8,
        base: 12,
        md: 16,
        lg: 20,
        xl: 24,
        '2xl': 32,
        full: 9999,
    },

    // Shadows - Subtle for light mode
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
        },
    },

    // Animations (matching darkTheme structure)
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
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
        },
        medium: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(15px)',
        },
        strong: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px)',
        },
    },
} as const;

export type LightTheme = typeof lightTheme;
