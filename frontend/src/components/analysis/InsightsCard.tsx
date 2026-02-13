import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = {
  improvementPct: number;
  hydrationDelta?: number;
  notes?: string;
};

export default function InsightsCard({ improvementPct, hydrationDelta, notes }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.line}>Your skin improved {Math.round(improvementPct)}% since first analysis.</Text>
      {hydrationDelta !== undefined ? <Text style={styles.line}>Hydration changed by {hydrationDelta > 0 ? "+" : ""}{Math.round(hydrationDelta)} points.</Text> : null}
      {notes ? <Text style={styles.line}>{notes}</Text> : null}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12 },
    title: { color: theme.colors.text.primary, fontWeight: "900", marginBottom: 6 },
    line: { color: theme.colors.text.secondary, marginTop: 2 }
  });
}
