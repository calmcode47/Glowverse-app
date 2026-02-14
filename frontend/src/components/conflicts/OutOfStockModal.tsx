import React from "react";
import { Modal, View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import type { ConflictResolution, SyncConflict } from "../../types/conflicts";

type Props = {
  conflict: SyncConflict;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
};

export default function OutOfStockModal({ conflict, onResolve, onCancel }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const product: any = conflict.localState || {};

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityRole="dialog" accessibilityLabel="Item unavailable">
          <View style={styles.header}>
            <MaterialCommunityIcons name="package-variant-remove" size={40} color={theme.colors.error} />
            <Text style={styles.title}>Item Unavailable</Text>
          </View>
          <View style={styles.card}>
            {product?.image ? <Image source={{ uri: product.image }} style={styles.image} /> : null}
            <View style={styles.info}>
              <Text style={styles.name}>{String(product?.name || "Item")}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Out of Stock</Text>
              </View>
            </View>
          </View>
          <Text style={styles.message}>This item is currently unavailable and cannot be added to your cart.</Text>
          <Text style={styles.optionsTitle}>What would you like to do?</Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => onResolve({ action: "discard" })}
              accessibilityRole="button"
              accessibilityLabel="Add to wishlist"
            >
              <MaterialCommunityIcons name="heart" size={18} color={theme.colors.text.primary} />
              <Text style={styles.optionText}>Add to Wishlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => onResolve({ action: "discard" })}
              accessibilityRole="button"
              accessibilityLabel="Remove from queue"
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={theme.colors.text.primary} />
              <Text style={styles.optionText}>Remove from Queue</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.ghost} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Close">
            <Text style={styles.ghostText}>Close</Text>
          </TouchableOpacity>
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
    info: { flex: 1, gap: 8 },
    name: { color: theme.colors.text.primary, fontWeight: "700" },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: theme.colors.error + "22"
    },
    badgeText: { color: theme.colors.error, fontWeight: "800" },
    message: { color: theme.colors.text.primary, marginTop: 6, marginBottom: 10 },
    optionsTitle: { color: theme.colors.text.secondary, fontWeight: "700", marginBottom: 6 },
    options: { gap: 8 },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: 10
    },
    optionText: { color: theme.colors.text.primary, fontWeight: "700" },
    ghost: { paddingHorizontal: 12, paddingVertical: 10, alignItems: "center", marginTop: 6 },
    ghostText: { color: theme.colors.text.secondary, fontWeight: "700" }
  });
}

