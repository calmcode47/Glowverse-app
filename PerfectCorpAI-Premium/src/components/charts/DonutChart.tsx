import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '@/design-system/theme';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  radius?: number;
  strokeWidth?: number;
  style?: ViewStyle;
}

export const DonutChart: React.FC<DonutChartProps> = ({ segments, radius = 60, strokeWidth = 16, style }) => {
  const size = radius * 2;
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);

  let offset = 0;
  const parts = segments.map((s) => {
    const segLen = (s.value / total) * circumference;
    const startOffset = circumference - offset - segLen;
    offset += segLen;
    return { ...s, dasharray: `${segLen} ${circumference}`, dashoffset: startOffset };
  });

  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size}>
        <Circle cx={radius} cy={radius} r={radius - strokeWidth / 2} stroke="#E2E8F0" strokeWidth={strokeWidth} fill="none" />
        {parts.map((p) => (
          <Circle
            key={p.label}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={p.color}
            strokeWidth={strokeWidth}
            strokeDasharray={p.dasharray}
            strokeDashoffset={p.dashoffset}
            strokeLinecap="butt"
            fill="none"
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        ))}
      </Svg>
      <View style={styles.legend}>
        {segments.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  legend: { flexDirection: 'row', gap: theme.spacing[4], marginTop: theme.spacing[2] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: theme.typography.sizes.xs, color: theme.colors.neutral[400] }
});
