import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polyline, Line } from "react-native-svg";
import GlassmorphicCard from "../../ui/GlassmorphicCard";

type Point = { x: Date; y: number };

type Props = {
  title: string;
  data: Point[];
  color?: string;
  yLabel?: string;
  loading?: boolean;
  height?: number;
};

export default function LineChartCard({ title, data, color = "#FF6B9D", yLabel, loading, height = 250 }: Props) {
  if (loading) {
    return (
      <GlassmorphicCard style={{ padding: 16 }}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.skeleton, { height }]} />
      </GlassmorphicCard>
    );
  }
  const width = 320;
  const values = data.map(d => d.y);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const range = Math.max(1, max - min);
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((d, i) => {
    const x = i * step;
    const scaled = (d.y - min) / range;
    const y = height - scaled * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <GlassmorphicCard style={{ padding: 16 }}>
      <Text style={styles.title}>{title}</Text>
      {yLabel ? <Text style={styles.subtitle}>{yLabel}</Text> : null}
      <Svg width={width} height={height} accessibilityRole="image">
        <Line x1={0} y1={height} x2={width} y2={height} stroke="#263238" strokeWidth={1} />
        <Polyline points={points} fill="none" stroke={color} strokeWidth={2} />
      </Svg>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "900", fontSize: 16, marginBottom: 4, color: "#fff" },
  subtitle: { fontSize: 12, color: "#9CA3AF", marginBottom: 8 },
  skeleton: { borderRadius: 12, backgroundColor: "#1F2937" }
});

