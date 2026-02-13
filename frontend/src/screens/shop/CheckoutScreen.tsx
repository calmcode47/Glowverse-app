import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import ProgressIndicator from "../../components/checkout/ProgressIndicator";
import ShippingStep from "../../components/checkout/ShippingStep";
import PaymentStep from "../../components/checkout/PaymentStep";
import ReviewStep from "../../components/checkout/ReviewStep";
import * as CartAPI from "../../services/api/cart.api";
import * as OrdersAPI from "../../services/api/orders.api";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { setCount } = useCart();
  const [step, setStep] = React.useState(1);
  const [cart, setCart] = React.useState<CartAPI.Cart | null>(null);
  const [loadingCart, setLoadingCart] = React.useState(true);
  const [shippingId, setShippingId] = React.useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = React.useState<string | undefined>("card");
  const [placing, setPlacing] = React.useState(false);
  const [placeError, setPlaceError] = React.useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const labels = ["Shipping", "Payment", "Review"];

  React.useEffect(() => {
    (async () => {
      try {
        setLoadingCart(true);
        let c = await CartAPI.getCart();
        const pending = await AsyncStorage.getItem("pendingPromoCode");
        if (pending) {
          try {
            await CartAPI.applyPromoCode(pending);
            await AsyncStorage.removeItem("pendingPromoCode");
            c = await CartAPI.getCart();
          } catch {}
        }
        setCart(c);
      } finally {
        setLoadingCart(false);
      }
    })();
  }, []);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const placeOrder = async () => {
    if (!cart || !shippingId || !paymentMethod) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const items = cart.items.map((it) => ({ productId: it.productId, variantId: it.variantId, quantity: it.quantity }));
      const order = await OrdersAPI.createOrder({
        items,
        shippingAddressId: shippingId,
        paymentMethod,
        promoCode: cart.promo?.code
      });
      await CartAPI.clearCart();
      setCount(0);
      navigation.navigate("OrderConfirmation", { orderId: order.id });
    } catch (e: any) {
      const msg = e?.message || "Unable to place order. Please try again.";
      setPlaceError(msg);
      Alert.alert("Order Error", msg, [{ text: "OK" }]);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Checkout</Text>
      </View>
      <ProgressIndicator current={step} total={3} labels={labels} />
      {loadingCart || !cart ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <>
          {step === 1 ? <ShippingStep selectedId={shippingId} onSelect={setShippingId} /> : null}
          {step === 2 ? <PaymentStep selected={paymentMethod as any} onSelect={setPaymentMethod as any} /> : null}
          {step === 3 ? (
            <ReviewStep
              cart={cart}
              address={undefined}
              paymentMethod={paymentMethod}
              termsAccepted={termsAccepted}
              onToggleTerms={() => setTermsAccepted((v) => !v)}
              onPlaceOrder={placeOrder}
              placing={placing}
              error={placeError}
            />
          ) : null}
          <View style={styles.footer}>
            <TouchableOpacity onPress={back} disabled={step === 1} style={[styles.navBtn, step === 1 && { opacity: 0.5 }]}>
              <Text style={styles.navText}>Back</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={next}
              disabled={(step === 1 && !shippingId) || step === 3}
              style={[styles.navPrimary, ((step === 1 && !shippingId) || step === 3) && { opacity: 0.5 }]}
            >
              <Text style={styles.navPrimaryText}>{step < 3 ? "Next" : "Done"}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 },
    title: { fontSize: 20, fontWeight: "800" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    footer: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
    navBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light },
    navText: { color: theme.colors.text.primary, fontWeight: "800" },
    navPrimary: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.colors.accent.emerald },
    navPrimaryText: { color: theme.colors.text.inverse, fontWeight: "900" }
  });
}
