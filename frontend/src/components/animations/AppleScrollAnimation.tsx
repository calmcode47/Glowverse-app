import React, { useRef } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useAnimatedScrollHandler,
    useSharedValue,
    interpolate,
    Extrapolate,
    SharedValue,
} from 'react-native-reanimated';

interface AppleScrollAnimationProps {
    children: React.ReactNode;
    scrollY: SharedValue<number>;
    startOffset?: number;
    endOffset?: number;
    style?: ViewStyle;
    animationType?: 'fade' | 'scale' | 'slideUp' | 'slideDown' | 'parallax';
    parallaxSpeed?: number;
}

/**
 * Apple-style scroll animation component
 * Triggers animations based on scroll position, similar to apple.com
 */
export default function AppleScrollAnimation({
    children,
    scrollY,
    startOffset = 0,
    endOffset = 300,
    style,
    animationType = 'fade',
    parallaxSpeed = 0.5,
}: AppleScrollAnimationProps) {
    const animatedStyle = useAnimatedStyle(() => {
        switch (animationType) {
            case 'fade':
                return {
                    opacity: interpolate(
                        scrollY.value,
                        [startOffset - 100, startOffset, endOffset],
                        [0, 1, 1],
                        Extrapolate.CLAMP
                    ),
                };

            case 'scale':
                return {
                    opacity: interpolate(
                        scrollY.value,
                        [startOffset - 100, startOffset],
                        [0, 1],
                        Extrapolate.CLAMP
                    ),
                    transform: [
                        {
                            scale: interpolate(
                                scrollY.value,
                                [startOffset - 100, startOffset],
                                [0.8, 1],
                                Extrapolate.CLAMP
                            ),
                        },
                    ],
                };

            case 'slideUp':
                return {
                    opacity: interpolate(
                        scrollY.value,
                        [startOffset - 100, startOffset],
                        [0, 1],
                        Extrapolate.CLAMP
                    ),
                    transform: [
                        {
                            translateY: interpolate(
                                scrollY.value,
                                [startOffset - 100, startOffset],
                                [50, 0],
                                Extrapolate.CLAMP
                            ),
                        },
                    ],
                };

            case 'slideDown':
                return {
                    opacity: interpolate(
                        scrollY.value,
                        [startOffset - 100, startOffset],
                        [0, 1],
                        Extrapolate.CLAMP
                    ),
                    transform: [
                        {
                            translateY: interpolate(
                                scrollY.value,
                                [startOffset - 100, startOffset],
                                [-50, 0],
                                Extrapolate.CLAMP
                            ),
                        },
                    ],
                };

            case 'parallax':
                return {
                    transform: [
                        {
                            translateY: interpolate(
                                scrollY.value,
                                [0, 1000],
                                [0, -1000 * parallaxSpeed],
                                Extrapolate.EXTEND
                            ),
                        },
                    ],
                };

            default:
                return {};
        }
    });

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

/**
 * Hook to create scroll handler for AppleScrollAnimation
 */
export function useAppleScrollHandler() {
    const scrollY = useRef<SharedValue<number>>(useSharedValue(0)).current;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return { scrollY, scrollHandler };
}
