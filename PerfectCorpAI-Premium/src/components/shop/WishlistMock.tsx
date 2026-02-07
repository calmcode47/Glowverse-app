import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/design-system/theme';

export default function WishlistMock() {
  const items = ['Titan Shield SPF', 'Recovery Massager'];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>
      {items.map((i) => (
        <Text key={i} style={styles.item}>• {i}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 16,
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[3]
  },
  title: { color: theme.colors.neutral[0], fontWeight: '700' as any, marginBottom: theme.spacing[2] },
  item: { color: theme.colors.neutral[0], fontSize: theme.typography.sizes.xs }
});
