import * as React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GradientButtonProps {
    onPress: () => void;
    title: string;
    variant?: "primary" | "orange" | "success" | "outline";
    size?: "small" | "medium" | "large";
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export default function GradientButton({
    onPress,
    title,
    variant = "orange",
    size = "medium",
    icon,
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
}: GradientButtonProps) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const gradientColors = {
        primary: theme.colors.gradient.primary,
        orange: theme.colors.gradient.orange,
        success: theme.colors.gradient.success,
        outline: ["transparent", "transparent"] as const,
    } as const;

    const sizeStyles = {
        small: { paddingVertical: 8, paddingHorizontal: 16 },
        medium: { paddingVertical: 12, paddingHorizontal: 24 },
        large: { paddingVertical: 16, paddingHorizontal: 32 },
    };

    const textSizes = {
        small: theme.typography.fontSizes.sm,
        medium: theme.typography.fontSizes.md,
        large: theme.typography.fontSizes.lg,
    };

    const isOutline = variant === "outline";

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={[animatedStyle, fullWidth && styles.fullWidth, style]}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={gradientColors[variant]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.gradient,
                    sizeStyles[size],
                    isOutline && styles.outlineGradient,
                    (disabled || loading) && styles.disabled,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={isOutline ? theme.colors.orange : theme.colors.text.inverse} />
                ) : (
                    <>
                        {icon && (
                            <MaterialCommunityIcons
                                name={icon as any}
                                size={textSizes[size]}
                                color={isOutline ? theme.colors.orange : theme.colors.text.inverse}
                                style={styles.icon}
                            />
                        )}
                        <Text
                            style={[
                                styles.text,
                                { fontSize: textSizes[size] },
                                isOutline && styles.outlineText,
                                (disabled || loading) && styles.disabledText,
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    gradient: {
        borderRadius: theme.radius.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        ...theme.shadow.level1,
    },
    text: {
        color: theme.colors.text.inverse,
        fontWeight: theme.typography.fontWeights.semibold,
        textAlign: "center",
    },
    outlineGradient: {
        borderWidth: 2,
        borderColor: theme.colors.borderOrange,
        ...theme.shadow.level0,
    },
    outlineText: {
        color: theme.colors.orange,
    },
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.7,
    },
    fullWidth: {
        width: "100%",
    },
    icon: {
        marginRight: 8,
    },
});
