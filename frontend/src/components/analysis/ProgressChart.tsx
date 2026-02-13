import React from "react";
import { View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

type Props = {
  data: number[]; // 0..100
  width?: number;
  height?: number;
};

export default function ProgressChart({ data, width = 120, height = 40 }: Props) {
  const max = 100;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - (Math.max(0, Math.min(max, v)) / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Polyline points={points} fill="none" stroke="#10B981" strokeWidth="2" />
      </Svg>
    </View>
  );
}
