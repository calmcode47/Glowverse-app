import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { darkTheme } from '../../theme/darkTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleBackgroundProps {
    variant?: 'default' | 'hero' | 'product' | 'stats';
}

export default function ParticleBackground({ variant = 'default' }: ParticleBackgroundProps) {
    const particles = Array.from({ length: 15 }, (_, i) => i);

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Base Gradient */}
            <LinearGradient
                colors={['#0D1117', '#161B22']}
                style={StyleSheet.absoluteFill}
            />

            {/* Floating Particles */}
            {particles.map((index) => (
                <FloatingParticle key={index} index={index} variant={variant} />
            ))}

            {/* Gradient Mesh Overlay */}
            <View style={styles.meshOverlay}>
                <LinearGradient
                    colors={['transparent', 'rgba(57, 255, 20, 0.03)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>
        </View>
    );
}

function FloatingParticle({ index, variant }: { index: number; variant: string }) {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);

    const size = Math.random() * 40 + 10;
    const leftPosition = Math.random() * SCREEN_WIDTH;
    const topPosition = Math.random() * SCREEN_HEIGHT;
    const duration = (Math.random() * 10 + 15) * 1000;
    const delay = index * 200;

    useEffect(() => {
        // Float animation
        translateY.value = withRepeat(
            withSequence(
                withTiming(-50, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
                withTiming(50, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        translateX.value = withRepeat(
            withSequence(
                withTiming(30, { duration: duration / 3, easing: Easing.inOut(Easing.ease) }),
                withTiming(-30, { duration: duration / 3, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: duration / 3, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        // Fade in
        opacity.value = withTiming(0.6, { duration: 1000, easing: Easing.ease });

        // Scale pulse
        scale.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale: scale.value },
        ],
        opacity: opacity.value * (variant === 'hero' ? 0.4 : 0.3),
    }));

    const getParticleColor = () => {
        const colors = [
            darkTheme.colors.accent.emerald,
            darkTheme.colors.accent.blue,
            darkTheme.colors.accent.purple,
        ];
        return colors[index % colors.length];
    };

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    width: size,
                    height: size,
                    left: leftPosition,
                    top: topPosition,
                    backgroundColor: getParticleColor(),
                },
                animatedStyle,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    particle: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.2,
    },
    meshOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
});
