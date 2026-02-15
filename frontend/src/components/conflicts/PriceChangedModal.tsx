import React from "react";
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import { formatCurrency } from "../../utils/formatting";
import type { ConflictResolution, SyncConflict } from "../../types/conflicts";

type Props = {
  conflict: SyncConflict;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
};

export default function PriceChangedModal({ conflict, onResolve, onCancel }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const product: any = conflict.localState || {};
  const oldPrice = Number(product?.price ?? 0);
  const newPrice = Number(conflict.serverState?.currentPrice ?? oldPrice);
  const diff = newPrice - oldPrice;
  const isIncrease = diff > 0;
  const currency = "USD";

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityRole="header" accessibilityLabel="Price changed">
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={isIncrease ? "trending-up" : "trending-down"}
              size={40}
              color={isIncrease ? theme.colors.warning : theme.colors.success}
            />
            <Text style={styles.title}>Price Changed</Text>
          </View>
          <View style={styles.card}>
            {product?.image ? <Image source={{ uri: product.image }} style={styles.image} /> : null}
            <View style={styles.info}>
              <Text style={styles.name}>{String(product?.name || "Item")}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Your price</Text>
                <Text style={styles.oldPrice}>{formatCurrency(oldPrice, currency)}</Text>
              </View>
              <View style={styles.arrowRow}>
                <MaterialCommunityIcons
                  name={isIncrease ? "arrow-up" : "arrow-down"}
                  size={18}
                  color={isIncrease ? theme.colors.error : theme.colors.success}
                />
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Current price</Text>
                <Text style={[styles.newPrice, isIncrease ? styles.priceIncrease : styles.priceDecrease]}>
                  {formatCurrency(newPrice, currency)}
                </Text>
              </View>
              <View style={[styles.badge, isIncrease ? styles.badgeWarn : styles.badgeGood]}>
                <Text style={styles.badgeText}>
                  {isIncrease ? "+" : "-"}
                  {formatCurrency(Math.abs(diff), currency)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.message}>
            {isIncrease
              ? "The price has increased. Add this item at the new price?"
              : "Good news! The price decreased. Add to cart at the lower price?"}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primary}
              onPress={() =>
                onResolve({
                  action: "retry_local",
                  modifiedData: { ...(product || {}), price: newPrice }
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Accept new price"
            >
              <Text style={styles.primaryText}>Accept New Price ({formatCurrency(newPrice, currency)})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondary}
              onPress={() => onResolve({ action: "discard" })}
              accessibilityRole="button"
              accessibilityLabel="Remove from queue"
            >
              <Text style={styles.secondaryText}>Remove from Queue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghost} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel">
              <Text style={styles.ghostText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: theme.colors.background.elevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
    title: { color: theme.colors.text.primary, fontWeight: "800", fontSize: 18 },
    card: { flexDirection: "row", gap: 12, paddingVertical: 8 },
    image: { width: 64, height: 64, borderRadius: 8 },
    info: { flex: 1 },
    name: { color: theme.colors.text.primary, fontWeight: "700", marginBottom: 6 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    arrowRow: { alignItems: "center", marginVertical: 4 },
    label: { color: theme.colors.text.secondary },
    oldPrice: { color: theme.colors.text.secondary, textDecorationLine: "line-through", fontWeight: "600" },
    newPrice: { fontWeight: "800" },
    priceIncrease: { color: theme.colors.error },
    priceDecrease: { color: theme.colors.success },
    badge: {
      alignSelf: "flex-start",
      marginTop: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8
    },
    badgeWarn: { backgroundColor: theme.colors.warning + "22" },
    badgeGood: { backgroundColor: theme.colors.success + "22" },
    badgeText: { color: theme.colors.text.primary, fontWeight: "700" },
    message: { color: theme.colors.text.primary, marginTop: 6, marginBottom: 10 },
    actions: { gap: 8, marginTop: 6 },
    primary: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.colors.accent.emerald, borderRadius: 10 },
    primaryText: { color: theme.colors.text.inverse, fontWeight: "800", textAlign: "center" },
    secondary: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    secondaryText: { color: theme.colors.text.primary, fontWeight: "700", textAlign: "center" },
    ghost: { paddingHorizontal: 12, paddingVertical: 10, alignItems: "center" },
    ghostText: { color: theme.colors.text.secondary, fontWeight: "700" }
  });
}

