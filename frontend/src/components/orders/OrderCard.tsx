import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Order } from "../../services/api/orders.api";

type Props = {
  order: Order;
  onPress: () => void;
};

export default function OrderCard({ order, onPress }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const first = order.items[0]?.product;
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        {first?.image ? <Image source={{ uri: first.image }} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: theme.colors.background.secondary }]} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.number}>#{order.number || order.id}</Text>
          <Text style={styles.meta}>{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</Text>
          <Text style={[styles.status, colorForStatus(theme, order.status)]}>{order.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.total}>${order.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function colorForStatus(theme: any, status: string) {
  switch (status) {
    case "delivered":
      return { color: theme.colors.accent.emerald };
    case "cancelled":
      return { color: theme.colors.error };
    case "shipped":
      return { color: theme.colors.accent.blue || theme.colors.text.primary };
    default:
      return { color: theme.colors.text.secondary };
  }
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12 },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    thumb: { width: 52, height: 52, borderRadius: 8 },
    number: { color: theme.colors.text.primary, fontWeight: "800" },
    meta: { color: theme.colors.text.secondary, marginTop: 2 },
    status: { marginTop: 4, fontWeight: "700" },
    total: { color: theme.colors.text.primary, fontWeight: "900" }
  });
}
