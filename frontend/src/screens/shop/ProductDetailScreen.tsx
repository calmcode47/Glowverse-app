import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import { products } from '../../data/products';
import type { Product } from '../../data/products';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const productId = route?.params?.productId;
  const passedProduct = route?.params?.product;

  // Find the actual product:
  // 1. Use passed product object (from Dashboard/MockData)
  // 2. Find in static products list (from ShopData)
  // 3. Fallback to first product
  const product = passedProduct || products.find(p => p.id === productId) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Prepare images array (use product image or images array)
  const productImages = product.images || (product.image ? [product.image] : []);

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
            {productImages.length > 0 ? productImages.map((imgUrl, idx) => (
              <View key={idx} style={styles.imageContainer}>
                <Image source={{ uri: imgUrl }} style={styles.productImage} />
              </View>
            )) : (
              <View style={styles.imageContainer}>
                <LinearGradient
                  colors={[theme.colors.background.tertiary, theme.colors.background.secondary]}
                  style={styles.imagePlaceholder}
                >
                  <MaterialCommunityIcons name="image-outline" size={80} color={theme.colors.text.tertiary} />
                </LinearGradient>
              </View>
            )}
          </ScrollView>

          {/* Image Indicators */}
          {productImages.length > 1 && (
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
          )}

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
              <Text style={styles.reviewsText}>({product.reviews} reviews)</Text>
            </View>
            {product.isBestseller && (
              <View style={styles.soldBadge}>
                <MaterialCommunityIcons name="fire" size={16} color={theme.colors.accent.rose} />
                <Text style={styles.soldText}>Bestseller</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <>
                <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
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
          )}

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

          {/* Write a Review */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => setShowReviewForm(!showReviewForm)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.accent.emerald} />
              <Text style={styles.writeReviewButtonText}>Write a Review</Text>
              <MaterialCommunityIcons
                name={showReviewForm ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>

            {showReviewForm && (
              <View style={styles.reviewForm}>
                {/* Star Rating Selector */}
                <View style={styles.ratingSelector}>
                  <Text style={styles.ratingLabel}>Your Rating:</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                        <MaterialCommunityIcons
                          name={star <= reviewRating ? 'star' : 'star-outline'}
                          size={32}
                          color={star <= reviewRating ? theme.colors.accent.gold : theme.colors.text.tertiary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Review Text Input */}
                <View style={styles.reviewInputContainer}>
                  <Text style={styles.inputLabel}>Your Review:</Text>
                  <View style={[styles.reviewInput, { borderColor: theme.colors.border.DEFAULT }]}>
                    <Text style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
                      {reviewText || 'Share your experience with this product...'}
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitReviewButton}
                  onPress={() => {
                    setShowReviewForm(false);
                    setReviewText('');
                    setReviewRating(5);
                  }}
                >
                  <LinearGradient
                    colors={theme.colors.gradients.primary}
                    style={styles.submitReviewGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.submitReviewText}>Submit Review</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
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

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.buyNowButton}>
            <LinearGradient
              colors={[theme.colors.accent.gold, theme.colors.accent.rose]}
              style={styles.buyNowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="flash" size={20} color={theme.colors.text.inverse} />
              <Text style={styles.buyNowText}>Buy Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addToCartButton}>
            <LinearGradient colors={theme.colors.gradients.primary} style={styles.addToCartGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <MaterialCommunityIcons name="cart-plus" size={20} color={theme.colors.text.inverse} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
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
    colorSelector: { flexDirection: 'row', gap: theme.spacing.sm },
    colorOption: { paddingHorizontal: theme.spacing.base, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.md, borderWidth: 2, backgroundColor: theme.colors.background.elevated },
    colorOptionActive: { backgroundColor: theme.colors.accent.emerald + '10' },
    colorText: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium },
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
    writeReviewButton: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.base, backgroundColor: theme.colors.background.elevated, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.light, gap: theme.spacing.sm, justifyContent: 'space-between' },
    writeReviewButtonText: { flex: 1, fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.primary },
    reviewForm: { marginTop: theme.spacing.md, padding: theme.spacing.base, backgroundColor: theme.colors.background.elevated, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.light, gap: theme.spacing.md },
    ratingSelector: { gap: theme.spacing.sm },
    ratingLabel: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.medium, color: theme.colors.text.primary },
    stars: { flexDirection: 'row', gap: theme.spacing.xs },
    reviewInputContainer: { gap: theme.spacing.sm },
    inputLabel: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.medium, color: theme.colors.text.primary },
    reviewInput: { minHeight: 100, padding: theme.spacing.base, backgroundColor: theme.colors.background.primary, borderRadius: theme.radius.md, borderWidth: 1, justifyContent: 'flex-start' },
    submitReviewButton: { borderRadius: theme.radius.md, overflow: 'hidden' },
    submitReviewGradient: { paddingVertical: theme.spacing.base, alignItems: 'center', justifyContent: 'center' },
    submitReviewText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.inverse },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: theme.spacing.lg, backgroundColor: theme.colors.background.elevated, borderTopWidth: 1, borderTopColor: theme.colors.border.light, gap: theme.spacing.md, ...theme.shadows.lg },
    quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background.primary, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border.light, padding: 4 },
    quantityButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    quantityText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.text.primary, paddingHorizontal: theme.spacing.md },
    actionButtons: { flex: 1, flexDirection: 'row', gap: theme.spacing.sm },
    buyNowButton: { flex: 2, borderRadius: theme.radius.md, overflow: 'hidden', ...theme.shadows.md },
    buyNowGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.base, gap: theme.spacing.xs },
    buyNowText: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.text.inverse },
    addToCartButton: { width: 50, height: 50, borderRadius: theme.radius.md, overflow: 'hidden', ...theme.shadows.md },
    addToCartGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });
