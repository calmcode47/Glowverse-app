import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '@/design-system/theme';

interface Point {
  x: number;
  y: number;
}

interface LineChartProps {
  width: number;
  height: number;
  points: number[];
  color?: string;
  style?: ViewStyle;
}

export const LineChart: React.FC<LineChartProps> = ({ width, height, points, color = '#FF6B2C', style }) => {
  const step = width / Math.max(points.length - 1, 1);
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const mapY = (v: number) => height - ((v - min) / range) * height;
  const pathPoints: Point[] = points.map((p, i) => ({ x: i * step, y: mapY(p) }));
  const d = pathPoints.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : acc + ` L ${p.x},${p.y}`), '');

  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity={0.9} />
            <Stop offset="1" stopColor={color} stopOpacity={0.6} />
          </LinearGradient>
        </Defs>
        <Path d={d} stroke="url(#lineGradient)" strokeWidth={3} fill="none" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[2]
  }
});
