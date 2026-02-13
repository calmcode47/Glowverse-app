import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as OrdersAPI from "../../services/api/orders.api";
import { useRoute } from "@react-navigation/native";
import OrderStatusTimeline from "../../components/orders/OrderStatusTimeline";
import * as CartAPI from "../../services/api/cart.api";

export default function OrderDetailScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const orderId = route.params?.orderId as string;
  const [order, setOrder] = React.useState<OrdersAPI.Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const o = await OrdersAPI.getOrderById(orderId);
      setOrder(o);
    } catch (e: any) {
      setError(e?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const cancel = async () => {
    if (!order) return;
    Alert.alert("Cancel Order", "Are you sure? Refund policy may apply.", [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            setUpdating(true);
            const o = await OrdersAPI.cancelOrder(order.id);
            setOrder(o);
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to cancel");
          } finally {
            setUpdating(false);
          }
        }
      }
    ]);
  };

  const reorder = async () => {
    if (!order) return;
    let added = 0;
    for (const it of order.items) {
      try {
        await CartAPI.addItem({ productId: it.productId, variantId: it.variantId, quantity: it.quantity });
        added += it.quantity;
      } catch {}
    }
    Alert.alert("Reorder", `${added} items added to cart`);
  };

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Order Details</Text>
      </View>
      {loading || !order ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <View style={styles.card}>
            <Text style={styles.number}>Order #{order.number || order.id}</Text>
            <Text style={styles.meta}>{new Date(order.createdAt).toLocaleString()}</Text>
            <Text style={[styles.status, { color: theme.colors.text.primary }]}>{order.status.toUpperCase()}</Text>
          </View>
          <View style={styles.card}>
            <OrderStatusTimeline current={toStep(order.status)} />
          </View>
          <View style={styles.card}>
            <Text style={styles.section}>Items</Text>
            {order.items.map((it, idx) => (
              <View key={`${it.productId}-${idx}`} style={styles.itemRow}>
                {it.product?.image ? <Image source={{ uri: it.product.image }} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: theme.colors.background.secondary }]} />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={2}>{it.product?.name || it.productId}</Text>
                  <Text style={styles.itemMeta}>Qty: {it.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>${((it.price || 0) * it.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.section}>Shipping</Text>
            {order.shippingAddress ? (
              <>
                <Text style={styles.line}>{order.shippingAddress.fullName}</Text>
                <Text style={styles.line}>{order.shippingAddress.street}</Text>
                <Text style={styles.line}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</Text>
                <Text style={styles.line}>{order.shippingAddress.country}</Text>
              </>
            ) : null}
          </View>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>${order.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tax</Text>
              <Text style={styles.value}>${order.tax.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Shipping</Text>
              <Text style={styles.value}>${order.shipping.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.total}>Total</Text>
              <Text style={styles.total}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {order.status !== "cancelled" && order.status !== "delivered" ? (
              <TouchableOpacity onPress={cancel} disabled={updating} style={styles.btnOutline}>
                <Text style={styles.btnOutlineText}>{updating ? "Cancelling..." : "Cancel Order"}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={reorder} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Reorder</Text>
            </TouchableOpacity>
          </View>
          {error ? <Text style={{ color: theme.colors.error }}>{error}</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

function toStep(status: OrdersAPI.Order["status"]) {
  switch (status) {
    case "delivered":
      return "delivered";
    case "shipped":
      return "shipped";
    case "processing":
      return "processing";
    default:
      return "ordered";
  }
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 },
    title: { fontSize: 20, fontWeight: "800" },
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12 },
    number: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18 },
    meta: { color: theme.colors.text.secondary, marginTop: 4 },
    status: { marginTop: 6, fontWeight: "800" },
    section: { color: theme.colors.text.primary, fontWeight: "800", marginBottom: 6 },
    itemRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    thumb: { width: 52, height: 52, borderRadius: 8 },
    itemName: { color: theme.colors.text.primary, fontWeight: "700" },
    itemMeta: { color: theme.colors.text.tertiary, marginTop: 2 },
    itemPrice: { color: theme.colors.text.primary, fontWeight: "700" },
    line: { color: theme.colors.text.secondary },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    label: { color: theme.colors.text.secondary },
    value: { color: theme.colors.text.primary, fontWeight: "800" },
    total: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18 },
    btnOutline: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: "center" },
    btnOutlineText: { color: theme.colors.text.primary, fontWeight: "800" },
    btnPrimary: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.colors.accent.emerald, alignItems: "center" },
    btnPrimaryText: { color: theme.colors.text.inverse, fontWeight: "900" }
  });
}
