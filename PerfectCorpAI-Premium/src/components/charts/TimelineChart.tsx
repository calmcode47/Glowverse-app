import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { theme } from '@/design-system/theme';

interface TimelineItem {
  label: string;
  minutes: number;
  color: string;
}

interface TimelineChartProps {
  data: TimelineItem[];
  style?: ViewStyle;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ data, style }) => {
  const total = data.reduce((acc, d) => acc + d.minutes, 0) || 1;
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {data.map((d) => (
          <View key={d.label} style={[styles.segment, { flex: d.minutes, backgroundColor: d.color }]} />
        ))}
      </View>
      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <Text style={styles.text}>{d.label} ({d.minutes}m)</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { },
  row: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden'
  },
  segment: {},
  legend: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginTop: theme.spacing[2],
    flexWrap: 'wrap'
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { fontSize: theme.typography.sizes.xs, color: theme.colors.neutral[400] }
});
