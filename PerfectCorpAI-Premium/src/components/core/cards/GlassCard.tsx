import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/design-system/theme';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  withGradient?: boolean;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, intensity = 80, tint = 'light', withGradient = false, style }) => {
  if (withGradient) {
    return (
      <View style={[styles.container, style]}>
        <BlurView intensity={intensity} tint={tint} style={styles.blur}>
          <LinearGradient colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']} style={styles.gradient}>
            {children}
          </LinearGradient>
        </BlurView>
      </View>
    );
  }
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...theme.shadows.md
  },
  blur: {
    padding: theme.spacing[4]
  },
  gradient: {
    padding: theme.spacing[4]
  }
});
