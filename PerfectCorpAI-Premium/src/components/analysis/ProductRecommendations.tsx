import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '@/design-system/theme';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string;
  rating: number;
  suitabilityScore: number;
}

interface Props {
  products: Product[];
  onProductPress: (productId: string) => void;
}

export default function ProductRecommendations({ products, onProductPress }: Props) {
  return (
    <View style={styles.container}>
      {products.map((p) => (
        <TouchableOpacity key={p.id} style={styles.card} activeOpacity={0.9} onPress={() => onProductPress(p.id)}>
          <View style={styles.thumb} />
          <View style={styles.info}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.meta}>
              {p.brand} • {p.category}
            </Text>
            <Text style={styles.meta}>Suitability {Math.round(p.suitabilityScore)}%</Text>
            <Text style={styles.price}>${p.price.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing[3]
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.glass.dark,
    padding: theme.spacing[3]
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.neutral[200],
    marginRight: theme.spacing[3]
  },
  info: {
    flex: 1
  },
  name: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[900]
  },
  meta: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[600],
    marginTop: 2
  },
  price: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    marginTop: theme.spacing[1]
  }
});
