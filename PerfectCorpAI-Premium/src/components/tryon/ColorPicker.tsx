import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';

interface ColorPickerProps {
  colors: string[];
  selected?: string;
  onChange: (color: string) => void;
  style?: ViewStyle;
}

export default function ColorPicker({ colors, selected, onChange, style }: ColorPickerProps) {
  return (
    <View style={[styles.container, style]}>
      {colors.map((c) => {
        const isSelected = selected === c;
        return (
          <TouchableOpacity
            key={c}
            onPress={() => onChange(c)}
            style={[
              styles.swatch,
              { backgroundColor: c },
              isSelected ? styles.swatchSelected : styles.swatchUnselected
            ]}
            activeOpacity={0.9}
          />
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
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2
  },
  swatchSelected: {
    borderColor: theme.colors.neutral[900]
  },
  swatchUnselected: {
    borderColor: theme.colors.neutral[300]
  }
});
