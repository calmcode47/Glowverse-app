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
import { createPaymentIntent } from "../../services/api/payments.api";
import { useStripe } from "@stripe/stripe-react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { analytics } from "../../services/analytics.service";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";
import { stripeErrorMapper } from "../../services/payments/stripeErrorMapper";
import { PaymentRecoveryManager } from "../../services/payments/paymentRecoveryManager";
import { PaymentIdempotencyManager } from "../../services/payments/idempotencyManager";
import { PaymentErrorType } from "../../services/payments/paymentErrors";

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { setCount } = useCart();
  const { user } = useAuth();
  const [step, setStep] = React.useState(1);
  const [cart, setCart] = React.useState<CartAPI.Cart | null>(null);
  const [loadingCart, setLoadingCart] = React.useState(true);
  const [shippingId, setShippingId] = React.useState<string | undefined>(undefined);
  const [selectedAddress, setSelectedAddress] = React.useState<OrdersAPI.Address | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<string | undefined>("card");
  const [placing, setPlacing] = React.useState(false);
  const [placeError, setPlaceError] = React.useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [paymentMethodId, setPaymentMethodId] = React.useState<string | null>(null);
  const labels = ["Shipping", "Payment", "Review"];
  const { confirmPayment, handleNextAction, confirmApplePayPayment, confirmGooglePayPayment } = useStripe();

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
          } catch { }
        }
        setCart(c);
      } finally {
        setLoadingCart(false);
      }
    })();
  }, []);

  // Fetch selected address when shippingId changes
  React.useEffect(() => {
    if (shippingId && user?.id) {
      (async () => {
        try {
          const addresses = await OrdersAPI.getUserAddresses(user.id);
          const addr = addresses.find(a => a.id === shippingId);
          setSelectedAddress(addr || null);
        } catch (e) {
          console.error('Failed to fetch address:', e);
        }
      })();
    } else {
      setSelectedAddress(null);
    }
  }, [shippingId, user?.id]);

  const next = () => setStep((s: number) => Math.min(3, s + 1));
  const back = () => setStep((s: number) => Math.max(1, s - 1));

  const placeOrder = async () => {
    if (!cart || !shippingId || !paymentMethod) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      await analytics.logBeginCheckout(cart);
      let paymentIntentId: string | undefined = undefined;
      const amountCents = Math.round(cart.total * 100);
      const idempotency = new PaymentIdempotencyManager();
      if (paymentMethod === "card") {
        if (!paymentMethodId) throw new Error("Please provide a valid payment method");
        const intent = await createPaymentIntent({ amount: amountCents, currency: "usd", metadata: { cartId: cart.id } });
        const clientSecret = intent.clientSecret;
        const process = async () => {
          const res = await confirmPayment(clientSecret, { paymentMethodType: "Card", paymentMethodData: { paymentMethodId } });
          if (res?.error) {
            const mapped = stripeErrorMapper({ code: res?.error?.code, message: res?.error?.message }, { amount: amountCents, currency: "usd", transactionId: paymentIntentId });
            const mgr = new PaymentRecoveryManager(async () => {
              await confirmPayment(clientSecret, { paymentMethodType: "Card", paymentMethodData: { paymentMethodId } });
            });
            await mgr.handlePaymentError(mapped, clientSecret, navigation);
            throw new Error(mapped.userMessage);
          }
          if (res?.paymentIntent?.status === "requires_action") {
            const next = await handleNextAction(clientSecret);
            if ((next as any)?.error) {
              const mapped = stripeErrorMapper({ code: "three_d_secure_authentication_failed", message: (next as any).error?.message }, { amount: amountCents, currency: "usd", transactionId: paymentIntentId });
              const mgr = new PaymentRecoveryManager(async () => {
                await handleNextAction(clientSecret);
              });
              await mgr.handlePaymentError(mapped, clientSecret, navigation);
              throw new Error(mapped.userMessage);
            }
            if ((next as any)?.paymentIntent?.status !== "succeeded") {
              const mapped = stripeErrorMapper({ code: "three_d_secure_authentication_failed", message: "Authentication incomplete" }, { amount: amountCents, currency: "usd", transactionId: paymentIntentId });
              const mgr = new PaymentRecoveryManager(async () => {
                await handleNextAction(clientSecret);
              });
              await mgr.handlePaymentError(mapped, clientSecret, navigation);
              throw new Error(mapped.userMessage);
            }
            paymentIntentId = (next as any)?.paymentIntent?.id;
          } else {
            paymentIntentId = res?.paymentIntent?.id;
          }
          return true;
        };
        await idempotency.processPaymentSafely(`checkout:${cart.id}:${amountCents}:${shippingId}:${paymentMethodId}`, async () => {
          await process();
          return { status: "succeeded", paymentIntentId } as any;
        });
      } else if (paymentMethod === "applepay") {
        const intent = await createPaymentIntent({ amount: amountCents, currency: "usd", metadata: { cartId: cart.id, platform: "applepay" } });
        const clientSecret = intent.clientSecret;
        const cap = await confirmApplePayPayment(clientSecret);
        if ((cap as any)?.error) {
          const mapped = stripeErrorMapper({ code: "processing_error", message: (cap as any).error?.message }, { amount: amountCents, currency: "usd" });
          const mgr = new PaymentRecoveryManager(async () => {
            await confirmApplePayPayment(clientSecret);
          });
          await mgr.handlePaymentError(mapped, clientSecret, navigation);
          throw new Error(mapped.userMessage);
        }
        paymentIntentId = (cap as any)?.paymentIntent?.id;
      } else if (paymentMethod === "googlepay") {
        const intent = await createPaymentIntent({ amount: amountCents, currency: "usd", metadata: { cartId: cart.id, platform: "googlepay" } });
        const clientSecret = intent.clientSecret;
        const cgp = await confirmGooglePayPayment(clientSecret);
        if ((cgp as any)?.error) {
          const mapped = stripeErrorMapper({ code: "processing_error", message: (cgp as any).error?.message }, { amount: amountCents, currency: "usd" });
          const mgr = new PaymentRecoveryManager(async () => {
            await confirmGooglePayPayment(clientSecret);
          });
          await mgr.handlePaymentError(mapped, clientSecret, navigation);
          throw new Error(mapped.userMessage);
        }
        paymentIntentId = (cgp as any)?.paymentIntent?.id;
      }
      const items = cart.items.map((it: CartAPI.CartItem) => ({ productId: it.productId, variantId: it.variantId, quantity: it.quantity }));
      const order = await OrdersAPI.createOrder({
        items,
        shippingAddressId: shippingId,
        paymentMethod,
        promoCode: cart.promo?.code,
        ...(paymentIntentId ? { notes: `pi:${paymentIntentId}` } : {})
      } as any);
      await analytics.logPurchase(order as any);
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
    <View style={styles.container} {...useTestID(TestIDs.CHECKOUT.SCREEN)}>
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
          {step === 2 ? <PaymentStep selected={paymentMethod as any} onSelect={setPaymentMethod as any} onPaymentMethodReady={setPaymentMethodId} cartTotal={cart.total} /> : null}
          {step === 3 ? (
            <ReviewStep
              cart={cart}
              address={selectedAddress || undefined}
              paymentMethod={paymentMethod}
              termsAccepted={termsAccepted}
              onToggleTerms={() => setTermsAccepted((v: boolean) => !v)}
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
              disabled={(step === 1 && !shippingId) || (step === 2 && paymentMethod === "card" && !paymentMethodId) || step === 3}
              style={[styles.navPrimary, ((step === 1 && !shippingId) || (step === 2 && paymentMethod === "card" && !paymentMethodId) || step === 3) && { opacity: 0.5 }]}
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
