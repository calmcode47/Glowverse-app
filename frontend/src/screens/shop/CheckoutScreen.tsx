import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import ProgressIndicator from "../../components/checkout/ProgressIndicator";
import ShippingStep from "../../components/checkout/ShippingStep";
import PaymentStep from "../../components/checkout/PaymentStep";
import ReviewStep from "../../components/checkout/ReviewStep";
import * as CartAPI from "../../services/api/cart.api";
import * as OrdersAPI from "../../services/api/orders.api";
import * as PromotionsAPI from "../../services/api/promotions.api";
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

  // Promotion State
  const [promoCode, setPromoCode] = React.useState("");
  const [appliedPromo, setAppliedPromo] = React.useState<PromotionsAPI.Promotion | null>(null);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [validatingPromo, setValidatingPromo] = React.useState(false);
  const [promoError, setPromoError] = React.useState<string | null>(null);

  const labels = ["Shipping", "Payment", "Review"];
  const stripe = useStripe();
  const { confirmPayment, handleNextAction } = stripe;
  const { confirmApplePayPayment, confirmGooglePayPayment } = stripe as any;

  React.useEffect(() => {
    (async () => {
      try {
        setLoadingCart(true);
        let c = await CartAPI.getCart();
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

  const validatePromo = async () => {
    if (!promoCode.trim() || !cart) return;
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const items = cart.items.map(item => ({
        productId: item.productId,
        category: item.product.category
      }));

      const res = await PromotionsAPI.validatePromotion(promoCode, cart.total, items);

      if (res.success && res.valid) {
        setAppliedPromo(res.promotion || null);
        setDiscountAmount(res.discount || 0);
        setPromoCode(""); // Clear input on success
      } else {
        setPromoError(res.error || "Invalid promotion code");
        setAppliedPromo(null);
        setDiscountAmount(0);
      }
    } catch (err) {
      setPromoError("Failed to validate code");
    } finally {
      setValidatingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoError(null);
  };

  const next = () => setStep((s: number) => Math.min(3, s + 1));
  const back = () => setStep((s: number) => Math.max(1, s - 1));

  const placeOrder = async () => {
    if (!cart || !shippingId || !paymentMethod) return;
    setPlacing(true);
    setPlaceError(null);

    // Calculate final total with discount
    const finalTotal = Math.max(0, cart.total - discountAmount);

    try {
      await analytics.logBeginCheckout(cart);
      let paymentIntentId: string | undefined = undefined;
      const amountCents = Math.round(finalTotal * 100);

      // Skip payment intent creation if total is 0
      if (amountCents > 0) {
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
            if ((res?.paymentIntent?.status as any) === "requires_action") {
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
          // ... (Same logic for Apple/Google Pay, passing finalTotal/amountCents)
          // Simplified for brevity, reusing existing logic but with updated amountCents
          const intent = await createPaymentIntent({ amount: amountCents, currency: "usd", metadata: { cartId: cart.id, platform: "applepay" } });
          const clientSecret = intent.clientSecret;
          const cap = await confirmApplePayPayment(clientSecret);
          if ((cap as any)?.error) throw new Error((cap as any).error.message);
          paymentIntentId = (cap as any)?.paymentIntent?.id;
        } else if (paymentMethod === "googlepay") {
          const intent = await createPaymentIntent({ amount: amountCents, currency: "usd", metadata: { cartId: cart.id, platform: "googlepay" } });
          const clientSecret = intent.clientSecret;
          const cgp = await confirmGooglePayPayment(clientSecret);
          if ((cgp as any)?.error) throw new Error((cgp as any).error.message);
          paymentIntentId = (cgp as any)?.paymentIntent?.id;
        }
      }

      const items = cart.items.map((it: CartAPI.CartItem) => ({ productId: it.productId, variantId: it.variantId, quantity: it.quantity }));
      const order = await OrdersAPI.createOrder({
        items,
        shippingAddressId: shippingId,
        paymentMethod,
        promotionCode: appliedPromo?.code,
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
          {step === 2 ? (
            <View style={{ flex: 1 }}>
              <PaymentStep selected={paymentMethod as any} onSelect={setPaymentMethod as any} onPaymentMethodReady={setPaymentMethodId} cartTotal={Math.max(0, cart.total - discountAmount)} />

              {/* Promo Code Section */}
              <View style={styles.promoContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Promotion Code</Text>
                {appliedPromo ? (
                  <View style={styles.appliedPromo}>
                    <View>
                      <Text style={styles.promoCode}>{appliedPromo.code}</Text>
                      <Text style={styles.discountText}>-${discountAmount.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity onPress={removePromo}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.promoInputContainer}>
                    <TextInput
                      style={[styles.input, { color: theme.colors.text.primary, borderColor: theme.colors.border.light }]}
                      placeholder="Enter code"
                      placeholderTextColor={theme.colors.text.secondary}
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={[styles.applyBtn, { backgroundColor: theme.colors.accent.emerald }]}
                      onPress={validatePromo}
                      disabled={validatingPromo || !promoCode}
                    >
                      {validatingPromo ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.applyText}>Apply</Text>}
                    </TouchableOpacity>
                  </View>
                )}
                {promoError && <Text style={styles.errorText}>{promoError}</Text>}
              </View>
            </View>
          ) : null}
          {step === 3 ? (
            <ReviewStep
              cart={{
                ...cart,
                total: Math.max(0, cart.total - discountAmount),
                promo: appliedPromo ? {
                  code: appliedPromo.code,
                  discountAmount: discountAmount,
                  discountType: appliedPromo.discountType === 'PERCENTAGE' ? 'percentage' : 'fixed',
                  discountValue: appliedPromo.discountValue,
                  description: appliedPromo.description || ''
                } : undefined
              }}
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
      {placing ? (
        <View style={styles.overlay} pointerEvents="auto">
          <View style={styles.overlayCard}>
            <ActivityIndicator />
            <Text style={styles.overlayText}>Processing payment</Text>
          </View>
        </View>
      ) : null}
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
    navPrimaryText: { color: theme.colors.text.inverse, fontWeight: "900" },
    overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" },
    overlayCard: { minWidth: 200, borderRadius: 12, padding: 16, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: theme.colors.background.elevated },
    overlayText: { color: theme.colors.text.primary, fontWeight: "800" },

    // Promo Styles
    promoContainer: { marginHorizontal: 16, marginVertical: 12, padding: 12, borderRadius: 8, backgroundColor: theme.colors.background.surface },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
    promoInputContainer: { flexDirection: 'row', gap: 8 },
    input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
    applyBtn: { justifyContent: 'center', paddingHorizontal: 16, borderRadius: 8 },
    applyText: { color: '#fff', fontWeight: 'bold' },
    appliedPromo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.background.secondary, padding: 10, borderRadius: 6 },
    promoCode: { fontWeight: '700', color: theme.colors.accent.primary },
    discountText: { color: theme.colors.status.success, fontWeight: '600' },
    removeText: { color: theme.colors.status.error, fontSize: 12 },
    errorText: { color: theme.colors.status.error, fontSize: 12, marginTop: 4 }
  });
}
