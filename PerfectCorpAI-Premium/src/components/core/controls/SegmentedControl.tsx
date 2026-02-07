import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';

interface SegmentedControlProps {
  segments: string[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ segments, value, onChange, style }) => {
  return (
    <View style={[styles.container, style]}>
      {segments.map((s) => {
        const active = s === value;
        return (
          <TouchableOpacity key={s} style={[styles.segment, active && styles.active]} onPress={() => onChange(s)}>
            <Text style={[styles.text, active && styles.textActive]}>{s}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    padding: 4
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg
  },
  active: {
    backgroundColor: '#FF6B2C'
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[400],
    fontWeight: '600' as any
  },
  textActive: {
    color: theme.colors.neutral[0],
    fontWeight: '700' as any
  }
});
