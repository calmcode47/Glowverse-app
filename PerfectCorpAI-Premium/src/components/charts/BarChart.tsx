import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { theme } from '@/design-system/theme';

interface ProgressItem {
  day: string;
  skinHealth: number;
  grooming: number;
}

interface BarChartProps {
  data: ProgressItem[];
  height?: number;
  colors?: [string, string];
  style?: ViewStyle;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 180, colors = ['#FF6B2C', '#B4FF39'], style }) => {
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.skinHealth || 0, d.grooming || 0)),
    100
  );
  const barHeight = (val: number) => Math.round((val / maxVal) * (height - 24));

  return (
    <View style={[styles.container, { height }, style]}>
      {data.map((d) => (
        <View key={d.day} style={styles.group}>
          <View style={[styles.bar, { height: barHeight(d.skinHealth), backgroundColor: colors[0] }]} />
          <View style={[styles.bar, { height: barHeight(d.grooming), backgroundColor: colors[1] }]} />
          <Text style={styles.label}>{d.day}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[2]
  },
  group: {
    alignItems: 'center',
    width: 36
  },
  bar: {
    width: 12,
    borderRadius: theme.borderRadius.base,
    marginHorizontal: 2
  },
  label: {
    marginTop: 8,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[400]
  }
});
