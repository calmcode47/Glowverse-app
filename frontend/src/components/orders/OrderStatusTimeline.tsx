import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Step = "ordered" | "processing" | "shipped" | "out_for_delivery" | "delivered";

type Props = {
  current: Step;
  timestamps?: Partial<Record<Step, string>>;
};

const steps: Step[] = ["ordered", "processing", "shipped", "out_for_delivery", "delivered"];

export default function OrderStatusTimeline({ current, timestamps = {} }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const currentIdx = steps.indexOf(current);
  return (
    <View style={styles.container}>
      {steps.map((s, i) => {
        const active = i <= currentIdx;
        return (
          <View key={s} style={styles.step}>
            <View style={[styles.dot, active && { backgroundColor: theme.colors.accent.emerald }]} />
            <Text style={[styles.label, active && { color: theme.colors.text.primary }]}>{label(s)}</Text>
            {timestamps[s] ? <Text style={styles.time}>{shortDate(timestamps[s]!)}</Text> : null}
            {i < steps.length - 1 ? <View style={[styles.bar, i < currentIdx && { backgroundColor: theme.colors.accent.emerald }]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function label(s: Step) {
  switch (s) {
    case "ordered":
      return "Ordered";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "out_for_delivery":
      return "Out for Delivery";
    case "delivered":
      return "Delivered";
  }
}

function shortDate(d: string) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { padding: 12 },
    step: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.border.light },
    bar: { flex: 1, height: 2, backgroundColor: theme.colors.border.light, marginLeft: 6, borderRadius: 1 },
    label: { marginLeft: 6, color: theme.colors.text.secondary, width: 130 },
    time: { color: theme.colors.text.tertiary, marginLeft: 6 }
  });
}
