import React, { useEffect } from "react";
import { ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { theme } from "@constants/theme";

type AnimationVariant = "fade" | "slide" | "scale" | "slideUp" | "slideDown";

interface ScrollAnimatedViewProps {
    children: React.ReactNode;
    variant?: AnimationVariant;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
}

export default function ScrollAnimatedView({
    children,
    variant = "fade",
    delay = 0,
    duration = theme.animation.durations.medium,
    style,
}: ScrollAnimatedViewProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(variant.includes("slide") ? 30 : 0);
    const scale = useSharedValue(variant === "scale" ? 0.8 : 1); useEffect(() => {
        // Trigger animations on mount
        opacity.value = withDelay(
            delay,
            withTiming(1, {
                duration,
                easing: Easing.out(Easing.cubic),
            })
        );

        if (variant === "slideUp" || variant === "slide") {
            translateY.value = 30;
            translateY.value = withDelay(
                delay,
                withSpring(0, {
                    damping: 15,
                    stiffness: 100,
                })
            );
        } else if (variant === "slideDown") {
            translateY.value = -30;
            translateY.value = withDelay(
                delay,
                withSpring(0, {
                    damping: 15,
                    stiffness: 100,
                })
            );
        }

        if (variant === "scale") {
            scale.value = withDelay(
                delay,
                withSpring(1, {
                    damping: 12,
                    stiffness: 120,
                })
            );
        }
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
