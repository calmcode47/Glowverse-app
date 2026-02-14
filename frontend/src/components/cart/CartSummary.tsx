import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Cart } from "../../services/api/cart.api";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";

type Props = {
  cart: Cart;
  outOfStock: boolean;
  onRemoveUnavailable?: () => void;
  onCheckout?: () => void;
};

export default function CartSummary({ cart, outOfStock, onRemoveUnavailable, onCheckout }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const checkoutTest = useTestID(TestIDs.CART.CHECKOUT_BUTTON);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>${cart.subtotal.toFixed(2)}</Text>
      </View>
      {cart.promo ? (
        <View style={styles.row}>
          <Text style={styles.label}>Discount</Text>
          <Text style={[styles.value, { color: theme.colors.accent.emerald }]}>- ${cart.promo.discountAmount.toFixed(2)}</Text>
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
      {outOfStock && onRemoveUnavailable ? (
        <TouchableOpacity onPress={onRemoveUnavailable} style={styles.warnBtn}>
          <Text style={styles.warnText}>Remove Unavailable Items</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity disabled={outOfStock} onPress={onCheckout} style={[styles.checkout, outOfStock && { opacity: 0.5 }]} {...checkoutTest}>
        <Text style={styles.checkoutText}>Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: theme.colors.background.elevated
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8
    },
    label: { color: theme.colors.text.secondary },
    value: { color: theme.colors.text.primary, fontWeight: "700" },
    sep: { height: 1, backgroundColor: theme.colors.border.light, marginVertical: 8 },
    total: { color: theme.colors.text.primary, fontSize: 18, fontWeight: "800" },
    warnBtn: {
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      marginTop: 8
    },
    warnText: { color: theme.colors.text.primary, fontWeight: "700" },
    checkout: {
      marginTop: 12,
      backgroundColor: theme.colors.accent.emerald,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center"
    },
    checkoutText: { color: theme.colors.text.inverse, fontWeight: "800" }
  });
}
