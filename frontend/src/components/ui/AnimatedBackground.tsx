import * as React from "react";
import { useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { theme } from "@constants/theme";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface AnimatedBackgroundProps {
    variant?: "orange" | "primary" | "yellow" | "blue";
    style?: ViewStyle;
    animated?: boolean;
}

export default function AnimatedBackground({
    variant = "orange",
    style,
    animated = true,
}: AnimatedBackgroundProps) {
    const gradientProgress = useSharedValue(0);

    useEffect(() => {
        if (animated) {
            gradientProgress.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        }
    }, [animated]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: 0.85 + gradientProgress.value * 0.15,
        };
    });

    const gradientColors = {
        orange: theme.colors.gradient.orange,
        primary: theme.colors.gradient.primary,
        yellow: theme.colors.gradient.yellow,
        blue: theme.colors.gradient.blue,
    } as const;

    return (
        <AnimatedLinearGradient
            colors={gradientColors[variant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, animated && animatedStyle, style]}
        />
    );
}
