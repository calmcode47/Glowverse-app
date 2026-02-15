import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as OrdersAPI from "../../services/api/orders.api";
import { useRoute, useNavigation } from "@react-navigation/native";
import GradientButton from "../../components/ui/GradientButton";

export default function OrderConfirmationScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId as string;
  const [order, setOrder] = React.useState<OrdersAPI.Order | null>(null);
  const [loading, setLoading] = React.useState(true);

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
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  return (
    <View style={styles.container}>
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
            <Text style={styles.successTitle}>Order Placed Successfully!</Text>
            <Text style={styles.successSubtitle}>
              Thank you for your order. We'll send you a confirmation email shortly.
            </Text>
          </View>

          {/* Order Number */}
          <View style={styles.card}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.bigNumber}>#{order.number || order.id.slice(0, 8).toUpperCase()}</Text>
            {order.estimatedDelivery ? (
              <Text style={styles.note}>
                Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
              </Text>
            ) : null}
          </View>

          {/* What's Next Section */}
          <View style={styles.card}>
            <Text style={styles.section}>What's Next?</Text>
            <View style={styles.nextStepRow}>
              <Text style={styles.stepIcon}>✉️</Text>
              <Text style={styles.stepText}>You'll receive an order confirmation email</Text>
            </View>
            <View style={styles.nextStepRow}>
              <Text style={styles.stepIcon}>📦</Text>
              <Text style={styles.stepText}>We'll notify you when your order ships</Text>
            </View>
            <View style={styles.nextStepRow}>
              <Text style={styles.stepIcon}>🚚</Text>
              <Text style={styles.stepText}>Track your order in the Orders section</Text>
            </View>
          </View>

          {/* Shipping Address */}
          <View style={styles.card}>
            <Text style={styles.section}>Shipping Address</Text>
            {order.shippingAddress ? (
              <>
                <Text style={styles.line}>{order.shippingAddress.fullName}</Text>
                <Text style={styles.line}>{order.shippingAddress.street}</Text>
                <Text style={styles.line}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</Text>
                <Text style={styles.line}>{order.shippingAddress.country}</Text>
              </>
            ) : null}
          </View>

          {/* Total Paid */}
          <View style={styles.card}>
            <Text style={styles.section}>Total Paid</Text>
            <Text style={styles.paid}>${order.total.toFixed(2)}</Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
            <GradientButton
              title="Track Order"
              onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
              size="small"
            />
            <TouchableOpacity onPress={() => navigation.navigate("MainTabs", { screen: "HomeTab" })} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("OrderHistory")} style={styles.btnLink}>
            <Text style={styles.btnLinkText}>View All Orders</Text>
          </TouchableOpacity>
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
    btnLinkText: { color: theme.colors.accent.emerald, fontWeight: "800" }
  });
}
