import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as OrdersAPI from "../../services/api/orders.api";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function OrderConfirmationScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId as string;
  const [order, setOrder] = React.useState<OrdersAPI.Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      try {
        const o = await OrdersAPI.getOrderById(orderId);
        setOrder(o);
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
          <View style={styles.card}>
            <Text style={styles.bigNumber}>#{order.number || order.id}</Text>
            <Text style={styles.note}>Thank you for your order!</Text>
            {order.estimatedDelivery ? <Text style={styles.note}>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</Text> : null}
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
            <Text style={styles.section}>Total Paid</Text>
            <Text style={styles.paid}>${order.total.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between" }}>
            <TouchableOpacity onPress={() => navigation.navigate("OrderDetail", { orderId })} style={styles.btnOutline}>
              <Text style={styles.btnOutlineText}>Track Order</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("MainTabs", { screen: "HomeTab" })} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("OrderHistory")} style={styles.btnLink}>
            <Text style={styles.btnLinkText}>View All Orders</Text>
          </TouchableOpacity>
          <Text style={[styles.note, { textAlign: "center" }]}>A confirmation email has been sent.</Text>
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
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12 },
    bigNumber: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 20 },
    note: { color: theme.colors.text.secondary, marginTop: 4 },
    section: { color: theme.colors.text.primary, fontWeight: "800", marginBottom: 6 },
    line: { color: theme.colors.text.secondary },
    paid: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18 },
    btnOutline: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: "center" },
    btnOutlineText: { color: theme.colors.text.primary, fontWeight: "800" },
    btnPrimary: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.colors.accent.emerald, alignItems: "center" },
    btnPrimaryText: { color: theme.colors.text.inverse, fontWeight: "900" },
    btnLink: { alignSelf: "center", padding: 8 },
    btnLinkText: { color: theme.colors.accent.emerald, fontWeight: "800" }
  });
}
