import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/design-system/theme';

export default function SkinOverlayLegend() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: '#FF6B2C' }]} />
        <Text style={styles.text}>Texture</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: '#FFB800' }]} />
        <Text style={styles.text}>Hydration</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: '#00C9FF' }]} />
        <Text style={styles.text}>Clarity</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[1]
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { color: theme.colors.neutral[0], fontSize: theme.typography.sizes.xs }
});
