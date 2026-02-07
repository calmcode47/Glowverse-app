import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/design-system/theme';

interface Props {
  style?: ViewStyle;
}

export const TrendingSection: React.FC<Props> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Trending Looks</Text>
      <View style={styles.row}>
        <TrendingItem label="Glowy Skin" />
        <TrendingItem label="Bold Eyes" />
        <TrendingItem label="Soft Glam" />
      </View>
    </View>
  );
};

const TrendingItem: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.item}>
    <View style={styles.thumb} />
    <Text style={styles.itemLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[4]
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[3]
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing[3]
  },
  item: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.glass.dark,
    padding: theme.spacing[3],
    alignItems: 'center'
  },
  thumb: {
    width: '100%',
    height: 80,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.neutral[200],
    marginBottom: theme.spacing[2]
  },
  itemLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[700]
  }
});
