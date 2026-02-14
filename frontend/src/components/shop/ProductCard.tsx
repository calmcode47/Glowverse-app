import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import type { Product } from "../../data/products";
import * as CartAPI from "../../services/api/cart.api";
import FavoriteButton from "../common/FavoriteButton";
import { useCart } from "../../context/CartContext";
import QuickVariantModal from "./QuickVariantModal";
import OptimizedImage from "../common/OptimizedImage";
import { a11y, announce, haptic, touchTarget } from "../../utils/a11y";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";

type Props = {
  product: Product;
  onPress?: () => void;
  onAddedToCart?: () => void;
};

function ProductCard({ product, onPress, onAddedToCart }: Props) {
  const { theme } = useTheme();
  const { setCount } = useCart();
  const [adding, setAdding] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [variantOpen, setVariantOpen] = React.useState(false);
  const lowStock = product.inStock && product.features ? false : false;
  const outOfStock = !product.inStock;
  const styles = createStyles(theme);
  const cardTest = useTestID(TestIDs.PRODUCT_LIST.PRODUCT_CARD(product.id));

  const addToCart = async () => {
    try {
      setAdding(true);
      await CartAPI.addItem({ productId: product.id, quantity: 1 });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 800);
      setCount((c) => c + 1);
      onAddedToCart && onAddedToCart();
    } catch {
    } finally {
      setAdding(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={adding}
      {...cardTest}
      {...a11y(`${product.name}, ${product.rating?.toFixed?.(1) ?? product.rating} stars, $${product.price?.toFixed?.(2) ?? product.price}`, { hint: "Opens product details", role: "button", disabled: adding })}
    >
      <View style={styles.imageWrap}>
        {product.image ? (
          <OptimizedImage uri={product.image} variant="thumb" alt={`${product.name} product image`} {...useTestID(TestIDs.PRODUCT_LIST.PRODUCT_CARD_IMAGE(product.id))} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        {outOfStock ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.error + "CC" }]}>
            <Text style={styles.badgeText}>Out of Stock</Text>
          </View>
        ) : null}
        {!outOfStock && lowStock ? (
          <View style={[styles.badge, { backgroundColor: "#F59E0BCC" }]}>
            <Text style={styles.badgeText}>Low Stock</Text>
          </View>
        ) : null}
        <View style={styles.fab}>
          <TouchableOpacity
            onPress={async () => {
              if (product.sizes?.length || product.colors?.length) {
                setVariantOpen(true);
              } else {
                await addToCart();
                announce("Item added to cart");
                haptic("success");
              }
            }}
            disabled={adding || outOfStock}
            style={[styles.fabBtn, touchTarget()]}
            {...a11y(`Add ${product.name} to cart`, { role: "button", disabled: adding || outOfStock })}
          >
            {adding ? (
              <ActivityIndicator color={theme.colors.text.inverse} />
            ) : success ? (
              <MaterialCommunityIcons name="check" size={18} color={theme.colors.text.inverse} />
            ) : (
              <MaterialCommunityIcons name="cart-plus" size={18} color={theme.colors.text.inverse} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={14} color={theme.colors.accent.emerald} />
            <Text style={styles.ratingText}>{product.rating?.toFixed(1)} ({product.reviews})</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.iconBtn}>
          <FavoriteButton productId={product.id} productName={product.name} price={product.price} size={20} source="product_list" />
        </View>
      </View>
      <QuickVariantModal
        visible={variantOpen}
        product={product}
        onAdd={async () => {
          await addToCart();
        }}
        onDismiss={() => setVariantOpen(false)}
      />
    </TouchableOpacity>
  );
}

export default React.memo(ProductCard);

function createStyles(theme: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      overflow: "hidden"
    },
    imageWrap: {
      width: "100%",
      aspectRatio: 1
    },
    image: {
      width: "100%",
      height: "100%"
    },
    imagePlaceholder: {
      backgroundColor: theme.colors.background.secondary
    },
    badge: {
      position: "absolute",
      left: 8,
      top: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8
    },
    badgeText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "600"
    },
    fab: {
      position: "absolute",
      right: 8,
      bottom: 8
    },
    fabBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.accent.emerald
    },
    info: {
      padding: 12,
      gap: 4
    },
    brand: {
      fontSize: 12,
      color: theme.colors.text.tertiary
    },
    name: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text.primary
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4
    },
    price: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text.primary
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4
    },
    ratingText: {
      fontSize: 12,
      color: theme.colors.text.secondary
    },
    actions: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.secondary
    }
  });
}
