import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import type { Product } from '../../data/products';
import OptimizedImage from '../common/OptimizedImage';

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

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.innerContainer}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    {product.image && !imageError ? (
                        <OptimizedImage uri={product.image} variant="thumb" />
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
                    <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
                    <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

                    <View style={styles.footer}>
                        <Text style={styles.price}>${product.price}</Text>
                        <TouchableOpacity style={styles.addButton}>
                            <MaterialCommunityIcons name="plus" size={16} color={theme.colors.text.inverse} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (theme: any, cardWidth: number) => StyleSheet.create({
    container: {
        width: cardWidth,
        margin: 6,
        backgroundColor: theme.colors.background.elevated,
        borderRadius: 16,
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
        overflow: 'hidden', // Clips content
    },
    imageContainer: {
        height: 160,
        backgroundColor: '#F5F5F5',
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
        backgroundColor: theme.colors.background.elevated,
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
    },
    brand: {
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 2,
        letterSpacing: 0.5,
        color: theme.colors.text.secondary,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        height: 40,
        color: theme.colors.text.primary,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.accent.emerald,
    },
    addButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.text.primary,
    },
});
