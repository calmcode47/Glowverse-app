import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - theme.spacing[4] * 2;

const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'skincare', name: 'Skincare' },
  { id: 'beard', name: 'Beard Care' },
  { id: 'hair', name: 'Hair' },
  { id: 'supplements', name: 'Supplements' },
  { id: 'tools', name: 'Tools' }
];

const MENS_PRODUCTS = [
  {
    id: '1',
    name: 'Pre-Workout Face Wash',
    brand: 'Alpha Skin',
    category: 'skincare',
    price: 24.99,
    rating: 4.8,
    color: '#FF6B2C',
    description: 'Energizing cleanser for before workouts',
    benefits: ['Deep Clean', 'No Dryness', 'Fresh Scent']
  },
  {
    id: '2',
    name: 'Beard Growth Serum',
    brand: 'Beard Boss',
    category: 'beard',
    price: 34.99,
    rating: 4.9,
    color: '#FFB800',
    description: 'Promotes thick, healthy beard growth',
    benefits: ['Thicker Beard', 'Nourishing', 'Fast Absorption']
  },
  {
    id: '3',
    name: 'Recovery Hair Mask',
    brand: 'Iron Mane',
    category: 'hair',
    price: 19.99,
    rating: 4.6,
    color: '#00C9FF',
    description: 'Repairs hair post workout sweat and stress',
    benefits: ['Repair', 'Hydration', 'Shine']
  },
  {
    id: '4',
    name: 'Skin Health Supplement',
    brand: 'PrimeLabs',
    category: 'supplements',
    price: 29.99,
    rating: 4.7,
    color: '#B4FF39',
    description: 'Supports collagen and hydration from within',
    benefits: ['Collagen', 'Hydration', 'Glow']
  },
  {
    id: '5',
    name: 'Pro Grooming Kit',
    brand: 'Forge',
    category: 'tools',
    price: 49.99,
    rating: 4.5,
    color: '#7FFF00',
    description: 'Complete kit for beard and hair styling',
    benefits: ['All-in-One', 'Portable', 'Durable']
  },
  {
    id: '6',
    name: 'Daily SPF Moisturizer',
    brand: 'Alpha Skin',
    category: 'skincare',
    price: 21.99,
    rating: 4.7,
    color: '#2D3250',
    description: 'Protects and hydrates skin everyday',
    benefits: ['SPF 30', 'Hydration', 'Matte Finish']
  }
];

export const MensProductCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = selectedCategory === 'all' ? MENS_PRODUCTS : MENS_PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1419', '#1A1F3A', '#2D3250']} style={styles.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Men's Grooming Catalog</Text>
        <View style={styles.categoryRow}>
          {PRODUCT_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  Haptics.selectionAsync();
                }}
                style={[styles.categoryChip, active ? styles.categoryChipActive : styles.categoryChipInactive]}
                activeOpacity={0.85}
              >
                <Text style={[styles.categoryText, active ? styles.categoryTextActive : styles.categoryTextInactive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: theme.spacing[4] }}
          renderItem={({ item }) => <ProductCard product={item} />}
        />
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const ProductCard: React.FC<{ product: (typeof MENS_PRODUCTS)[number] }> = ({ product }) => {
  return (
    <GlassCard style={styles.productCard}>
      <View style={styles.productContent}>
        <View style={styles.productIllustration}>
          <LinearGradient colors={[product.color + '40', product.color + '20']} style={styles.illustrationGradient}>
            <View style={[styles.illustrationShape, { backgroundColor: product.color }]} />
          </LinearGradient>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productMeta}>
            {product.brand} • ${product.price.toFixed(2)} • {product.rating}★
          </Text>
          <Text style={styles.productDesc}>{product.description}</Text>
          <View style={styles.benefitsRow}>
            {product.benefits.map((b) => (
              <View key={b} style={styles.benefitChip}>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.buyButton} activeOpacity={0.9}>
              <Text style={styles.buyText}>BUY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} activeOpacity={0.9}>
              <Text style={styles.saveText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    ...StyleSheet.absoluteFillObject
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: theme.spacing[4],
    paddingTop: 60
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing[4]
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4]
  },
  categoryChip: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500]
  },
  categoryChipInactive: {
    backgroundColor: theme.colors.glass.dark,
    borderColor: theme.colors.glass.dark
  },
  categoryText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any
  },
  categoryTextActive: {
    color: theme.colors.neutral[0]
  },
  categoryTextInactive: {
    color: theme.colors.neutral[400]
  },
  productCard: {
    padding: theme.spacing[4]
  },
  productContent: {
    flexDirection: 'row',
    gap: theme.spacing[3]
  },
  productIllustration: {
    width: 90
  },
  illustrationGradient: {
    width: 90,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  illustrationShape: {
    width: 50,
    height: 50,
    borderRadius: 10
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900]
  },
  productMeta: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing[1]
  },
  productDesc: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[700],
    marginTop: theme.spacing[2]
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginTop: theme.spacing[2]
  },
  benefitChip: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.glass.dark
  },
  benefitText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[700]
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginTop: theme.spacing[3]
  },
  buyButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.primary[500]
  },
  buyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.weights.bold as any
  },
  saveButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: theme.colors.primary[500]
  },
  saveText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weights.semibold as any
  }
});
