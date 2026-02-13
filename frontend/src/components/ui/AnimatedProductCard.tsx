import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { theme } from "@constants/theme";
import OptimizedImage from "../common/OptimizedImage";
import { getCloudinaryUrl } from "../../utils/cloudinaryTransform";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Product {
    id: string;
    name: string;
    brand?: string;
    price: number;
    image?: string;
    badge?: string;
}

interface AnimatedProductCardProps {
    product: Product;
    onPress: () => void;
    index: number;
    variant?: "light" | "dark";
    width?: number;
}

export default function AnimatedProductCard({
    product,
    onPress,
    index = 0,
    variant = "light",
    width = SCREEN_WIDTH * 0.43,
}: AnimatedProductCardProps) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
    const pressScale = useSharedValue(1);

    useEffect(() => {
        // Staggered entrance animation
        opacity.value = withDelay(
            index * 100,
            withTiming(1, { duration: theme.animation.durations.medium })
        );
        scale.value = withDelay(
            index * 100,
            withSpring(1, { damping: 12, stiffness: 100 })
        );
        translateY.value = withDelay(
            index * 100,
            withSpring(0, { damping: 15, stiffness: 120 })
        );
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value * pressScale.value },
            { translateY: translateY.value },
        ],
    }));

    const handlePressIn = () => {
        pressScale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        pressScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    const isDark = variant === "dark";
    const cardBg = isDark ? theme.colors.surfaceDark : theme.colors.surface;
    const textColor = isDark ? theme.colors.text.inverse : theme.colors.text.primary;

    return (
        <Animated.View style={[styles.container, { width }, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.card, { backgroundColor: cardBg }, theme.shadow.level1]}
            >
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    {product.image ? (
                        <OptimizedImage
                          uri={getCloudinaryUrl(product.image, { width: Math.round(width), height: Math.round(width), quality: 'auto', format: 'auto' })}
                          width={Math.round(width)}
                          height={Math.round(width)}
                          resizeMode="cover"
                          priority="normal"
                        />
                    ) : (
                        <LinearGradient
                            colors={theme.colors.gradient.orange}
                            style={styles.imagePlaceholder}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons name="package-variant" size={40} color={theme.colors.text.inverse} />
                        </LinearGradient>
                    )}

                    {/* Badge */}
                    {product.badge && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{product.badge}</Text>
                        </View>
                    )}

                    {/* Quick Actions Overlay */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="heart-outline" size={20} color={theme.colors.text.inverse} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="cart-plus" size={20} color={theme.colors.text.inverse} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.info}>
                    {product.brand && (
                        <Text style={[styles.brand, { color: theme.colors.text.muted }]} numberOfLines={1}>
                            {product.brand}
                        </Text>
                    )}
                    <Text style={[styles.name, { color: textColor }]} numberOfLines={2}>
                        {product.name}
                    </Text>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.price, { color: theme.colors.orange }]}>
                            ${product.price}
                        </Text>
                        <TouchableOpacity style={styles.addButton}>
                            <MaterialCommunityIcons name="plus" size={18} color={theme.colors.text.inverse} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.scale[3],
    },
    card: {
        borderRadius: theme.radius.lg,
        overflow: "hidden",
    },
    imageContainer: {
        width: "100%",
        aspectRatio: 1,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: theme.colors.orange,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.sm,
    },
    badgeText: {
        color: theme.colors.text.inverse,
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.semibold,
    },
    quickActions: {
        position: "absolute",
        top: 8,
        right: 8,
        gap: 6,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.round,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    info: {
        padding: theme.spacing.scale[3],
    },
    brand: {
        fontSize: theme.typography.fontSizes.xs,
        marginBottom: 2,
    },
    name: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.medium,
        marginBottom: 6,
        lineHeight: theme.typography.fontSizes.sm * theme.typography.lineHeights.tight,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    price: {
        fontSize: theme.typography.fontSizes.md,
        fontWeight: theme.typography.fontWeights.bold,
    },
    addButton: {
        width: 28,
        height: 28,
        borderRadius: theme.radius.round,
        backgroundColor: theme.colors.orange,
        alignItems: "center",
        justifyContent: "center",
    },
});
