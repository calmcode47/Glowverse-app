import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { theme } from '@/design-system/theme';

const { width } = Dimensions.get('window');

interface HeroSectionProps {
  userName?: string;
  onStartAnalysis: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ userName, onStartAnalysis }) => {
  const greeting = getGreeting();
  return (
    <View style={styles.container}>
      <GlassCard style={styles.card} intensity={60}>
        <Text style={styles.greeting}>
          {greeting}
          {userName ? `, ${userName}` : ''}!
        </Text>
        <Text style={styles.tagline}>Precision grooming and performance insights</Text>
        <TouchableOpacity onPress={onStartAnalysis} style={styles.cta}>
          <Text style={styles.ctaText}>START ANALYSIS</Text>
        </TouchableOpacity>
        <View style={styles.stats}>
          <StatItem icon="chart-line" value="98%" label="Accuracy" />
          <StatItem icon="lightning-bolt" value="<1s" label="Processing" />
          <StatItem icon="shield-check" value="100%" label="Private" />
        </View>
      </GlassCard>
    </View>
  );
};

const StatItem: React.FC<{ icon: string; value: string; label: string }> = ({ icon, value, label }) => (
  <View style={styles.stat}>
    <View style={styles.statIcon} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[4]
  },
  card: {
    padding: theme.spacing[6]
  },
  greeting: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[2]
  },
  tagline: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing[6],
    lineHeight: 24
  },
  cta: {
    marginBottom: theme.spacing[6],
    backgroundColor: '#FF6B2C',
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center'
  },
  ctaText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold as any,
    letterSpacing: 1
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)'
  },
  stat: {
    alignItems: 'center'
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[500],
    marginBottom: theme.spacing[1]
  },
  statValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[1]
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[600]
  }
});
