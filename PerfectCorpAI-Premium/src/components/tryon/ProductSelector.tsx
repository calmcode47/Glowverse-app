import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';

interface ProductSelectorProps {
  categories: string[];
  selected?: string;
  onChange: (category: string) => void;
  style?: ViewStyle;
}

export default function ProductSelector({ categories, selected, onChange, style }: ProductSelectorProps) {
  return (
    <View style={[styles.container, style]}>
      {categories.map((cat) => {
        const active = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onChange(cat)}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
            activeOpacity={0.85}
          >
            <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>{cat.toUpperCase()}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  chip: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1
  },
  chipActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500]
  },
  chipInactive: {
    backgroundColor: theme.colors.glass.dark,
    borderColor: theme.colors.glass.dark
  },
  text: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any
  },
  textActive: {
    color: theme.colors.neutral[0]
  },
  textInactive: {
    color: theme.colors.neutral[700]
  }
});
