import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = { current: number; total: number; labels?: string[] };

export default function ProgressIndicator({ current, total, labels = [] }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i < current;
        return (
          <View key={i} style={styles.step}>
            <View style={[styles.dot, active && { backgroundColor: theme.colors.accent.emerald }]} />
            {labels[i] ? <Text style={[styles.label, active && { color: theme.colors.text.primary }]}>{labels[i]}</Text> : null}
            {i < total - 1 ? <View style={[styles.bar, active && { backgroundColor: theme.colors.accent.emerald }]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 12 },
    step: { flexDirection: "row", alignItems: "center" },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.border.light },
    bar: { width: 40, height: 2, backgroundColor: theme.colors.border.light, marginHorizontal: 6, borderRadius: 1 },
    label: { marginLeft: 6, marginRight: 12, color: theme.colors.text.secondary, fontSize: 12 }
  });
}
