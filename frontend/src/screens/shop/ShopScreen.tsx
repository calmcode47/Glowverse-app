import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { darkTheme } from '../../theme/darkTheme';
import ParticleBackground from '../../components/animated/ParticleBackground';
import Product3DCard from '../../components/products/Product3DCard';
import { products, categories } from '../../data/products';
import type { RootStackParamList } from '../../navigation/types';
import type { Product } from '../../data/products';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ShopScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'new'>('new');

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0;
  });

  return (
    <View style={styles.container}>
      <ParticleBackground variant="product" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="magnify" size={24} color={darkTheme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="cart-outline" size={24} color={darkTheme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialCommunityIcons
              name={category.icon as any}
              size={16}
              color={selectedCategory === category.id ? darkTheme.colors.text.inverse : darkTheme.colors.text.secondary}
            />
            <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.resultCount}>{sortedProducts.length} Products</Text>
        <View style={styles.sortButtons}>
          {(['price', 'rating', 'new'] as const).map((sort) => (
            <TouchableOpacity
              key={sort}
              style={[styles.sortButton, sortBy === sort && styles.sortButtonActive]}
              onPress={() => setSortBy(sort)}
            >
              <Text style={[styles.sortText, sortBy === sort && styles.sortTextActive]}>
                {sort === 'price' ? '💰' : sort === 'rating' ? '⭐' : '🆕'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item, index }) => (
          <ProductGridCard
            product={item}
            index={index}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
      />
    </View>
  );
}

function ProductGridCard({ product, onPress, index }: {
  product: Product;
  onPress: () => void;
  index: number;
}) {
  const categoryColor = darkTheme.colors.categories[product.category];

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={darkTheme.colors.gradients.productCard}
        style={styles.gridCardInner}
      >
        {/* Image Placeholder */}
        <LinearGradient
          colors={[categoryColor + '40', categoryColor + '20']}
          style={styles.gridImage}
        >
          <MaterialCommunityIcons
            name={getCategoryIcon(product.category)}
            size={40}
            color={categoryColor}
          />
        </LinearGradient>

        {/* Badges */}
        {product.isNew && (
          <View style={[styles.gridBadge, { backgroundColor: darkTheme.colors.accent.neonGreen }]}>
            <Text style={styles.gridBadgeText}>NEW</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.gridInfo}>
          <Text style={styles.gridBrand}>{product.brand}</Text>
          <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>

          <View style={styles.gridRating}>
            <MaterialCommunityIcons name="star" size={12} color={darkTheme.colors.accent.gold} />
            <Text style={styles.gridRatingText}>{product.rating}</Text>
          </View>

          <Text style={styles.gridPrice}>${product.price}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function getCategoryIcon(category: Product['category']): string {
  const icons: Record<Product['category'], string> = {
    sunglasses: 'sunglasses',
    watches: 'watch',
    clothes: 'tshirt-crew',
    shoes: 'shoe-sneaker',
    gym: 'dumbbell',
    tech: 'cellphone',
  };
  return icons[category];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: darkTheme.spacing.base,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: darkTheme.spacing.md,
  },
  headerTitle: {
    fontSize: darkTheme.typography.sizes.xxl,
    fontWeight: darkTheme.typography.weights.bold,
    color: darkTheme.colors.text.primary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: darkTheme.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: darkTheme.radius.md,
    backgroundColor: darkTheme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: darkTheme.spacing.base,
    paddingVertical: darkTheme.spacing.md,
    gap: darkTheme.spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: darkTheme.spacing.base,
    paddingVertical: darkTheme.spacing.sm,
    borderRadius: darkTheme.radius.round,
    backgroundColor: darkTheme.colors.background.card,
    borderWidth: 1,
    borderColor: darkTheme.colors.border.light,
    gap: darkTheme.spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: darkTheme.colors.accent.neonGreen,
    borderColor: darkTheme.colors.accent.neonGreen,
  },
  categoryText: {
    fontSize: darkTheme.typography.sizes.sm,
    color: darkTheme.colors.text.secondary,
    fontWeight: darkTheme.typography.weights.medium,
  },
  categoryTextActive: {
    color: darkTheme.colors.text.inverse,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: darkTheme.spacing.base,
    paddingVertical: darkTheme.spacing.md,
  },
  resultCount: {
    fontSize: darkTheme.typography.sizes.base,
    color: darkTheme.colors.text.secondary,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: darkTheme.spacing.xs,
  },
  sortButton: {
    width: 36,
    height: 36,
    borderRadius: darkTheme.radius.md,
    backgroundColor: darkTheme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: darkTheme.colors.border.light,
  },
  sortButtonActive: {
    backgroundColor: darkTheme.colors.accent.neonGreen,
    borderColor: darkTheme.colors.accent.neonGreen,
  },
  sortText: {
    fontSize: 16,
  },
  sortTextActive: {
    transform: [{ scale: 1.2 }],
  },
  productsGrid: {
    paddingHorizontal: darkTheme.spacing.base,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: darkTheme.spacing.md,
    marginBottom: darkTheme.spacing.md,
  },
  gridCard: {
    flex: 1,
    borderRadius: darkTheme.radius.lg,
    overflow: 'hidden',
  },
  gridCardInner: {
    borderRadius: darkTheme.radius.lg,
    borderWidth: 1,
    borderColor: darkTheme.colors.border.light,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBadge: {
    position: 'absolute',
    top: darkTheme.spacing.sm,
    right: darkTheme.spacing.sm,
    paddingHorizontal: darkTheme.spacing.sm,
    paddingVertical: 2,
    borderRadius: darkTheme.radius.sm,
  },
  gridBadgeText: {
    fontSize: darkTheme.typography.sizes.xs,
    fontWeight: darkTheme.typography.weights.bold,
    color: darkTheme.colors.text.inverse,
  },
  gridInfo: {
    padding: darkTheme.spacing.md,
  },
  gridBrand: {
    fontSize: darkTheme.typography.sizes.xs,
    color: darkTheme.colors.text.muted,
    marginBottom: 2,
  },
  gridName: {
    fontSize: darkTheme.typography.sizes.sm,
    color: darkTheme.colors.text.primary,
    fontWeight: darkTheme.typography.weights.semibold,
    marginBottom: darkTheme.spacing.xs,
    height: 32,
  },
  gridRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: darkTheme.spacing.xs,
  },
  gridRatingText: {
    fontSize: darkTheme.typography.sizes.xs,
    color: darkTheme.colors.text.secondary,
  },
  gridPrice: {
    fontSize: darkTheme.typography.sizes.md,
    color: darkTheme.colors.accent.neonGreen,
    fontWeight: darkTheme.typography.weights.bold,
  },
});
