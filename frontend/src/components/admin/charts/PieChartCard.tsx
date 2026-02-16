import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import GlassmorphicCard from "../../ui/GlassmorphicCard";

type Slice = { label: string; value: number; color?: string };
type Props = { title: string; data: Slice[]; size?: number; loading?: boolean };

export default function PieChartCard({ title, data, size = 220, loading }: Props) {
  if (loading) {
    return (
      <GlassmorphicCard style={{ padding: 16 }}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.skeleton, { height: size }]} />
      </GlassmorphicCard>
    );
  }
  const total = Math.max(1, data.reduce((a, b) => a + b.value, 0));
  const r = size / 2;
  let startAngle = 0;
  const slices = data.map((s, i) => {
    const angle = (s.value / total) * Math.PI * 2;
    const end = startAngle + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1 = r + r * Math.cos(startAngle);
    const y1 = r + r * Math.sin(startAngle);
    const x2 = r + r * Math.cos(end);
    const y2 = r + r * Math.sin(end);
    const d = `M ${r} ${r} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const c = s.color || ["#FF6B9D", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"][i % 5];
    startAngle = end;
    return <Path key={i} d={d} fill={c} />;
  });
  return (
    <GlassmorphicCard style={{ padding: 16 }}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={size} height={size}>{slices}</Svg>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "900", fontSize: 16, marginBottom: 4, color: "#fff" },
  skeleton: { borderRadius: 12, backgroundColor: "#1F2937" }
});

