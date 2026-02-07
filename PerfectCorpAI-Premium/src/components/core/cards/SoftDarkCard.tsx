import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';

interface SoftDarkCardProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const SoftDarkCard: React.FC<SoftDarkCardProps> = ({ style, children }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1F3A',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  }
});
