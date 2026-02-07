import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';
import type { SkinAnalysisResult } from '@/services/api/analysis.api';

interface Props {
  analyses: SkinAnalysisResult[];
  onSeeAll: () => void;
  style?: ViewStyle;
}

export const PersonalizedFeed: React.FC<Props> = ({ analyses, onSeeAll, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Recent Analyses</Text>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.8}>
          <Text style={styles.link}>See all</Text>
        </TouchableOpacity>
      </View>
      {analyses.slice(0, 3).map((a) => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.cardTitle}>{a.skinType || 'Unknown type'}</Text>
          <Text style={styles.cardSubtitle}>Overall: {a.scores?.overall ?? '-'} • {new Date(a.createdAt).toLocaleDateString()}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[4]
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2]
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900]
  },
  link: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[500]
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.glass.dark,
    padding: theme.spacing[4],
    marginTop: theme.spacing[2]
  },
  cardTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[900]
  },
  cardSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[700],
    marginTop: theme.spacing[1]
  }
});
