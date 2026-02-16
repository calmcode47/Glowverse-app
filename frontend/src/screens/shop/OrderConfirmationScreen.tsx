import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Share, Dimensions } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as OrdersAPI from "../../services/api/orders.api";
import { useRoute, useNavigation } from "@react-navigation/native";
import GradientButton from "../../components/ui/GradientButton";
import * as Clipboard from "expo-clipboard";
import { analytics } from "../../services/analytics.service";
import { deepLinkingService } from "../../services/deepLinking.service";
import { sendOrderConfirmationEmail } from "../../services/notificationService";
import * as CartAPI from "../../services/api/cart.api";

export default function OrderConfirmationScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId as string;
  const [order, setOrder] = React.useState<OrdersAPI.Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [countdown, setCountdown] = React.useState(30);
  const containerRef = React.useRef<View>(null);
  const [Confetti, setConfetti] = React.useState<any>(null);
  const { width } = Dimensions.get("window");

  // Animation for success icon
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    (async () => {
      try {
        const o = await OrdersAPI.getOrderById(orderId);
        setOrder(o);

        // Animate success icon
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }).start();
        try {
          await analytics.logEvent({ name: "order_confirmation_viewed", properties: { order_id: orderId } });
        } catch {}
        try {
          await sendOrderConfirmationEmail(orderId);
        } catch {}
        try {
          const Haptics: any = (require as any)("expo-haptics");
          await Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          navigation.navigate("MainTabs", { screen: "HomeTab" });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    try {
      const mod = (require as any)("react-native-confetti-cannon");
      setConfetti(mod?.default || mod);
    } catch {}
  }, []);

  const copyOrderNumber = async () => {
    if (!order) return;
    const num = `#${order.number || order.id.slice(0, 8).toUpperCase()}`;
    await Clipboard.setStringAsync(num);
  };

  const shareOrder = async () => {
    if (!order) return;
    const link = deepLinkingService.createUniversalLink(`orders/${order.id}/track`);
    try {
      await Share.share({
        title: "My Glowverse Order",
        message: `Order ${order.number || order.id}\nTotal: $${order.total.toFixed(2)}\nTrack: ${link}`,
      });
      await analytics.logEvent({ name: "order_shared", properties: { order_id: order.id } });
    } catch {}
  };

  const shareScreenshot = async () => {
    try {
      const viewShot = (require as any)("react-native-view-shot");
      const fs = (require as any)("expo-file-system");
      const sharing = (require as any)("expo-sharing");
      const uri: string = await viewShot.captureRef(containerRef, { format: "png", quality: 0.9 });
      if (await sharing.isAvailableAsync()) {
        await sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share Order" });
      } else {
        await Share.share({ url: uri, title: "Order Confirmation" });
      }
    } catch {
      await shareOrder();
    }
  };

  return (
    <View style={styles.container} ref={containerRef as any}>
      <ProfessionalBackground variant="subtle" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Order Confirmed</Text>
      </View>
      {loading || !order ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {/* Success Icon */}
          <View style={styles.successContainer}>
            <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
            {Confetti ? <Confetti count={120} origin={{ x: width / 2, y: -10 }} fadeOut autoStart /> : null}
            <Text style={styles.successTitle}>Order Placed Successfully!</Text>
            <Text style={styles.successSubtitle}>
              Thank you for your order. We'll send you a confirmation email shortly.
            </Text>
          </View>

          {/* Order Number */}
          <View style={styles.card}>
            <Text style={styles.label}>Order Number</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={styles.bigNumber}>#{order.number || order.id.slice(0, 8).toUpperCase()}</Text>
              <TouchableOpacity onPress={copyOrderNumber} style={styles.copyBtn}>
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            </View>
            {order.estimatedDelivery ? (
              <Text style={styles.note}>
                Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
              </Text>
            ) : null}
          </View>

          {/* Summary Card */}
          <View style={styles.card}>
            <Text style={styles.section}>Summary</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Placed</Text>
              <Text style={styles.value}>{new Date(order.createdAt).toLocaleString()}</Text>
            </View>
            {order.shippingAddress ? (
              <View style={styles.row}>
                <Text style={styles.label}>Delivery</Text>
                <Text style={[styles.value, { flex: 1, textAlign: "right" }]} numberOfLines={2}>
                  {order.shippingAddress.street}, {order.shippingAddress.city}
                </Text>
              </View>
            ) : null}
            {order.paymentMethod ? (
              <View style={styles.row}>
                <Text style={styles.label}>Payment</Text>
                <Text style={styles.value}>{order.paymentMethod}</Text>
              </View>
            ) : null}
            <View style={styles.row}>
              <Text style={styles.label}>Total</Text>
              <Text style={styles.value}>${order.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Items list */}
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setExpanded((v) => !v)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={styles.section}>Items</Text>
              <Text style={styles.link}>{expanded ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
            {expanded ? (
              <View style={{ gap: 12 }}>
                {order.items.map((it, idx) => (
                  <View key={`${it.productId}-${idx}`} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.line} numberOfLines={1}>{it.product?.name || it.productId}</Text>
                    <Text style={styles.line}>x{it.quantity}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Email Notice */}
          <View style={styles.card}>
            <Text style={styles.stepText}>An email confirmation has been sent.</Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
            <GradientButton title="View Order Details" onPress={() => {
              analytics.logEvent({ name: "order_details_viewed", properties: { order_id: order.id } }).catch(() => {});
              navigation.navigate("OrderDetail", { orderId: order.id });
            }} size="small" />
            {(order.shippingAddress || order.trackingNumber) ? (
              <GradientButton title="Track Order" onPress={() => {
                analytics.logEvent({ name: "tracking_viewed", properties: { order_id: order.id } }).catch(() => {});
                navigation.navigate("OrderTracking", { orderId: order.id });
              }} size="small" />
            ) : null}
            <TouchableOpacity onPress={shareOrder} style={styles.btnOutline}>
              <Text style={styles.btnOutlineText}>Share Order</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => {
              try { await CartAPI.clearCart(); } catch {}
              navigation.navigate("MainTabs", { screen: "HomeTab" });
            }} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("OrderHistory")} style={styles.btnLink}>
            <Text style={styles.btnLinkText}>View All Orders</Text>
          </TouchableOpacity>
          <Text style={styles.countdownText}>Returning to Home in {countdown}s</Text>
        </ScrollView>
      )}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 },
    title: { fontSize: 20, fontWeight: "800" },
    successContainer: { alignItems: "center", paddingVertical: 20 },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.accent.emerald,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    checkmark: { fontSize: 48, color: "#FFFFFF", fontWeight: "bold" },
    successTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text.primary,
      marginBottom: 8,
      textAlign: "center",
    },
    successSubtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 12,
      padding: 16
    },
    label: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 4
    },
    bigNumber: {
      color: theme.colors.accent.emerald,
      fontWeight: "900",
      fontSize: 24,
      marginBottom: 4,
    },
    note: { color: theme.colors.text.secondary, marginTop: 4, fontSize: 14 },
    section: {
      color: theme.colors.text.primary,
      fontWeight: "800",
      marginBottom: 12,
      fontSize: 16,
    },
    nextStepRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    stepIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    stepText: {
      flex: 1,
      color: theme.colors.text.secondary,
      fontSize: 15,
    },
    line: { color: theme.colors.text.secondary, marginBottom: 2 },
    paid: {
      color: theme.colors.text.primary,
      fontWeight: "900",
      fontSize: 28,
      marginTop: 4,
    },
    btnOutline: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      alignItems: "center"
    },
    btnOutlineText: { color: theme.colors.text.primary, fontWeight: "800" },
    btnPrimary: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      backgroundColor: theme.colors.accent.emerald,
      alignItems: "center"
    },
    btnPrimaryText: { color: theme.colors.text.inverse, fontWeight: "900" },
    btnLink: { alignSelf: "center", padding: 12 },
    btnLinkText: { color: theme.colors.accent.emerald, fontWeight: "800" },
    copyBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    copyText: { color: theme.colors.text.primary, fontWeight: "700" },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    value: { color: theme.colors.text.primary, fontWeight: "800" },
    link: { color: theme.colors.accent.emerald, fontWeight: "800" },
    countdownText: { textAlign: "center", color: theme.colors.text.tertiary, marginTop: 8 }
  });
}
