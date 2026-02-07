import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ViewStyle, Animated } from 'react-native';
import { theme } from '@/design-system/theme';

interface Props {
  onFeaturePress: (feature: string) => void;
  style?: ViewStyle;
}

export const FeatureCards: React.FC<Props> = ({ onFeaturePress, style }) => {
  return (
    <View style={[styles.container, style]}>
      <FeatureCard title="Skin Analysis" subtitle="AI-powered assessment" color={theme.colors.primary[500]} onPress={() => onFeaturePress('skin-analysis')} />
      <FeatureCard title="Virtual Try-On" subtitle="See looks instantly" color={theme.colors.accent[500]} onPress={() => onFeaturePress('virtual-tryon')} />
      <FeatureCard title="History" subtitle="Your past analyses" color={theme.colors.secondary[500]} onPress={() => onFeaturePress('history')} />
      <FeatureCard title="Shop" subtitle="Products & accessories" color="#FF6B2C" onPress={() => onFeaturePress('shop')} />
      <FeatureCard title="Performance" subtitle="Stats & nutrition" color="#00C9FF" onPress={() => onFeaturePress('performance')} />
      <FeatureCard title="Brand" subtitle="Overview dashboard" color="#FFB800" onPress={() => onFeaturePress('brand')} />
    </View>
  );
};

const FeatureCard: React.FC<{ title: string; subtitle: string; color: string; onPress: () => void }> = ({ title, subtitle, color, onPress }) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.card, { borderColor: color }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4]
  },
  card: {
    flexBasis: '48%',
    borderWidth: 2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    backgroundColor: theme.colors.glass.dark
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[1]
  },
  cardSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[600]
  }
});
