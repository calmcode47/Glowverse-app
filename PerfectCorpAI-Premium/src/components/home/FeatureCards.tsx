import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
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
    </View>
  );
};

const FeatureCard: React.FC<{ title: string; subtitle: string; color: string; onPress: () => void }> = ({ title, subtitle, color, onPress }) => (
  <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={onPress} activeOpacity={0.9}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

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
