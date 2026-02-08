import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@constants/theme";

interface GlassmorphicCardProps {
    children: ReactNode;
    intensity?: number;
    tint?: "light" | "dark" | "default";
    style?: ViewStyle;
    gradient?: boolean;
    elevated?: boolean;
}

export default function GlassmorphicCard({
    children,
    intensity = 80,
    tint = "dark",
    style,
    gradient = false,
    elevated = true,
}: GlassmorphicCardProps) {
    if (gradient) {
        return (
            <View style={[styles.container, elevated && theme.shadow.level2, style]}>
                <LinearGradient
                    colors={["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.05)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradient]}
                >
                    <View style={styles.content}>{children}</View>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={[styles.container, elevated && theme.shadow.level2, style]}>
            <BlurView intensity={intensity} tint={tint} style={styles.blur}>
                <View style={[styles.innerBorder, tint === "dark" && styles.darkBorder]}>
                    <View style={styles.content}>{children}</View>
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.radius.lg,
        overflow: "hidden",
    },
    blur: {
        borderRadius: theme.radius.lg,
    },
    gradient: {
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    innerBorder: {
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    darkBorder: {
        borderColor: "rgba(255, 107, 53, 0.2)",
    },
    content: {
        padding: theme.spacing.scale[4],
    },
});
