import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '../../theme/darkTheme';
import type { Product } from '../../data/products';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

interface Product3DCardProps {
    product: Product;
    onPress: () => void;
    index?: number;
}

export default function Product3DCard({ product, onPress, index = 0 }: Product3DCardProps) {
    const rotateY = useSharedValue(0);
    const rotateX = useSharedValue(0);
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Entrance animation
        const delay = index * 100;
        setTimeout(() => {
            scale.value = withSpring(1, { damping: 15, stiffness: 100 });
            opacity.value = withTiming(1, { duration: 400 });
        }, delay);
    }, [index]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Create 3D rotation effect based on gesture
            rotateY.value = interpolate(
                event.translationX,
                [-CARD_WIDTH / 2, CARD_WIDTH / 2],
                [-15, 15]
            );
            rotateX.value = interpolate(
                event.translationY,
                [-200, 200],
                [10, -10]
            );
        })
        .onEnd(() => {
            rotateY.value = withSpring(0);
            rotateX.value = withSpring(0);
        });

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1000 },
            { rotateY: `${rotateY.value}deg` },
            { rotateX: `${rotateX.value}deg` },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const categoryColor = darkTheme.colors.categories[product.category];
    const hasDiscount = product.discount && product.discount > 0;

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.container, animatedCardStyle]}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <LinearGradient
                        colors={darkTheme.colors.gradients.productCard}
                        style={styles.card}
                    >
                        {/* Product Image */}
                        <View style={styles.imageContainer}>
                            {product.image ? (
                                <Image source={{ uri: product.image }} style={styles.image} />
                            ) : (
                                <LinearGradient
                                    colors={[categoryColor + '40', categoryColor + '20']}
                                    style={styles.placeholderImage}
                                >
                                    <MaterialCommunityIcons
                                        name={getCategoryIcon(product.category)}
                                        size={80}
                                        color={categoryColor}
                                    />
                                </LinearGradient>
                            )}

                            {/* Badges */}
                            <View style={styles.badges}>
                                {product.isNew && (
                                    <View style={[styles.badge, { backgroundColor: darkTheme.colors.accent.neonGreen }]}>
                                        <Text style={styles.badgeText}>NEW</Text>
                                    </View>
                                )}
                                {hasDiscount && (
                                    <View style={[styles.badge, { backgroundColor: darkTheme.colors.accent.orange }]}>
                                        <Text style={styles.badgeText}>-{product.discount}%</Text>
                                    </View>
                                )}
                                {product.isFeatured && (
                                    <View style={[styles.badge, { backgroundColor: darkTheme.colors.accent.gold }]}>
                                        <Text style={[styles.badgeText, { color: darkTheme.colors.text.inverse }]}>★</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Product Info */}
                        <View style={styles.info}>
                            <Text style={styles.brand}>{product.brand}</Text>
                            <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

                            {/* Rating */}
                            <View style={styles.rating}>
                                <MaterialCommunityIcons name="star" size={14} color={darkTheme.colors.accent.gold} />
                                <Text style={styles.ratingText}>{product.rating}</Text>
                                <Text style={styles.reviewsText}>({product.reviews})</Text>
                            </View>

                            {/* Price */}
                            <View style={styles.priceContainer}>
                                <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                                {hasDiscount && (
                                    <Text style={styles.originalPrice}>${product.originalPrice?.toFixed(2)}</Text>
                                )}
                            </View>
                        </View>

                        {/* Glow Effect */}
                        <View style={[styles.glow, { backgroundColor: categoryColor, opacity: 0.1 }]} />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
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
        width: CARD_WIDTH,
        marginHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    },
    card: {
        borderRadius: darkTheme.radius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: darkTheme.colors.border.light,
        ...darkTheme.shadows.md,
    },
    imageContainer: {
        width: '100%',
        height: 200,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badges: {
        position: 'absolute',
        top: darkTheme.spacing.md,
        right: darkTheme.spacing.md,
        gap: darkTheme.spacing.xs,
    },
    badge: {
        paddingHorizontal: darkTheme.spacing.sm,
        paddingVertical: 4,
        borderRadius: darkTheme.radius.sm,
        ...darkTheme.shadows.sm,
    },
    badgeText: {
        color: darkTheme.colors.text.primary,
        fontSize: darkTheme.typography.sizes.xs,
        fontWeight: darkTheme.typography.weights.bold,
    },
    info: {
        padding: darkTheme.spacing.base,
    },
    brand: {
        fontSize: darkTheme.typography.sizes.sm,
        color: darkTheme.colors.text.secondary,
        marginBottom: 4,
    },
    name: {
        fontSize: darkTheme.typography.sizes.md,
        color: darkTheme.colors.text.primary,
        fontWeight: darkTheme.typography.weights.semibold,
        marginBottom: darkTheme.spacing.sm,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: darkTheme.spacing.sm,
    },
    ratingText: {
        fontSize: darkTheme.typography.sizes.sm,
        color: darkTheme.colors.text.primary,
        fontWeight: darkTheme.typography.weights.medium,
    },
    reviewsText: {
        fontSize: darkTheme.typography.sizes.xs,
        color: darkTheme.colors.text.muted,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: darkTheme.spacing.sm,
    },
    price: {
        fontSize: darkTheme.typography.sizes.xl,
        color: darkTheme.colors.accent.neonGreen,
        fontWeight: darkTheme.typography.weights.bold,
    },
    originalPrice: {
        fontSize: darkTheme.typography.sizes.base,
        color: darkTheme.colors.text.muted,
        textDecorationLine: 'line-through',
    },
    glow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        borderRadius: darkTheme.radius.xl,
    },
});
