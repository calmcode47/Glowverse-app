import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Cart } from "../../services/api/cart.api";
import type { Address } from "../../services/api/orders.api";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";

type Props = {
  cart: Cart;
  address?: Address;
  paymentMethod?: string;
  termsAccepted: boolean;
  onToggleTerms: () => void;
  onPlaceOrder: () => Promise<void>;
  placing: boolean;
  error?: string | null;
};

export default function ReviewStep({ cart, address, paymentMethod, termsAccepted, onToggleTerms, onPlaceOrder, placing, error }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Items</Text>
        {cart.items.map((it) => (
          <View key={it.id} style={styles.itemRow}>
            {it.product.image ? <Image source={{ uri: it.product.image }} style={styles.thumb} /> : <View style={[styles.thumb, { backgroundColor: theme.colors.background.secondary }]} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={2}>{it.product.name}</Text>
              <Text style={styles.itemMeta}>Qty: {it.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${(it.price * it.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Shipping Address</Text>
        {address ? (
          <View style={{ marginTop: 6 }}>
            <Text style={styles.line}>{address.fullName}</Text>
            <Text style={styles.line}>{address.street}</Text>
            <Text style={styles.line}>{address.city}, {address.state} {address.postalCode}</Text>
            <Text style={styles.line}>{address.country}</Text>
            {address.phone ? <Text style={styles.line}>{address.phone}</Text> : null}
          </View>
        ) : <Text style={styles.line}>No address selected</Text>}
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.line}>{paymentMethodLabel(paymentMethod)}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>${cart.subtotal.toFixed(2)}</Text>
        </View>
        {cart.promo ? (
          <View style={styles.row}>
            <Text style={styles.label}>Discount</Text>
            <Text style={[styles.value, { color: theme.colors.accent.emerald }]}>-${cart.promo.discountAmount.toFixed(2)}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.label}>Tax</Text>
          <Text style={styles.value}>${cart.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Shipping</Text>
          <Text style={styles.value}>${cart.shipping.toFixed(2)}</Text>
        </View>
        <View style={styles.sep} />
        <View style={styles.row}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>${cart.total.toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onToggleTerms} style={styles.termsRow}>
        <View style={[styles.checkbox, termsAccepted && { backgroundColor: theme.colors.accent.emerald }]} />
        <Text style={styles.termsText}>I agree to the Terms and Privacy Policy</Text>
      </TouchableOpacity>
      {error ? <Text style={{ color: theme.colors.error }} {...useTestID(TestIDs.COMMON.ERROR_MESSAGE)}>{error}</Text> : null}
      <TouchableOpacity
        onPress={onPlaceOrder}
        disabled={!termsAccepted || placing}
        style={[styles.placeBtn, (!termsAccepted || placing) && { opacity: 0.6 }]}
        {...useTestID(TestIDs.CHECKOUT.PLACE_ORDER_BUTTON)}
      >
        {placing ? <ActivityIndicator color={theme.colors.text.inverse} /> : <Text style={styles.placeText}>Place Order</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function paymentMethodLabel(m?: string) {
  switch (m) {
    case "card":
      return "Credit/Debit Card";
    case "paypal":
      return "PayPal";
    case "applepay":
      return "Apple Pay";
    case "googlepay":
      return "Google Pay";
    default:
      return "Not selected";
  }
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 12,
      padding: 12
    },
    title: { color: theme.colors.text.primary, fontWeight: "800", marginBottom: 6 },
    itemRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    thumb: { width: 52, height: 52, borderRadius: 8 },
    itemName: { color: theme.colors.text.primary, fontWeight: "700" },
    itemMeta: { color: theme.colors.text.tertiary, marginTop: 2 },
    itemPrice: { color: theme.colors.text.primary, fontWeight: "700" },
    line: { color: theme.colors.text.secondary },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    label: { color: theme.colors.text.secondary },
    value: { color: theme.colors.text.primary, fontWeight: "800" },
    sep: { height: 1, backgroundColor: theme.colors.border.light, marginVertical: 8 },
    total: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18 },
    termsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: 4 },
    termsText: { color: theme.colors.text.secondary },
    placeBtn: { backgroundColor: theme.colors.accent.emerald, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    placeText: { color: theme.colors.text.inverse, fontWeight: "900" }
  });
}
