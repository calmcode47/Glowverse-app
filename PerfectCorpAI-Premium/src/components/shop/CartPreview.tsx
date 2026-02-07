import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/design-system/theme';

export default function CartPreview() {
  const items = [
    { name: 'Iron Cleanse', price: 19.99 },
    { name: 'Steel Beard Oil', price: 24.99 }
  ];
  const total = items.reduce((acc, i) => acc + i.price, 0);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart ({items.length})</Text>
      <Text style={styles.total}>${total.toFixed(2)}</Text>
      <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Checkout</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: { color: theme.colors.neutral[0], fontWeight: '700' as any },
  total: { color: '#FF6B2C', fontWeight: '700' as any },
  button: { backgroundColor: '#FF6B2C', paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[2], borderRadius: theme.borderRadius.base },
  buttonText: { color: theme.colors.neutral[0], fontWeight: '700' as any }
});
