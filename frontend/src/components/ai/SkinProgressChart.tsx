import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Polyline, G } from "react-native-svg";
import type { SkinAnalysisResult } from "../../services/ai/types";

type Props = {
  analyses: SkinAnalysisResult[];
  selectedConcerns: string[];
  height?: number;
};

export default function SkinProgressChart({ analyses, selectedConcerns, height = 200 }: Props) {
  const width = 320;
  const max = 100;
  const concernScores: Record<string, number[]> = {};
  selectedConcerns.forEach(c => (concernScores[c] = []));
  analyses.forEach(a => {
    selectedConcerns.forEach(c => {
      const sc = a.concerns.find(cc => cc.type === c);
      concernScores[c].push(typeof (sc as any)?.score === "number" ? (sc as any).score : Math.round((sc?.confidence || 0) * 100));
    });
  });
  const step = analyses.length > 1 ? width / (analyses.length - 1) : width;
  const colors = ["#6C5CE7", "#10B981", "#FF9800", "#F44336", "#009688", "#3F51B5"];
  return (
    <View style={[styles.container, { height }]}>
      <Svg width={width} height={height}>
        <G>
          {selectedConcerns.map((c, idx) => {
            const data = concernScores[c] || [];
            const color = colors[idx % colors.length];
            const points = data
              .map((v, i) => {
                const x = i * step;
                const y = height - (Math.max(0, Math.min(max, v)) / max) * height;
                return `${x},${y}`;
              })
              .join(" ");
            return <Polyline key={c} points={points} fill="none" stroke={color} strokeWidth="2" />;
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" }
});

