import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { theme } from "@constants/theme";
import type { Product } from "@constants/mockData";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ShopProductCardProps = {
  product: Product;
  variant?: "dark" | "light";
  onPress?: () => void;
  fullWidth?: boolean;
};

export default function ShopProductCard({ product, variant = "light", onPress, fullWidth }: ShopProductCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDark = variant === "dark";
  const bg = isDark ? theme.colors.surfaceDark : theme.colors.surface;
  const borderColor = theme.colors.borderOrange;

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 150 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const [imageError, setImageError] = React.useState(false);

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        fullWidth && styles.cardFullWidth,
        animatedStyle
      ]}
    >
      <View style={[styles.innerContainer, { backgroundColor: bg, borderColor }]}>
        <View style={styles.imageWrap}>
          {product.image && !imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons
                name="image-off-outline"
                size={32}
                color={theme.colors.text.muted}
              />
            </View>
          )}
          {product.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.content}>
          <Text style={[styles.name, isDark && styles.textLight]} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.row}>
            <View style={styles.stars}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={theme.colors.orange}
              />
              <Text style={[styles.rating, isDark && styles.textMuted]}>
                {product.rating}
              </Text>
            </View>
            <Text style={[styles.price, isDark && styles.textLight]}>
              ${product.price.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  // Outer layer: Handles Shadow & Layout
  card: {
    width: 160,
    backgroundColor: theme.colors.surface, // Matches inner container for correct shadow casting
    borderRadius: theme.radius.lg,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android Elevation
    elevation: 4,
  },
  cardFullWidth: {
    width: "100%",
    maxWidth: "100%",
  },
  // Inner layer: Handles Content Clipping & Background
  innerContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface, // Default bg
    borderRadius: theme.radius.lg,
    overflow: "hidden", // Clips the image
    borderWidth: 1,
  },
  imageWrap: {
    width: "100%",
    height: 140,
    backgroundColor: theme.colors.background,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: theme.colors.orange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.text.inverse,
  },
  content: {
    padding: theme.spacing.scale[2],
  },
  name: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  textLight: {
    color: theme.colors.text.inverse,
  },
  textMuted: {
    color: theme.colors.text.muted,
  },
  price: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "700",
    color: theme.colors.orange,
  },
});
