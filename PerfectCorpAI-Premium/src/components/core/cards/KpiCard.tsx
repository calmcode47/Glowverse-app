import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/design-system/theme';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  style?: ViewStyle;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, color = '#FF6B2C', style }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.02, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }, style]}>
      <LinearGradient colors={[color + '30', color + '10']} style={styles.gradient} />
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12
  },
  gradient: {
    ...StyleSheet.absoluteFillObject
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[400],
    marginBottom: theme.spacing[1]
  },
  value: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold as any
  },
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[400],
    marginTop: theme.spacing[1]
  }
});
