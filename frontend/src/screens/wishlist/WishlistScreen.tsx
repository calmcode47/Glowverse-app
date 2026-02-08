import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';
import type { RootStackParamList } from '../../navigation/types';

// Mock wishlist data
const wishlistProducts = [
    {
        id: 'w1',
        name: 'Premium Aviator Sunglasses',
        brand: 'Ray-Ban',
        price: 149.99,
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
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                        <MaterialCommunityIcons
                            name="heart-outline"
                            size={80}
                            color={theme.colors.text.tertiary}
                        />
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
                <ScrollReveal delay={0}>
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
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>

                {/* Products Grid */}
                <View style={styles.grid}>
                    {products.map((product, index) => (
                        <ScrollReveal key={product.id} delay={100 + index * 50}>
                            <View style={styles.productCard}>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemove(product.id)}
                                >
                                    <MaterialCommunityIcons
                                        name="close-circle"
                                        size={24}
                                        color={theme.colors.error}
                                    />
                                </TouchableOpacity>

                                {product.badge && (
                                    <View style={[styles.badge, {
                                        backgroundColor: product.badge === 'Sale'
                                            ? theme.colors.accent.rose
                                            : theme.colors.accent.emerald
                                    }]}>
                                        <Text style={styles.badgeText}>{product.badge}</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.productImageContainer}
                                    onPress={() => handleNavigateToProduct(product.id)}
                                >
                                    <LinearGradient
                                        colors={[theme.colors.background.tertiary, theme.colors.background.secondary]}
                                        style={styles.productImage}
                                    >
                                        <MaterialCommunityIcons
                                            name="sunglasses"
                                            size={48}
                                            color={theme.colors.text.tertiary}
                                        />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.productInfo}>
                                    <Text style={styles.productBrand}>{product.brand}</Text>
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {product.name}
                                    </Text>
                                    <View style={styles.productFooter}>
                                        <View>
                                            <Text style={styles.productPrice}>${product.price}</Text>
                                            {product.discount && (
                                                <Text style={styles.productDiscount}>
                                                    {product.discount}% off
                                                </Text>
                                            )}
                                        </View>
                                        <TouchableOpacity style={styles.addToCartButton}>
                                            <MaterialCommunityIcons
                                                name="cart-plus"
                                                size={20}
                                                color={theme.colors.accent.emerald}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollReveal>
                    ))}
                </View>

                {/* Action Buttons */}
                <ScrollReveal delay={300 + products.length * 50}>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={theme.colors.gradients.primary}
                                style={styles.actionButtonGradient}
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
            paddingTop: theme.spacing.md,
            marginBottom: theme.spacing.xl,
        },
        headerTitle: {
            fontSize: theme.typography.sizes['2xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
        },
        headerSubtitle: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.secondary,
            marginTop: 4,
        },
        shareButton: {
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.background.elevated,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
        },
        productCard: {
            width: '48%',
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.radius.xl,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            overflow: 'hidden',
            ...theme.shadows.sm,
        },
        removeButton: {
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            backgroundColor: theme.colors.background.primary,
            borderRadius: 12,
            ...theme.shadows.md,
        },
        badge: {
            position: 'absolute',
            top: 8,
            left: 8,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.radius.sm,
            zIndex: 10,
        },
        badgeText: {
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.inverse,
        },
        productImageContainer: {
            width: '100%',
            aspectRatio: 1,
        },
        productImage: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        productInfo: {
            padding: theme.spacing.base,
        },
        productBrand: {
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.text.tertiary,
            fontWeight: theme.typography.weights.medium,
            marginBottom: 2,
        },
        productName: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
            lineHeight: 18,
        },
        productFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        productPrice: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
        },
        productDiscount: {
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.accent.rose,
            fontWeight: theme.typography.weights.medium,
        },
        addToCartButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.accent.emerald + '15',
            alignItems: 'center',
            justifyContent: 'center',
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
            paddingVertical: theme.spacing.base,
            gap: theme.spacing.sm,
        },
        actionButtonText: {
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.inverse,
        },
        secondaryButton: {
            paddingVertical: theme.spacing.base,
            borderRadius: theme.radius.md,
            borderWidth: 2,
            borderColor: theme.colors.border.DEFAULT,
            alignItems: 'center',
        },
        secondaryButtonText: {
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.primary,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: theme.spacing['3xl'],
        },
        emptyIcon: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.background.elevated,
            borderWidth: 2,
            borderColor: theme.colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.xl,
        },
        emptyTitle: {
            fontSize: theme.typography.sizes['2xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: theme.spacing.xl,
        },
        browseButton: {
            borderRadius: theme.radius.md,
            overflow: 'hidden',
            ...theme.shadows.md,
        },
        browseButtonGradient: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.base,
            gap: theme.spacing.sm,
        },
        browseButtonText: {
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.inverse,
        },
    });
