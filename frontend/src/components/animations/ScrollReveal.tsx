import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
    direction?: 'up' | 'down' | 'left' | 'right';
}

export default function ScrollReveal({
    children,
    delay = 0,
    duration = 600,
    style,
    direction = 'up',
}: ScrollRevealProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(direction === 'up' ? 50 : direction === 'down' ? -50 : 0);
    const translateX = useSharedValue(direction === 'left' ? 50 : direction === 'right' ? -50 : 0);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withTiming(1, {
                duration,
                easing: Easing.out(Easing.cubic),
            })
        );

        if (direction === 'up' || direction === 'down') {
            translateY.value = withDelay(
                delay,
                withTiming(0, {
                    duration,
                    easing: Easing.out(Easing.cubic),
                })
            );
        } else {
            translateX.value = withDelay(
                delay,
                withTiming(0, {
                    duration,
                    easing: Easing.out(Easing.cubic),
                })
            );
        }
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
        ],
    }));

    return (
        <Animated.View style={[animatedStyle, style]}>
            {children}
        </Animated.View>
    );
}
