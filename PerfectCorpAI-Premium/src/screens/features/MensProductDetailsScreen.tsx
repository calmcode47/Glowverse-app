import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { theme } from '@/design-system/theme';
import { MEN_PRODUCTS, ProductVariant } from '@/mocks/products';

interface RouteProps {
  route?: { params?: { productId?: string } };
}

export const MensProductDetailsScreen: React.FC<RouteProps> = ({ route }) => {
  const productId = route?.params?.productId ?? MEN_PRODUCTS[0].id;
  const product = MEN_PRODUCTS.find((p) => p.id === productId) ?? MEN_PRODUCTS[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1419', '#1A1F3A', '#2D3250']} style={styles.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: product.heroColor }]} />
          <Text style={styles.heroTitle}>{product.name}</Text>
          <Text style={styles.heroBrand}>{product.brand}</Text>
          <Text style={styles.heroPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.heroRating}>{product.rating}★</Text>
        </GlassCard>

        <Text style={styles.sectionTitle}>Variants</Text>
        <View style={styles.variantRow}>
          {product.variants.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.variantChip, selectedVariant.id === v.id && styles.variantChipActive]}
              onPress={() => setSelectedVariant(v)}
            >
              <Text style={[styles.variantText, selectedVariant.id === v.id && styles.variantTextActive]}>{v.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.text}>{product.description}</Text>
        </GlassCard>

        <Text style={styles.sectionTitle}>Benefits</Text>
        <View style={styles.benefitsRow}>
          {product.benefits.map((b) => (
            <GlassCard key={b} style={styles.benefit}>
              <Text style={styles.benefitText}>{b}</Text>
            </GlassCard>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Routine</Text>
        <GlassCard style={styles.card}>
          {product.routines.map((step, i) => (
            <View key={step} style={styles.routineRow}>
              <View style={styles.routineDot} />
              <Text style={styles.text}>{step}</Text>
            </View>
          ))}
        </GlassCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  scrollView: { flex: 1 },
  content: { padding: theme.spacing[4], paddingTop: 60 },
  heroCard: { padding: theme.spacing[4], alignItems: 'center' },
  heroIcon: { width: 90, height: 90, borderRadius: 16, marginBottom: theme.spacing[2] },
  heroTitle: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[0]
  },
  heroBrand: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[400], marginTop: theme.spacing[1] },
  heroPrice: { fontSize: theme.typography.sizes.lg, color: '#FF6B2C', marginTop: theme.spacing[2] },
  heroRating: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[400], marginTop: theme.spacing[1] },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[0],
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[2]
  },
  card: { padding: theme.spacing[4] },
  text: { fontSize: theme.typography.sizes.base, color: theme.colors.neutral[0], lineHeight: 22 },
  variantRow: { flexDirection: 'row', gap: theme.spacing[2] },
  variantChip: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    backgroundColor: '#2D3250'
  },
  variantChipActive: { backgroundColor: '#FF6B2C' },
  variantText: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[400] },
  variantTextActive: { color: theme.colors.neutral[0], fontWeight: theme.typography.weights.bold as any },
  benefitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
  benefit: { paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[2] },
  benefitText: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[0] },
  routineRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[2] },
  routineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B2C' }
});
