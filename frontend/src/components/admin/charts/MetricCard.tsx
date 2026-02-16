import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GlassmorphicCard from "../../ui/GlassmorphicCard";

type Props = {
  label: string;
  value: string | number;
  delta?: number; // positive/negative change in %
  sparkline?: number[];
};

export default function MetricCard({ label, value, delta, sparkline }: Props) {
  return (
    <GlassmorphicCard style={{ padding: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={styles.value}>{value}</Text>
        {typeof delta === "number" ? (
          <Text style={[styles.delta, { color: delta >= 0 ? "#10B981" : "#EF4444" }]}>{delta >= 0 ? "+" : ""}{delta}%</Text>
        ) : null}
      </View>
      {sparkline && sparkline.length > 1 ? (
        <View style={{ height: 40, marginTop: 8, backgroundColor: "#111827", borderRadius: 8 }} />
      ) : null}
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  label: { color: "#9CA3AF", fontSize: 12, marginBottom: 4 },
  value: { color: "#fff", fontSize: 20, fontWeight: "900" },
  delta: { fontWeight: "800" }
});

