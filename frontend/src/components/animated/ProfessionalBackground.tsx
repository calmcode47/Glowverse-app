import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/themeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfessionalBackgroundProps {
    variant?: 'subtle' | 'normal' | 'vibrant';
}

export default function ProfessionalBackground({ variant = 'subtle' }: ProfessionalBackgroundProps) {
    const { theme, isDark } = useTheme();

    // Animated values for floating shapes
    const float1 = useSharedValue(0);
    const float2 = useSharedValue(0);
    const float3 = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        // Subtle floating animation
        float1.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
            ),
            -1
        );

        float2.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.ease) })
            ),
            -1
        );

        float3.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.ease) })
            ),
            -1
        );

        rotate.value = withRepeat(
            withTiming(360, { duration: 20000, easing: Easing.linear }),
            -1
        );
    }, []);

    const shape1Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(float1.value, [0, 1], [0, -50]) },
            { translateX: interpolate(float1.value, [0, 1], [0, 30]) },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: interpolate(float1.value, [0, 0.5, 1], [0.03, 0.05, 0.03]),
    }));

    const shape2Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(float2.value, [0, 1], [0, 40]) },
            { translateX: interpolate(float2.value, [0, 1], [0, -20]) },
            { rotate: `${-rotate.value * 0.5}deg` },
        ],
        opacity: interpolate(float2.value, [0, 0.5, 1], [0.04, 0.06, 0.04]),
    }));

    const shape3Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(float3.value, [0, 1], [-30, 30]) },
            { translateX: interpolate(float3.value, [0, 1], [20, -10]) },
            { scale: interpolate(float3.value, [0, 0.5, 1], [1, 1.1, 1]) },
        ],
        opacity: interpolate(float3.value, [0, 0.5, 1], [0.02, 0.04, 0.02]),
    }));

    const getOpacity = () => {
        switch (variant) {
            case 'subtle': return 0.4;
            case 'vibrant': return 0.8;
            default: return 0.6;
        }
    };

    return (
        <View style={styles.container}>
            {/* Base gradient */}
            <LinearGradient
                colors={theme.colors.gradients.background}
                style={StyleSheet.absoluteFill}
            />

            {/* Floating geometric shapes */}
            <Animated.View style={[styles.shape, styles.shape1, shape1Style]}>
                <LinearGradient
                    colors={[
                        theme.colors.accent.emerald + '20',
                        theme.colors.accent.emerald + '10',
                    ]}
                    style={styles.shapeGradient}
                />
            </Animated.View>

            <Animated.View style={[styles.shape, styles.shape2, shape2Style]}>
                <LinearGradient
                    colors={[
                        theme.colors.accent.blue + '20',
                        theme.colors.accent.blue + '10',
                    ]}
                    style={styles.shapeGradient}
                />
            </Animated.View>

            <Animated.View style={[styles.shape, styles.shape3, shape3Style]}>
                <LinearGradient
                    colors={[
                        theme.colors.accent.emerald + '15',
                        theme.colors.accent.blue + '15',
                    ]}
                    style={styles.shapeGradient}
                />
            </Animated.View>

            {/* Mesh gradient overlay */}
            <View style={[styles.meshOverlay, { opacity: getOpacity() }]}>
                <LinearGradient
                    colors={[
                        'transparent',
                        theme.colors.background.primary + '40',
                        'transparent',
                    ]}
                    style={StyleSheet.absoluteFill}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    shape: {
        position: 'absolute',
        borderRadius: 200,
    },
    shape1: {
        width: 400,
        height: 400,
        top: -100,
        right: -100,
    },
    shape2: {
        width: 350,
        height: 350,
        bottom: -50,
        left: -80,
    },
    shape3: {
        width: 300,
        height: 300,
        top: SCREEN_HEIGHT * 0.4,
        right: -50,
    },
    shapeGradient: {
        flex: 1,
        borderRadius: 200,
    },
    meshOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
});
