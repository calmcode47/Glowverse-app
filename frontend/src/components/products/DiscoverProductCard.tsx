import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue,
    FadeInDown,
    ZoomIn
} from 'react-native-reanimated';
import { useTheme } from '../../theme/themeContext';
import type { Product } from '../../data/products';
import OptimizedImage from '../common/OptimizedImage';
import { getCloudinaryUrl } from '../../utils/cloudinaryTransform';

interface DiscoverProductCardProps {
    product: Product;
    index: number;
    scrollX: SharedValue<number>;
    cardWidth: number;
    cardHeight: number; // Exact calculated height 📏
    itemSize: number;
    onPress: () => void;
    onAddToBag?: () => void;
}

export default function DiscoverProductCard({
    product,
    index,
    scrollX,
    cardWidth,
    cardHeight,
    itemSize,
    onPress,
    onAddToBag,
}: DiscoverProductCardProps) {
    const { theme } = useTheme();
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Pass calculated height to styles
    const styles = createStyles(theme, cardWidth, cardHeight);

    // 1. Professional Scroll Animation 🎢
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * itemSize,
            index * itemSize,
            (index + 1) * itemSize,
        ];

        // Scale: Active 1.0, Side 0.92
        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.92, 1, 0.92],
            Extrapolate.CLAMP
        );

        // Opacity
        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.85, 1, 0.85],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { scale },
            ],
            opacity,
        };
    });

    // 2. Parallax Image Effect 🖼️
    const imageAnimatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * itemSize,
            index * itemSize,
            (index + 1) * itemSize,
        ];

        // Move image slightly inside the card for parallax
        const translateX = interpolate(
            scrollX.value,
            inputRange,
            [-30, 0, 30],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateX }],
        };
    });

    return (
        <Pressable onPress={onPress}>
            {/* Wrapper for layout stability */}
            <View style={styles.layoutContainer}>
                {/* 
                   OUTER SHADOW LAYER 
                   - Has Shadow props
                   - Overflow VISIBLE (Crucial for iOS shadows)
                */}
                <Animated.View
                    style={[styles.shadowLayer, animatedStyle]}
                    entering={FadeInDown.delay(index * 100).springify().damping(12)}
                >
                    {/* 
                       INNER CONTENT LAYER
                       - Has Border Radius
                       - Overflow HIDDEN (Clips image/content)
                       - Background White
                    */}
                    <View style={styles.contentLayer}>
                        {/* Product Image with Parallax & Fallback */}
                        <View style={styles.imageContainer}>
                            {product.image && !imageError ? (
                                <Animated.View style={[styles.productImage, imageAnimatedStyle]}>
                                  <OptimizedImage
                                    uri={getCloudinaryUrl(product.image, { width: Math.round(cardWidth * 1.2), height: Math.round(cardHeight * 0.65), quality: 'auto', format: 'auto' })}
                                    width={Math.round(cardWidth * 1.2)}
                                    height={Math.round(cardHeight * 0.65)}
                                    resizeMode="cover"
                                    priority="normal"
                                  />
                                </Animated.View>
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <MaterialCommunityIcons
                                        name="image-off-outline"
                                        size={40}
                                        color={theme.colors.text.muted}
                                        style={{ opacity: 0.5 }}
                                    />
                                </View>
                            )}

                            {/* Gradient Overlay */}
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
                                style={styles.gradientOverlay}
                            />

                            {/* Favorite Button */}
                            <Animated.View
                                entering={ZoomIn.delay(index * 100 + 300).springify()}
                                style={styles.favoriteButtonContainer}
                            >
                                <TouchableOpacity
                                    style={styles.favoriteButton}
                                    onPress={() => setIsFavorite(!isFavorite)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons
                                        name={isFavorite ? 'heart' : 'heart-outline'}
                                        size={22}
                                        color={isFavorite ? theme.colors.accent.rose : '#333'}
                                    />
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Badges */}
                            <View style={styles.badgesContainer}>
                                {product.isNew && (
                                    <View style={[styles.badge, { backgroundColor: theme.colors.accent.emerald }]}>
                                        <Text style={styles.badgeText}>New</Text>
                                    </View>
                                )}
                                {product.discount && (
                                    <View style={[styles.badge, { backgroundColor: theme.colors.accent.rose }]}>
                                        <Text style={styles.badgeText}>-{product.discount}%</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Product Info */}
                        <View style={styles.infoContainer}>
                            <View style={styles.productInfo}>
                                <Text style={styles.brandName}>{product.brand}</Text>
                                <Text style={styles.productName} numberOfLines={1}>
                                    {product.name}
                                </Text>

                                <View style={styles.priceRow}>
                                    <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                                    {product.originalPrice && (
                                        <Text style={styles.originalPrice}>
                                            ${product.originalPrice.toFixed(2)}
                                        </Text>
                                    )}
                                </View>

                                {/* Rating */}
                                <View style={styles.ratingContainer}>
                                    <MaterialCommunityIcons
                                        name="star"
                                        size={14}
                                        color={theme.colors.accent.gold}
                                    />
                                    <Text style={styles.ratingText}>{product.rating}</Text>
                                </View>
                            </View>

                            {/* Add to Bag Button */}
                            <View style={styles.addToBagContainer}>
                                <TouchableOpacity
                                    style={styles.addToBagButton}
                                    onPress={onAddToBag}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={theme.colors.gradients.primary}
                                        style={styles.addToBagGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <MaterialCommunityIcons name="shopping" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Pressable>
    );
}

const createStyles = (theme: any, cardWidth: number, cardHeight: number) =>
    StyleSheet.create({
        layoutContainer: {
            width: cardWidth,
            height: cardHeight,
            marginHorizontal: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        shadowLayer: {
            width: '100%',
            height: '100%',
            backgroundColor: '#fff', // Must match contentLayer for correct shadow
            // iOS Shadow Props
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 12,
            },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            // Android Elevation
            elevation: 10,
            // CRITICAL: Overflow visible allows shadow to spill out
            overflow: 'visible',
            borderRadius: 28,
        },
        contentLayer: {
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 28,
            // CRITICAL: Overflow hidden clips the image/content
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.03)',
        },
        imageContainer: {
            height: '65%', // Keeping this percentage based on card height
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
        },
        productImage: {
            width: '120%',
            height: '100%',
            marginLeft: '-10%',
        },
        placeholderContainer: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.background.secondary,
        },
        gradientOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 140,
        },
        favoriteButtonContainer: {
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
        },
        favoriteButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.95)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        badgesContainer: {
            position: 'absolute',
            top: 16,
            left: 16,
            flexDirection: 'row',
            gap: 8,
        },
        badge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        badgeText: {
            color: '#fff',
            fontSize: 11,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        infoContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingBottom: 20,
            paddingTop: 12,
            backgroundColor: '#fff',
        },
        productInfo: {
            flex: 1,
            paddingRight: 16,
        },
        brandName: {
            fontSize: 12,
            fontWeight: '700',
            color: theme.colors.text.tertiary,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
        },
        productName: {
            fontSize: 20,
            fontWeight: '800',
            color: theme.colors.text.primary,
            marginBottom: 8,
            letterSpacing: -0.5,
            lineHeight: 24,
        },
        priceRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 8,
        },
        price: {
            fontSize: 24,
            fontWeight: '800',
            color: theme.colors.text.primary,
        },
        originalPrice: {
            fontSize: 15,
            fontWeight: '500',
            color: theme.colors.text.tertiary,
            textDecorationLine: 'line-through',
        },
        ratingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.colors.background.tertiary,
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
        },
        ratingText: {
            fontSize: 13,
            fontWeight: '700',
            color: theme.colors.text.primary,
        },
        reviewsText: {
            fontSize: 12,
            color: theme.colors.text.secondary,
        },
        addToBagContainer: {
        },
        addToBagButton: {
            width: 56,
            height: 56,
            borderRadius: 28,
            overflow: 'hidden',
            shadowColor: theme.colors.accent.emerald,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
        addToBagGradient: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
