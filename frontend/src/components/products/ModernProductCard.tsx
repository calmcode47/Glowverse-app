import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ViewStyle, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import type { Product } from '../../data/products';
import OptimizedImage from '../common/OptimizedImage';
import * as CartAPI from "../../services/api/cart.api";
import { useCart } from "../../context/CartContext";
import { Snackbar } from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;

interface ModernProductCardProps {
    product: Product;
    onPress: () => void;
    style?: ViewStyle;
    width?: number;
}

export default function ModernProductCard({ product, onPress, style, width }: ModernProductCardProps) {
    const { theme } = useTheme();
    const cardWidth = width || CARD_WIDTH;
    const styles = createStyles(theme, cardWidth);

    const [imageError, setImageError] = React.useState(false);
    const [snack, setSnack] = React.useState<string | null>(null);
    const { setCount } = useCart();

    const addToCart = React.useCallback(async () => {
        try {
            await CartAPI.addItem({ productId: product.id, quantity: 1 });
            setCount?.((c: number) => c + 1);
            setSnack("Added to cart");
        } catch (e: any) {
            setSnack(e?.message || "Failed to add");
        }
    }, [product.id, setCount]);

    return (
        <Animated.View entering={FadeInUp.springify()} style={[styles.container, style]}>
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.innerContainer}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    {product.image && !imageError ? (
                        <OptimizedImage uri={product.image} variant="thumb" imageStyle={{ borderRadius: 0 }} />
                    ) : (
                        <View style={styles.placeholder}>
                            <MaterialCommunityIcons name="image-off-outline" size={32} color={theme.colors.text.secondary} />
                        </View>
                    )}
                    {/* Discount Badge */}
                    {product.discount && (
                        <View style={[styles.badge, { backgroundColor: theme.colors.accent.rose }]}>
                            <Text style={styles.badgeText}>-{product.discount}%</Text>
                        </View>
                    )}
                </View>

                {/* Info Section */}
                <View style={styles.info}>
                    <Text style={styles.brand} numberOfLines={1}>{product.brand || "Brand"}</Text>
                    <Text style={styles.name} numberOfLines={2}>{product.name || "Product"}</Text>

                    <View style={styles.footer}>
                        <Text style={styles.price}>${Number(product.price || 0).toFixed(2)}</Text>
                        <TouchableOpacity style={styles.addButton} onPress={addToCart} accessibilityRole="button" accessibilityLabel={`Add ${product.name} to cart`}>
                            <MaterialCommunityIcons name="plus" size={16} color={theme.colors.text.inverse} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Snackbar
                visible={!!snack}
                onDismiss={() => setSnack(null)}
                duration={1500}
                style={{ backgroundColor: theme.colors.accent.emerald }}
            >
                <Text style={{ color: theme.colors.text.inverse }}>{snack}</Text>
            </Snackbar>
        </TouchableOpacity>
        </Animated.View>
    );
}

const createStyles = (theme: any, cardWidth: number) => StyleSheet.create({
    container: {
        width: cardWidth,
        margin: 6,
        backgroundColor: theme.colors.background.elevated,
        borderRadius: 16,
        minHeight: Math.round(cardWidth * 0.6) + 110,
        // Shadow Layer (No Overflow Hidden)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    innerContainer: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.elevated,
        overflow: 'hidden', // Clips content
    },
    imageContainer: {
        height: Math.round(cardWidth * 0.65),
        backgroundColor: theme.colors.background.secondary,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.secondary,
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    info: {
        padding: 12,
        gap: 4,
        minHeight: 76,
    },
    brand: {
        fontSize: 11,
        textTransform: 'uppercase',
        marginBottom: 2,
        letterSpacing: 0.5,
        color: theme.colors.text.secondary,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 8,
        color: theme.colors.text.primary,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    addButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accent.emerald,
    },
});
