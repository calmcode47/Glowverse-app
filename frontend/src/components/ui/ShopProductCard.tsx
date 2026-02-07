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

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, fullWidth && styles.cardFullWidth, { backgroundColor: bg, borderColor }, animatedStyle]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
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
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    width: 160,
    ...(Platform.OS === "android" ? { elevation: 2 } : {}),
  },
  cardFullWidth: {
    width: "100%",
    maxWidth: "100%",
  },
  imageWrap: {
    width: "100%",
    height: 140,
    backgroundColor: theme.colors.background,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: theme.colors.orange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
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
