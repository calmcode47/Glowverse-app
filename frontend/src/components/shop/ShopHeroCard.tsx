import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import type { Product } from "../../data/products";
import OptimizedImage from "../common/OptimizedImage";
import * as CartAPI from "../../services/api/cart.api";
import { useCart } from "../../context/CartContext";
import { Snackbar } from "react-native-paper";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";

type Props = {
  product: Product;
  width: number;
  onPress: () => void;
  scrollX?: any;
  index?: number;
  gap?: number;
};

export default function ShopHeroCard({ product, width, onPress, scrollX, index, gap }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme, width);
  const [snack, setSnack] = React.useState<string | null>(null);
  const { addItemOptimistic, setCount } = useCart();
  const [adding, setAdding] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const outOfStock = !product.inStock;

  const imageStyle = useAnimatedStyle(() => {
    if (!scrollX || typeof index !== "number") return {};
    const interval = width + (gap ?? 16);
    const center = index * interval;
    const n = (scrollX.value - center) / interval;
    const absN = Math.min(Math.abs(n), 1);
    const translateX = interpolate(n, [-1, 0, 1], [28, 0, -28], Extrapolate.CLAMP);
    const scale = interpolate(absN, [0, 1], [1.08, 1], Extrapolate.CLAMP);
    return { transform: [{ translateX }, { scale }] };
  });

  const overlayStyle = useAnimatedStyle(() => {
    if (!scrollX || typeof index !== "number") return {};
    const interval = width + (gap ?? 16);
    const center = index * interval;
    const n = (scrollX.value - center) / interval;
    const absN = Math.min(Math.abs(n), 1);
    const opacity = interpolate(absN, [0, 1], [1, 0.88], Extrapolate.CLAMP);
    return { opacity };
  });

  const add = async () => {
    try {
      if (outOfStock || adding) return;
      setAdding(true);
      if (addItemOptimistic) {
        await addItemOptimistic(product, 1);
      } else {
        await CartAPI.addItem({ productId: product.id, quantity: 1 });
        setCount?.((c: number) => c + 1);
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 800);
      setSnack("Added to cart");
    } catch (e: any) {
      setSnack(e?.message || "Failed to add");
    } finally {
      setAdding(false);
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.touch}>
        <View style={styles.imageWrap}>
          <Animated.View style={[styles.imageLayer, imageStyle]}>
            {product.image ? <OptimizedImage uri={product.image} variant="detail" alt={`${product.name} product image`} imageStyle={styles.imageInner} /> : <View style={styles.placeholder} />}
          </Animated.View>
          <View style={styles.topRow}>
            {product.originalPrice && product.originalPrice > product.price ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</Text>
              </View>
            ) : product.isNew ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.accent.blue }]}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            ) : null}
            <TouchableOpacity onPress={add} disabled={outOfStock || adding} style={[styles.addBtn, (outOfStock || adding) && { opacity: 0.65 }]} accessibilityRole="button" accessibilityLabel="Add to cart">
              {adding ? (
                <ActivityIndicator color={theme.colors.text.inverse} />
              ) : added ? (
                <MaterialCommunityIcons name="check" size={20} color={theme.colors.text.inverse} />
              ) : (
                <>
                  <MaterialCommunityIcons name="cart-plus" size={20} color={theme.colors.text.inverse} />
                  <Text style={styles.addText}>Add</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <Text style={styles.brand} numberOfLines={1}>{product.brand || "Brand"}</Text>
            <Text style={styles.name} numberOfLines={2}>{product.name || "Product"}</Text>
            <View style={styles.footerRow}>
              <Text style={styles.price}>${Number(product.price || 0).toFixed(2)}</Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color={theme.colors.accent.gold} />
                <Text style={styles.ratingText}>{Number(product.rating || 0).toFixed(1)}</Text>
                <Text style={styles.ratingTextMuted}>({product.reviews || 0})</Text>
              </View>
            </View>
            {outOfStock ? <Text style={styles.stockText}>Out of stock</Text> : null}
          </Animated.View>
        </View>
      </TouchableOpacity>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={1200} style={{ backgroundColor: theme.colors.accent.emerald }}>
        <Text style={{ color: theme.colors.text.inverse }}>{snack}</Text>
      </Snackbar>
    </View>
  );
}

function createStyles(theme: any, cardWidth: number) {
  const h = Math.round(cardWidth * 1.18);
  return StyleSheet.create({
    container: {
      width: cardWidth,
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: theme.colors.background.elevated,
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    touch: {
      width: cardWidth
    },
    imageWrap: {
      width: cardWidth,
      height: h,
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: theme.colors.background.secondary
    },
    imageLayer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: -24,
      right: -24
    },
    imageInner: {
      borderRadius: 0
    },
    placeholder: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.background.secondary
    },
    topRow: {
      position: "absolute",
      top: 12,
      left: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 2
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.colors.accent.rose
    },
    badgeText: {
      color: theme.colors.text.inverse,
      fontSize: 12,
      fontWeight: "800"
    },
    addBtn: {
      height: 40,
      paddingHorizontal: 12,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.accent.emerald,
      flexDirection: "row",
      gap: 8
    },
    addText: {
      color: theme.colors.text.inverse,
      fontWeight: "800",
      fontSize: 14
    },
    overlay: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: 16,
      backgroundColor: "rgba(0,0,0,0.38)"
    },
    brand: {
      color: "#fff",
      fontSize: 12,
      textTransform: "uppercase",
      opacity: 0.9
    },
    name: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "800",
      marginTop: 2
    },
    footerRow: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    },
    price: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "800"
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4
    },
    ratingText: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "800"
    },
    ratingTextMuted: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
      opacity: 0.85
    },
    stockText: {
      marginTop: 6,
      color: "#fff",
      fontSize: 13,
      fontWeight: "800",
      opacity: 0.95
    }
  });
}
