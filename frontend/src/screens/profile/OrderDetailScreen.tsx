import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Linking, Share } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as OrdersAPI from "../../services/api/orders.api";
import { useRoute } from "@react-navigation/native";
import OrderStatusTimeline from "../../components/orders/OrderStatusTimeline";
import * as CartAPI from "../../services/api/cart.api";
import { analytics } from "../../services/analytics.service";
import { generateInvoicePdf, shareInvoice } from "../../utils/invoiceGenerator";
import { deepLinkingService } from "../../services/deepLinking.service";

export default function OrderDetailScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const orderId = route.params?.orderId as string;
  const [order, setOrder] = React.useState<OrdersAPI.Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const intervalRef = React.useRef<any>(null);

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

  React.useEffect(() => {
    if (orderId) {
      analytics.logEvent({ name: "order_details_viewed", properties: { order_id: orderId } }).catch(() => {});
    }
  }, [orderId]);

  React.useEffect(() => {
    intervalRef.current = setInterval(async () => {
      try {
        const current = await OrdersAPI.getOrderById(orderId);
        setOrder((prev) => {
          if (prev && prev.status !== current.status) {
            analytics.logEvent({ name: "order_status_changed", properties: { order_id: current.id, status: current.status } }).catch(() => {});
          }
          return current;
        });
      } catch {}
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  const cancel = async () => {
    if (!order) return;
    Alert.alert("Cancel Order", "Are you sure? Refund policy may apply.", [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            setUpdating(true);
            const o = await OrdersAPI.cancelOrder(order.id, "user_requested");
            setOrder(o);
            analytics.logEvent({ name: "order_cancelled", properties: { order_id: order.id } }).catch(() => {});
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
    try {
      const added = await OrdersAPI.reorder(order.id);
      Alert.alert("Reorder", `${added} items added to cart`);
      analytics.logEvent({ name: "reorder_clicked", properties: { order_id: order.id, items: added } }).catch(() => {});
    } catch {
      Alert.alert("Reorder", "Failed to add items");
    }
  };

  const contactSupport = () => {
    if (!order) return;
    const subject = `Order Support Request - ${order.number || order.id.slice(0, 8)}`;
    const body = `Order ID: ${order.id}\nOrder Number: ${order.number || 'N/A'}\nStatus: ${order.status}\n\nPlease describe your issue:\n\n`;
    Linking.openURL(`mailto:support@glowverse.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const downloadInvoice = async () => {
    if (!order) return;
    try {
      const file = await generateInvoicePdf(order);
      await analytics.logEvent({ name: "invoice_downloaded", properties: { order_id: order.id } });
      await Share.share({ url: file.uri, title: "Invoice" });
    } catch {
      try {
        await shareInvoice(order);
      } catch {}
    }
  };

  const shareTracking = async () => {
    if (!order) return;
    const link = deepLinkingService.createUniversalLink(`orders/${order.id}/track`);
    try {
      await Share.share({ message: `Track my order ${order.number || order.id}: ${link}` });
      await analytics.logEvent({ name: "tracking_viewed", properties: { order_id: order.id } });
    } catch {}
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
            <Text style={styles.number}>Order #{order.number || order.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.meta}>{new Date(order.createdAt).toLocaleString()}</Text>
            <Text style={[styles.status, { color: getStatusColor(order.status, theme) }]}>{order.status.toUpperCase()}</Text>
          </View>

          {/* Status Timeline */}
          <View style={styles.card}>
            <OrderStatusTimeline current={toStep(order.status)} />
          </View>

          {/* Tracking Number Section */}
          {order.trackingNumber && (order.status === 'shipped' || order.status === 'delivered') && (
            <View style={styles.card}>
              <Text style={styles.section}>Tracking Information</Text>
              <Text style={styles.trackingLabel}>Tracking Number</Text>
              <TouchableOpacity
                onPress={() => {
                  const trackingUrl = getTrackingUrl(order.trackingNumber!);
                  Linking.openURL(trackingUrl);
                }}
              >
                <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
                <Text style={styles.trackingLink}>Track Package →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Estimated Delivery Section */}
          {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <View style={[styles.card, styles.deliveryCard]}>
              <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
              <Text style={styles.deliveryDate}>
                {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}

          {/* Order Items */}
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

          {/* Shipping Address */}
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

          {/* Order Summary */}
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

          {/* Action Buttons */}
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

          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <TouchableOpacity onPress={downloadInvoice} style={styles.btnOutline}>
              <Text style={styles.btnOutlineText}>Download Invoice</Text>
            </TouchableOpacity>
            {(order.status === "shipped" || order.status === "delivered") ? (
              <TouchableOpacity onPress={shareTracking} style={styles.btnOutline}>
                <Text style={styles.btnOutlineText}>Share Tracking</Text>
              </TouchableOpacity>
            ) : null}
            {order.status === "delivered" ? (
              <TouchableOpacity onPress={() => Alert.alert("Rate Order", "Thanks for your purchase! Ratings coming soon.")} style={styles.btnOutline}>
                <Text style={styles.btnOutlineText}>Rate Order</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Contact Support Button */}
          <TouchableOpacity onPress={contactSupport} style={styles.btnSupport}>
            <Text style={styles.btnSupportText}>📧 Contact Support</Text>
          </TouchableOpacity>

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
    case "placed":
      return "placed";
    default:
      return "payment_confirmed";
  }
}

function getStatusColor(status: OrdersAPI.Order["status"], theme: any): string {
  switch (status) {
    case "delivered":
      return theme.colors.accent.emerald;
    case "shipped":
      return "#2196F3";
    case "processing":
      return "#FF9800";
    case "cancelled":
      return theme.colors.error;
    default:
      return theme.colors.text.primary;
  }
}

function getTrackingUrl(trackingNumber: string): string {
  // UPS tracking numbers start with "1Z"
  if (trackingNumber.startsWith('1Z')) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  }
  // FedEx tracking numbers are 12-14 digits
  if (/^\d{12,14}$/.test(trackingNumber)) {
    return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
  }
  // USPS tracking numbers are 20-22 digits
  if (/^\d{20,22}$/.test(trackingNumber)) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  }
  // Default to UPS
  return `https://www.ups.com/track?tracknum=${trackingNumber}`;
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 },
    title: { fontSize: 20, fontWeight: "800" },
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 12,
      padding: 16
    },
    number: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 20 },
    meta: { color: theme.colors.text.secondary, marginTop: 4, fontSize: 14 },
    status: { marginTop: 8, fontWeight: "800", fontSize: 16 },
    section: { color: theme.colors.text.primary, fontWeight: "800", marginBottom: 12, fontSize: 16 },
    trackingLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 8
    },
    trackingNumber: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: 8,
      letterSpacing: 1,
    },
    trackingLink: {
      fontSize: 14,
      color: theme.colors.accent.emerald,
      fontWeight: "600"
    },
    deliveryCard: {
      backgroundColor: '#E8F5E9',
      borderColor: '#4CAF50',
    },
    deliveryLabel: {
      fontSize: 14,
      color: '#2E7D32',
      marginBottom: 4,
      fontWeight: '600',
    },
    deliveryDate: {
      fontSize: 18,
      fontWeight: "700",
      color: '#2E7D32'
    },
    itemRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border.light },
    thumb: { width: 60, height: 60, borderRadius: 8 },
    itemName: { color: theme.colors.text.primary, fontWeight: "700", fontSize: 15 },
    itemMeta: { color: theme.colors.text.tertiary, marginTop: 4, fontSize: 14 },
    itemPrice: { color: theme.colors.text.primary, fontWeight: "700", fontSize: 16 },
    line: { color: theme.colors.text.secondary, marginBottom: 2 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    label: { color: theme.colors.text.secondary },
    value: { color: theme.colors.text.primary, fontWeight: "800" },
    total: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18 },
    btnOutline: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: "center" },
    btnOutlineText: { color: theme.colors.text.primary, fontWeight: "800" },
    btnPrimary: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: theme.colors.accent.emerald, alignItems: "center" },
    btnPrimaryText: { color: theme.colors.text.inverse, fontWeight: "900" },
    btnSupport: {
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      alignItems: "center",
      marginTop: 4,
    },
    btnSupportText: {
      color: theme.colors.text.primary,
      fontWeight: "700",
      fontSize: 15,
    },
  });
}
