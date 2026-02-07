import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@constants/theme";

type GradientCardProps = {
  title: string;
  value?: number | string;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export default function GradientCard({ title, value, children, style }: GradientCardProps) {
  return (
    <LinearGradient
      colors={[theme.colors.orange, theme.colors.yellow]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <Text style={styles.title}>{title}</Text>
      {value !== undefined && (
        <View style={styles.valueCircle}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      )}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.scale[4],
    minHeight: 120,
  },
  title: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  valueCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  valueText: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text.primary,
  },
});
