import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList, Alert } from 'react-native';
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
import ProductCard from '../../components/shop/ProductCard';
import { useFavorites } from '../../context/FavoritesContext';
import * as CartAPI from '../../services/api/cart.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

export default function WishlistScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { theme, isDark } = useTheme();
    const { favorites, reload, clearAll, loading } = useFavorites();
    const products = favorites.map(f => f.product);

    const handleNavigateToProduct = (product: any) => {
        navigation.navigate('ProductDetail', { productId: product.id, product });
    };

    const styles = createStyles(theme, isDark);

    if (!loading && products.length === 0) {
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

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <ScrollReveal delay={0} scale springy>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>My Wishlist</Text>
                            <Text style={styles.headerSubtitle}>
                                {products.length} {products.length === 1 ? 'item' : 'items'} saved
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.shareButton} onPress={() => {}}>
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
                  <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    renderItem={({ item, index }) => (
                      <ScrollReveal delay={100 + index * 80} scale springy>
                        <ProductCard product={item} onPress={() => handleNavigateToProduct(item)} />
                      </ScrollReveal>
                    )}
                    ListEmptyComponent={loading ? <Text style={{ color: theme.colors.text.secondary }}>Loading...</Text> : null}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
                </View>

                {/* Action Buttons */}
                <ScrollReveal delay={300 + products.length * 80} scale springy>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton} onPress={async () => {
                          let added = 0;
                          for (const p of products) {
                            try {
                              await CartAPI.addItem({ productId: p.id, quantity: 1 });
                              added++;
                            } catch {}
                          }
                          Alert.alert("Wishlist", `${added} items added to cart`);
                        }}>
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
                            onPress={() => {
                              Alert.alert("Clear Wishlist", "Are you sure you want to remove all items?", [
                                { text: "Cancel" },
                                { text: "Clear", style: "destructive", onPress: () => clearAll() }
                              ]);
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>Clear Wishlist</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// Removed local ProductCard; using shared ProductCard component

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
            paddingHorizontal: theme.spacing.lg,
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
