import React, { useEffect, useState } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
    scale?: boolean;
    springy?: boolean;
}

/**
 * Enhanced ScrollReveal with Apple-style animations
 * Supports scale, spring animations, and custom distance
 */
export default function ScrollReveal({
    children,
    delay = 0,
    duration = 800,
    style,
    direction = 'up',
    distance = 30,
    scale = false,
    springy = false,
}: ScrollRevealProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
    const translateX = useSharedValue(direction === 'left' ? distance : direction === 'right' ? -distance : 0);
    const scaleValue = useSharedValue(scale ? 0.95 : 1);

    useEffect(() => {
        const timingConfig = {
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Apple-style easing
        };

        const springConfig = {
            damping: 15,
            stiffness: 100,
            mass: 0.5,
        };

        opacity.value = withDelay(
            delay,
            withTiming(1, timingConfig)
        );

        if (scale) {
            scaleValue.value = withDelay(
                delay,
                springy ? withSpring(1, springConfig) : withTiming(1, timingConfig)
            );
        }

        if (direction === 'up' || direction === 'down') {
            translateY.value = withDelay(
                delay,
                springy ? withSpring(0, springConfig) : withTiming(0, timingConfig)
            );
        } else if (direction === 'left' || direction === 'right') {
            translateX.value = withDelay(
                delay,
                springy ? withSpring(0, springConfig) : withTiming(0, timingConfig)
            );
        }
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale: scaleValue.value },
        ],
    }));

    return (
        <Animated.View style={[animatedStyle, style]}>
            {children}
        </Animated.View>
    );
}
