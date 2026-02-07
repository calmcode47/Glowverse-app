import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search', value, onChangeText, style }) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.neutral[400]}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2]
  },
  input: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.sizes.base
  }
});
