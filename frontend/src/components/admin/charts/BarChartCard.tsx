import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GlassmorphicCard from "../../ui/GlassmorphicCard";
import Svg, { Rect } from "react-native-svg";

type Datum = { label: string; value: number; color?: string };
type Props = {
  title: string;
  data: Datum[];
  horizontal?: boolean;
  height?: number;
  loading?: boolean;
};

export default function BarChartCard({ title, data, horizontal, height = 250, loading }: Props) {
  if (loading) {
    return (
      <GlassmorphicCard style={{ padding: 16 }}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.skeleton, { height }]} />
      </GlassmorphicCard>
    );
  }
  const width = 320;
  const max = Math.max(1, ...data.map(d => d.value));
  const barCount = data.length || 1;
  const gap = 8;
  const barSize = horizontal ? (height - gap * (barCount + 1)) / barCount : (width - gap * (barCount + 1)) / barCount;
  return (
    <GlassmorphicCard style={{ padding: 16 }}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={width} height={height}>
        {data.map((d, i) => {
          const c = d.color || ["#FF6B9D", "#7C3AED", "#10B981", "#F59E0B", "#EF4444"][i % 5];
          if (horizontal) {
            const y = gap + i * (barSize + gap);
            const w = (d.value / max) * (width - 2 * gap);
            return <Rect key={i} x={gap} y={y} width={w} height={barSize} rx={6} fill={c} />;
          } else {
            const x = gap + i * (barSize + gap);
            const h = (d.value / max) * (height - 2 * gap);
            const y = height - gap - h;
            return <Rect key={i} x={x} y={y} width={barSize} height={h} rx={6} fill={c} />;
          }
        })}
      </Svg>
    </GlassmorphicCard>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "900", fontSize: 16, marginBottom: 4, color: "#fff" },
  skeleton: { borderRadius: 12, backgroundColor: "#1F2937" }
});

