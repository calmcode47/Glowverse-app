import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import type { Product } from '../../data/products';
import * as ProductsAPI from '../../services/api/products.api';
import * as CartAPI from '../../services/api/cart.api';
import { analytics } from '../../services/analytics.service';
import { useCart } from '../../context/CartContext';
import FavoriteButton from "../../components/common/FavoriteButton";
import OptimizedImage from "../../components/common/OptimizedImage";
import { getCloudinaryUrl } from "../../utils/cloudinaryTransform";
import { usePageAnnouncement } from "../../hooks/usePageAnnouncement";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";
import { useReviewAnalytics } from "../../hooks/analytics/useReviewAnalytics";

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
  const { addItemOptimistic, setCount } = useCart();

  const [product, setProduct] = useState<Product | null>(passedProduct || null);
  const [loading, setLoading] = useState(!passedProduct);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const { trackStarted, trackSubmitted } = useReviewAnalytics();

  React.useEffect(() => {
    if (!productId || passedProduct) return;
    (async () => {
      try {
        setLoading(true);
        const p = await ProductsAPI.getProductById(String(productId));
        setProduct(p);
        if (p.sizes && p.sizes.length) setSelectedSize(p.sizes[0]);
        if (p.colors && p.colors.length) setSelectedColor(p.colors[0]);
        setLoadError(null);
      } catch (e: any) {
        setLoadError(e?.message || 'Product Unavailable');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  React.useEffect(() => {
    if (product) {
      analytics.logViewItem(product);
      analytics.logScreenView('ProductDetail', 'ProductDetailScreen');
    }
  }, [product]);

  const productImages = product?.images || (product?.image ? [product.image] : []);

  const styles = createStyles(theme, isDark);
  usePageAnnouncement("Product Details", product ? `${product.name} product details` : "Product details");

  return (
    <View style={styles.container} {...useTestID(TestIDs.PRODUCT_DETAIL.SCREEN)}>
      <ProfessionalBackground variant="subtle" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!product && loading ? (
          <View style={{ padding: 16 }}>
            <View style={{ height: SCREEN_WIDTH, backgroundColor: theme.colors.background.elevated, borderRadius: 16 }} />
            <View style={{ height: 16 }} />
            <View style={{ height: 14, backgroundColor: theme.colors.background.elevated, borderRadius: 8, width: "60%" }} />
            <View style={{ height: 10 }} />
            <View style={{ height: 14, backgroundColor: theme.colors.background.elevated, borderRadius: 8, width: "40%" }} />
          </View>
        ) : null}
        {loadError && !product ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text.primary, marginBottom: 8 }}>Product Unavailable</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.colors.accent.emerald, borderRadius: 10 }}>
              <Text style={{ color: theme.colors.text.inverse, fontWeight: '700' }}>Back to Shop</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {product ? (
          <>
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
                {productImages.length > 0 ? productImages.map((imgUrl: string, idx: number) => (
                  <View key={idx} style={styles.imageContainer}>
                    <OptimizedImage
                      uri={getCloudinaryUrl(imgUrl, { width: Math.round(SCREEN_WIDTH), height: Math.round(SCREEN_WIDTH), quality: 'auto', format: 'auto' })}
                      width={Math.round(SCREEN_WIDTH)}
                      height={Math.round(SCREEN_WIDTH)}
                      resizeMode="contain"
                      priority={idx === 0 ? 'high' : 'normal'}
                      alt={`${product.name} product image`}
                    />
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
                  {productImages.map((_: string, index: number) => (
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
              <View style={styles.favoriteButton}>
                <FavoriteButton productId={product.id} productName={product.name} price={product.price} size={24} source="product_detail" />
              </View>

              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brand}>{product.brand}</Text>
                  <Text style={styles.productName} {...useTestID(TestIDs.PRODUCT_DETAIL.PRODUCT_NAME)}>{product.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={async () => {
                    if (!product) return;
                    try {
                      const Share = require('react-native-share').default;
                      await Share.open({
                        title: product.name,
                        message: `Check out the ${product.name} on Glowverse!`,
                        url: `https://glowverse.com/products/${product.id}`,
                      });
                    } catch (error) {
                      // Share cancelled or failed
                    }
                  }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Share product"
                  accessibilityHint="Double tap to share this product"
                >
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
                <Text style={styles.price} {...useTestID(TestIDs.PRODUCT_DETAIL.PRODUCT_PRICE)}>${product.price.toFixed(2)}</Text>
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
                    {product.sizes.map((size: string) => (
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
                  {product.features.map((feature: string, index: number) => (
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
                  onPress={() => { const next = !showReviewForm; setShowReviewForm(next); if (next && product) trackStarted(product.id, product.name); }}
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
                        if (product) trackSubmitted(product.id, reviewRating, reviewText.length);
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
          </>
        ) : null}

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

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={async () => {
              if (!product) return;
              try {
                if (addItemOptimistic) {
                  await addItemOptimistic(product, quantity);
                } else {
                  await CartAPI.addItem({ productId: product.id, quantity });
                  await analytics.logAddToCart({
                    id: 'tmp',
                    productId: product.id,
                    product,
                    quantity,
                    price: product.price,
                    total: product.price * quantity
                  } as any);
                  setCount?.((c: number) => c + quantity);
                }
              } catch { }
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Add to cart"
            accessibilityHint="Adds this product to your shopping cart"
            {...useTestID(TestIDs.PRODUCT_DETAIL.ADD_TO_CART_BUTTON)}
          >
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
    shareButton: { width: 44, height: 44, borderRadius: theme.radius.md, backgroundColor: theme.colors.background.elevated, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: 'center', justifyContent: 'center' },
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
