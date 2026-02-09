import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    runOnJS,
    Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';
import type { RootStackParamList } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

// Mock wishlist data
const wishlistProducts = [
    {
        id: 'w1',
        name: 'Premium Aviator Sunglasses',
        brand: 'Ray-Ban',
        price: 149.99,
        originalPrice: 187.49,
        image: null,
        badge: 'Sale',
        discount: 20,
    },
    {
        id: 'w2',
        name: 'Smart Watch Pro',
        brand: 'Apple',
        price: 399.99,
        image: null,
        badge: 'New',
    },
    {
        id: 'w3',
        name: 'Leather Wallet',
        brand: 'Gucci',
        price: 289.99,
        image: null,
    },
    {
        id: 'w4',
        name: 'Classic Cologne',
        brand: 'Dior',
        price: 129.99,
        image: null,
        badge: 'Premium',
    },
];

export default function WishlistScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { theme, isDark } = useTheme();
    const [products, setProducts] = useState(wishlistProducts);

    const handleRemove = (id: string) => {
        setProducts(products.filter((p) => p.id !== id));
    };

    const handleNavigateToProduct = (productId: string) => {
        navigation.navigate('ProductDetail', { productId });
    };

    const styles = createStyles(theme, isDark);

    if (products.length === 0) {
        return (
            <View style={styles.container}>
                <ProfessionalBackground variant="subtle" />
                <ScrollReveal delay={0} scale springy>
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <LinearGradient
                                colors={[theme.colors.accent.emerald + '20', theme.colors.accent.blue + '20']}
                                style={styles.emptyIconGradient}
                            >
                                <MaterialCommunityIcons
                                    name="heart-outline"
                                    size={80}
                                    color={theme.colors.accent.emerald}
                                />
                            </LinearGradient>
                        </View>
                        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
                        <Text style={styles.emptySubtitle}>
                            Start adding products you love and build your collection
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('ShopTab' as any)}
                        >
                            <LinearGradient
                                colors={theme.colors.gradients.primary}
                                style={styles.browseButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.browseButtonText}>Browse Products</Text>
                                <MaterialCommunityIcons
                                    name="arrow-right"
                                    size={20}
                                    color={theme.colors.text.inverse}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ProfessionalBackground variant="subtle" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <ScrollReveal delay={0} scale springy>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>My Wishlist</Text>
                            <Text style={styles.headerSubtitle}>
                                {products.length} {products.length === 1 ? 'item' : 'items'} saved
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.shareButton}>
                            <MaterialCommunityIcons
                                name="share-variant"
                                size={22}
                                color={theme.colors.accent.emerald}
                            />
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>

                {/* Products Grid */}
                <View style={styles.grid}>
                    {products.map((product, index) => (
                        <ScrollReveal key={product.id} delay={100 + index * 80} scale springy>
                            <ProductCard
                                product={product}
                                theme={theme}
                                isDark={isDark}
                                onRemove={() => handleRemove(product.id)}
                                onPress={() => handleNavigateToProduct(product.id)}
                            />
                        </ScrollReveal>
                    ))}
                </View>

                {/* Action Buttons */}
                <ScrollReveal delay={300 + products.length * 80} scale springy>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={theme.colors.gradients.primary}
                                style={styles.actionButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <MaterialCommunityIcons
                                    name="cart-plus"
                                    size={22}
                                    color={theme.colors.text.inverse}
                                />
                                <Text style={styles.actionButtonText}>Add All to Cart</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('ShopTab' as any)}
                        >
                            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function ProductCard({ product, theme, isDark, onRemove, onPress }: any) {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const cartScale = useSharedValue(1);
    const cartRotate = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
        ],
        opacity: opacity.value,
    }));

    const cartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: cartScale.value },
            { rotate: `${cartRotate.value}deg` },
        ],
    }));

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;

            // Fade out as swiping left
            if (translateX.value < 0) {
                opacity.value = interpolate(
                    translateX.value,
                    [-CARD_WIDTH, 0],
                    [0, 1],
                    Extrapolate.CLAMP
                );
            }
        })
        .onEnd(() => {
            // If swiped more than 50% of card width, remove
            if (translateX.value < -CARD_WIDTH * 0.5) {
                translateX.value = withTiming(-CARD_WIDTH * 1.5, { duration: 300 });
                opacity.value = withTiming(0, { duration: 300 });
                // Call remove after animation
                setTimeout(() => {
                    runOnJS(onRemove)();
                }, 300);
            } else {
                // Spring back
                translateX.value = withSpring(0, {
                    damping: 15,
                    stiffness: 150,
                });
                opacity.value = withTiming(1, { duration: 200 });
            }
        });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handleAddToCart = () => {
        // Animate cart icon
        cartScale.value = withSpring(1.3, { damping: 10, stiffness: 200 }, () => {
            cartScale.value = withSpring(1);
        });
        cartRotate.value = withSpring(15, { damping: 8 }, () => {
            cartRotate.value = withSpring(-15, { damping: 8 }, () => {
                cartRotate.value = withSpring(0);
            });
        });
    };

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[animatedStyle]}>
                <TouchableOpacity
                    style={[{
                        width: CARD_WIDTH,
                        backgroundColor: theme.colors.background.elevated,
                        borderRadius: theme.radius.xl,
                        borderWidth: 1,
                        borderColor: theme.colors.border.light,
                        overflow: 'hidden',
                        ...theme.shadows.md,
                        marginBottom: theme.spacing.md,
                    }]}
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                >
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 10,
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: theme.colors.background.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...theme.shadows.md,
                        }}
                        onPress={onRemove}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={18}
                            color={theme.colors.error}
                        />
                    </TouchableOpacity>

                    {product.badge && (
                        <View style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            paddingHorizontal: theme.spacing.sm,
                            paddingVertical: 4,
                            borderRadius: theme.radius.sm,
                            zIndex: 10,
                            backgroundColor: product.badge === 'Sale'
                                ? theme.colors.accent.rose
                                : product.badge === 'New'
                                    ? theme.colors.accent.blue
                                    : theme.colors.accent.gold,
                        }}>
                            <Text style={{
                                fontSize: theme.typography.sizes.xs,
                                fontWeight: theme.typography.weights.semibold,
                                color: theme.colors.text.inverse,
                            }}>
                                {product.badge}
                            </Text>
                        </View>
                    )}

                    <View style={{
                        width: '100%',
                        aspectRatio: 1,
                    }}>
                        <LinearGradient
                            colors={[theme.colors.background.tertiary, theme.colors.background.secondary]}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MaterialCommunityIcons
                                name="sunglasses"
                                size={48}
                                color={theme.colors.accent.emerald}
                            />
                        </LinearGradient>
                    </View>

                    <View style={{ padding: theme.spacing.md }}>
                        <Text style={{
                            fontSize: theme.typography.sizes.xs,
                            color: theme.colors.accent.emerald,
                            fontWeight: theme.typography.weights.semibold,
                            marginBottom: 2,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}>
                            {product.brand}
                        </Text>
                        <Text style={{
                            fontSize: theme.typography.sizes.sm,
                            fontWeight: theme.typography.weights.semibold,
                            color: theme.colors.text.primary,
                            marginBottom: theme.spacing.sm,
                            lineHeight: 18,
                        }} numberOfLines={2}>
                            {product.name}
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <View>
                                <Text style={{
                                    fontSize: theme.typography.sizes.lg,
                                    fontWeight: theme.typography.weights.bold,
                                    color: theme.colors.text.primary,
                                }}>
                                    ${product.price}
                                </Text>
                                {product.originalPrice && (
                                    <Text style={{
                                        fontSize: theme.typography.sizes.xs,
                                        color: theme.colors.text.tertiary,
                                        textDecorationLine: 'line-through',
                                    }}>
                                        ${product.originalPrice}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: theme.colors.accent.emerald + '15',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onPress={handleAddToCart}
                            >
                                <Animated.View style={cartAnimatedStyle}>
                                    <MaterialCommunityIcons
                                        name="cart-plus"
                                        size={20}
                                        color={theme.colors.accent.emerald}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
}

const createStyles = (theme: any, isDark: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background.primary,
        },
        scroll: {
            flex: 1,
        },
        content: {
            paddingBottom: 100,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
        },
        headerTitle: {
            fontSize: theme.typography.sizes['3xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
        },
        headerSubtitle: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.secondary,
            marginTop: 4,
        },
        shareButton: {
            width: 48,
            height: 48,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.background.elevated,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadows.sm,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: theme.spacing.lg,
            justifyContent: 'space-between',
        },
        actions: {
            paddingHorizontal: theme.spacing.lg,
            marginTop: theme.spacing.xl,
            gap: theme.spacing.md,
        },
        actionButton: {
            borderRadius: theme.radius.md,
            overflow: 'hidden',
            ...theme.shadows.md,
        },
        actionButtonGradient: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.spacing.md,
            gap: theme.spacing.sm,
        },
        actionButtonText: {
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.inverse,
        },
        secondaryButton: {
            paddingVertical: theme.spacing.md,
            borderRadius: theme.radius.md,
            borderWidth: 2,
            borderColor: theme.colors.accent.emerald,
            alignItems: 'center',
        },
        secondaryButtonText: {
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.accent.emerald,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: theme.spacing['3xl'],
            paddingTop: 100,
        },
        emptyIconContainer: {
            marginBottom: theme.spacing.xl,
        },
        emptyIconGradient: {
            width: 160,
            height: 160,
            borderRadius: 80,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadows.lg,
        },
        emptyTitle: {
            fontSize: theme.typography.sizes['3xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
            textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: theme.spacing.xl,
        },
        browseButton: {
            borderRadius: theme.radius.md,
            overflow: 'hidden',
            ...theme.shadows.lg,
        },
        browseButtonGradient: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            gap: theme.spacing.sm,
        },
        browseButtonText: {
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.inverse,
        },
    });
