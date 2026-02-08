import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const productImages = [
  { id: '1', uri: null },
  { id: '2', uri: null },
  { id: '3', uri: null },
];

const reviews = [
  {
    id: '1',
    name: 'John Doe',
    rating: 5,
    comment: 'Amazing quality! Exceeded my expectations. Highly recommend.',
    date: '2 days ago',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    rating: 4,
    comment: 'Great product, fast shipping. Very satisfied with my purchase.',
    date: '1 week ago',
  },
];

export default function ProductDetailScreen({ route, navigation }: any) {
  const { theme, isDark } = useTheme();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const product = {
    id: route?.params?.productId || '1',
    name: 'Premium Aviator Sunglasses',
    brand: 'Ray-Ban',
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviewsCount: 324,
    description: 'Classic aviator sunglasses with premium UV protection. Timeless design meets modern comfort. Perfect for any occasion.',
    features: ['UV400 Protection', 'Polarized Lenses', 'Lightweight Frame', 'Scratch Resistant'],
    sizes: ['S', 'M', 'L', 'XL'],
    sold: 2340,
  };

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {productImages.map((img) => (
              <View key={img.id} style={styles.imageContainer}>
                <LinearGradient
                  colors={[theme.colors.background.tertiary, theme.colors.background.secondary]}
                  style={styles.imagePlaceholder}
                >
                  <MaterialCommunityIcons name="sunglasses" size={80} color={theme.colors.text.tertiary} />
                </LinearGradient>
              </View>
            ))}
          </ScrollView>

          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === activeImageIndex ? theme.colors.accent.emerald : theme.colors.border.DEFAULT,
                    width: index === activeImageIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Favorite & Back Buttons */}
          <TouchableOpacity style={styles.favoriteButton} onPress={() => setIsFavorite(!isFavorite)}>
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? theme.colors.accent.rose : theme.colors.text.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.productName}>{product.name}</Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <MaterialCommunityIcons name="share-variant-outline" size={22} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Rating & Stats */}
          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={18} color={theme.colors.accent.gold} />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewsText}>({product.reviewsCount} reviews)</Text>
            </View>
            <View style={styles.soldBadge}>
              <MaterialCommunityIcons name="fire" size={16} color={theme.colors.accent.rose} />
              <Text style={styles.soldText}>{product.sold} sold</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${product.price}</Text>
            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Text>
            </View>
          </View>

          {/* Size Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Size</Text>
            <View style={styles.sizeSelector}>
              {product.sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    selectedSize === size && styles.sizeOptionActive,
                    { borderColor: selectedSize === size ? theme.colors.accent.emerald : theme.colors.border.DEFAULT }
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeText,
                    { color: selectedSize === size ? theme.colors.accent.emerald : theme.colors.text.primary }
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.features}>
              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.accent.emerald} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllLink}>See All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}>
                      <MaterialCommunityIcons name="account" size={20} color={theme.colors.text.tertiary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>{review.name}</Text>
                      <View style={styles.reviewRating}>
                        {[...Array(review.rating)].map((_, i) => (
                          <MaterialCommunityIcons key={i} name="star" size={12} color={theme.colors.accent.gold} />
                        ))}
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <MaterialCommunityIcons name="minus" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(quantity + 1)}>
            <MaterialCommunityIcons name="plus" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartButton}>
          <LinearGradient colors={theme.colors.gradients.primary} style={styles.addToCartGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <MaterialCommunityIcons name="cart-plus" size={22} color={theme.colors.text.inverse} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    scroll: { flex: 1 },
    content: { paddingBottom: 20 },
    imageGallery: { height: SCREEN_WIDTH, position: 'relative' },
    imageContainer: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    imageIndicators: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
    indicator: { height: 8, borderRadius: 4 },
    favoriteButton: { position: 'absolute', top: 60, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.background.elevated, alignItems: 'center', justifyContent: 'center', ...theme.shadows.md },
    backButton: { position: 'absolute', top: 60, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.background.elevated, alignItems: 'center', justifyContent: 'center', ...theme.shadows.md },
    productInfo: { padding: theme.spacing.lg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
    brand: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.tertiary, fontWeight: theme.typography.weights.medium, marginBottom: 4 },
    productName: { fontSize: theme.typography.sizes['2xl'], fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, lineHeight: 32 },
    shareButton: { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.background.elevated, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: 'center', justifyContent: 'center' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.primary },
    reviewsText: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.secondary },
    soldBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.sm, paddingVertical: 4, backgroundColor: theme.colors.accent.rose + '15', borderRadius: theme.radius.sm, gap: 4 },
    soldText: { fontSize: theme.typography.sizes.xs, color: theme.colors.accent.rose, fontWeight: theme.typography.weights.semibold },
    priceContainer: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xl },
    price: { fontSize: theme.typography.sizes['3xl'], fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary },
    originalPrice: { fontSize: theme.typography.sizes.lg, color: theme.colors.text.tertiary, textDecorationLine: 'line-through' },
    discountBadge: { paddingHorizontal: theme.spacing.sm, paddingVertical: 4, backgroundColor: theme.colors.accent.emerald + '20', borderRadius: theme.radius.sm },
    discountText: { fontSize: theme.typography.sizes.xs, color: theme.colors.accent.emerald, fontWeight: theme.typography.weights.bold },
    section: { marginBottom: theme.spacing.xl },
    sectionTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.text.primary, marginBottom: theme.spacing.md },
    sizeSelector: { flexDirection: 'row', gap: theme.spacing.sm },
    sizeOption: { width: 50, height: 50, borderRadius: theme.radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background.elevated },
    sizeOptionActive: { backgroundColor: theme.colors.accent.emerald + '10' },
    sizeText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold },
    features: { gap: theme.spacing.sm },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    featureText: { fontSize: theme.typography.sizes.base, color: theme.colors.text.primary },
    description: { fontSize: theme.typography.sizes.base, color: theme.colors.text.secondary, lineHeight: 24 },
    reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    seeAllLink: { fontSize: theme.typography.sizes.sm, color: theme.colors.accent.emerald, fontWeight: theme.typography.weights.medium },
    reviewsList: { gap: theme.spacing.md },
    reviewCard: { padding: theme.spacing.base, backgroundColor: theme.colors.background.elevated, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.light },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, gap: theme.spacing.sm },
    reviewerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background.tertiary, alignItems: 'center', justifyContent: 'center' },
    reviewerName: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.primary },
    reviewRating: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
    reviewDate: { fontSize: theme.typography.sizes.xs, color: theme.colors.text.tertiary, marginLeft: 6 },
    reviewComment: { fontSize: theme.typography.sizes.sm, color: theme.colors.text.secondary, lineHeight: 20 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: theme.spacing.lg, backgroundColor: theme.colors.background.elevated, borderTopWidth: 1, borderTopColor: theme.colors.border.light, gap: theme.spacing.md, ...theme.shadows.lg },
    quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background.primary, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border.light, padding: 4 },
    quantityButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    quantityText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.primary, paddingHorizontal: theme.spacing.md },
    addToCartButton: { flex: 1, borderRadius: theme.radius.md, overflow: 'hidden', ...theme.shadows.md },
    addToCartGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.base, gap: theme.spacing.sm },
    addToCartText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.inverse },
  });
