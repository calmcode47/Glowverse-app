import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import type { CartItem as CI } from "../../services/api/cart.api";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";

type Props = {
  item: CI;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  updating?: boolean;
};

export default function CartItem({ item, onIncrease, onDecrease, onRemove, updating }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const outOfStock = item.product ? item.product.inStock === false : false;
  const lowStock = (item.product as any)?.stock && (item.product as any).stock < 10;
  return (
    <View style={styles.container} {...useTestID(TestIDs.CART.ITEM(item.id))}>
      <View style={styles.row}>
        <View style={styles.imageWrap}>
          {item.product.image ? <Image source={{ uri: item.product.image }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]} />}
          {outOfStock ? <View style={[styles.badge, { backgroundColor: theme.colors.error }]}><Text style={styles.badgeText}>Out</Text></View> : null}
          {!outOfStock && lowStock ? <View style={[styles.badge, { backgroundColor: "#F59E0B" }]}><Text style={styles.badgeText}>Low</Text></View> : null}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
          <Text style={styles.brand}>{item.product.brand}</Text>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <View style={styles.controls}>
            <TouchableOpacity onPress={onDecrease} disabled={updating || item.quantity <= 1} style={styles.ctrlBtn}>
              <MaterialCommunityIcons name="minus" size={18} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity onPress={onIncrease} disabled={updating || outOfStock} style={styles.ctrlBtn}>
              <MaterialCommunityIcons name="plus" size={18} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={onRemove} disabled={updating} style={styles.removeBtn}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          {updating ? <View style={styles.updating}><ActivityIndicator /></View> : null}
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      padding: 12
    },
    row: { flexDirection: "row", gap: 12 },
    imageWrap: { width: 96, height: 96, borderRadius: 12, overflow: "hidden" },
    image: { width: "100%", height: "100%" },
    placeholder: { backgroundColor: theme.colors.background.secondary },
    badge: { position: "absolute", left: 6, top: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    badgeText: { color: "#fff", fontWeight: "700", fontSize: 10 },
    info: { flex: 1 },
    name: { color: theme.colors.text.primary, fontWeight: "700" },
    brand: { color: theme.colors.text.tertiary, marginTop: 2, fontSize: 12 },
    price: { color: theme.colors.text.primary, fontWeight: "700", marginTop: 6 },
    controls: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
    ctrlBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: "center", justifyContent: "center" },
    qty: { width: 28, textAlign: "center", color: theme.colors.text.primary, fontWeight: "700" },
    removeBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: "center", justifyContent: "center" },
    updating: { position: "absolute", right: 12, bottom: 12 }
  });
}
