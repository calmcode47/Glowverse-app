import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';

interface IntensityControlProps {
  value: number; // 0..1
  onChange: (value: number) => void;
  style?: ViewStyle;
}

export default function IntensityControl({ value, onChange, style }: IntensityControlProps) {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const inc = () => onChange(clamp(value + 0.1));
  const dec = () => onChange(clamp(value - 0.1));

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.button} onPress={dec} activeOpacity={0.85}>
        <Text style={styles.text}>-</Text>
      </TouchableOpacity>
      <View style={styles.valueBox}>
        <Text style={styles.valueText}>{Math.round(value * 100)}%</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={inc} activeOpacity={0.85}>
        <Text style={styles.text}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  button: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.glass.medium
  },
  text: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.neutral[900],
    fontWeight: theme.typography.weights.semibold as any
  },
  valueBox: {
    minWidth: 64,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.glass.dark,
    alignItems: 'center'
  },
  valueText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.neutral[700]
  }
});
