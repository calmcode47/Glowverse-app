import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { theme } from '@/design-system/theme';

interface NeumorphicCardProps {
  style?: ViewStyle;
  dark?: boolean;
  children?: React.ReactNode;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({ style, dark = false, children }) => {
  const base = dark ? styles.dark : styles.light;
  return <View style={[styles.container, base, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4]
  },
  light: {
    backgroundColor: '#F8FAFC',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 0,
    ...Platform.select({
      android: {
        borderColor: '#E2E8F0',
        borderWidth: 1
      }
    })
  },
  dark: {
    backgroundColor: '#1A1F3A',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  }
});
