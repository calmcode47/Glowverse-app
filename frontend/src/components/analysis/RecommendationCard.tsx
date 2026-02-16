import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import type { Product } from "../../data/products";
import * as CartAPI from "../../services/api/cart.api";
import { useNavigation } from "@react-navigation/native";
import OptimizedImage from "../common/OptimizedImage";
import { formatPrice } from "../../utils/formatting";

type Props = {
  product: Product;
  reason?: string;
};

export default function RecommendationCard({ product, reason }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  return (
    <View style={styles.card}>
      {product.image ? <OptimizedImage uri={product.image} width={64} height={64} variant="thumb" alt={`${product.name} image`} /> : <View style={[styles.image, { backgroundColor: theme.colors.background.secondary }]} accessibilityRole="none" />}
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.reason}>{reason || "Recommended for you"}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{formatPrice(Number(product.price || 0))}</Text>
      <Button mode="outlined" onPress={() => navigation.navigate("ProductDetail", { productId: product.id, product })} accessibilityLabel={`View ${product.name}`} accessibilityRole="button">View</Button>
          <Button mode="contained" compact onPress={() => CartAPI.addItem({ productId: product.id, quantity: 1 })}>Add</Button>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { flexDirection: "row", gap: 10, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 10 },
    image: { width: 64, height: 64, borderRadius: 10 },
    name: { color: theme.colors.text.primary, fontWeight: "800" },
    reason: { color: theme.colors.text.secondary, marginTop: 2, marginBottom: 6 },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    price: { color: theme.colors.text.primary, fontWeight: "800", marginRight: "auto" }
  });
}
