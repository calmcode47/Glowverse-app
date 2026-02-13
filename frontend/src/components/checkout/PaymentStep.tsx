import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { CardField } from "@stripe/stripe-react-native";
import { useStripePaymentService } from "../../services/stripe.service";
import { usePlatformPayments } from "../../services/platformPayments.service";
import { useTheme } from "../../theme/themeContext";

type Method = "card" | "paypal" | "applepay" | "googlepay";

type Props = {
  selected?: Method;
  onSelect: (m: Method) => void;
  onPaymentMethodReady?: (id: string) => void;
  cartTotal?: number;
};

export default function PaymentStep({ selected, onSelect, onPaymentMethodReady, cartTotal }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const methods: Method[] = ["card", "paypal", ...(Platform.OS === "ios" ? ["applepay"] as Method[] : ["googlepay"] as Method[])];
  const stripe = useStripePaymentService();
  const platform = usePlatformPayments();
  const [cardValid, setCardValid] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [applePayAvailable, setApplePayAvailable] = React.useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      const [a, g] = await Promise.all([platform.isApplePaySupported(), platform.isGooglePaySupported()]);
      setApplePayAvailable(a);
      setGooglePayAvailable(g);
    })();
  }, []);
  async function save() {
    if (!cardValid) {
      setError("Please enter valid card details");
      return;
    }
    setProcessing(true);
    setError(null);
    const res = await stripe.createCardPaymentMethod();
    if (res.error) {
      setError(res.error);
    } else if (res.paymentMethod?.id) {
      onPaymentMethodReady?.(res.paymentMethod.id);
    }
    setProcessing(false);
  }
  async function handleApplePay() {
    if (!cartTotal) return;
    setProcessing(true);
    setError(null);
    const res = await platform.presentApplePay(cartTotal);
    if (res.status === "succeeded" && res.paymentMethodId) {
      onSelect("applepay");
      onPaymentMethodReady?.(res.paymentMethodId);
    } else if (res.error) {
      setError(res.error);
    }
    setProcessing(false);
  }
  async function handleGooglePay() {
    if (!cartTotal) return;
    setProcessing(true);
    setError(null);
    const res = await platform.presentGooglePay(cartTotal);
    if (res.status === "succeeded" && res.paymentMethodId) {
      onSelect("googlepay");
      onPaymentMethodReady?.(res.paymentMethodId);
    } else if (res.error) {
      setError(res.error);
    }
    setProcessing(false);
  }
  return (
    <View style={{ paddingHorizontal: 16, gap: 10 }}>
      {(applePayAvailable || googlePayAvailable) ? (
        <View style={styles.express}>
          <Text style={styles.label}>Express Checkout</Text>
          {applePayAvailable ? (
            <TouchableOpacity style={styles.payBtn} onPress={handleApplePay} disabled={processing}>
              <Text style={styles.payText}>Apple Pay</Text>
            </TouchableOpacity>
          ) : null}
          {googlePayAvailable ? (
            <TouchableOpacity style={styles.payBtn} onPress={handleGooglePay} disabled={processing}>
              <Text style={styles.payText}>Google Pay</Text>
            </TouchableOpacity>
          ) : null}
          <View style={{ height: 1, backgroundColor: theme.colors.border.light }} />
          <Text style={styles.note}>or pay with card</Text>
        </View>
      ) : null}
      {methods.map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => onSelect(m)}
          style={[styles.option, selected === m && { borderColor: theme.colors.accent.emerald }]}
          accessibilityRole="button"
          accessibilityLabel={labelFor(m)}
        >
          <Text style={styles.label}>{labelFor(m)}</Text>
          <Text style={styles.note}>{m === "card" ? "Visa, Mastercard, Amex" : "Payment integration coming soon"}</Text>
        </TouchableOpacity>
      ))}
      {selected === "card" ? (
        <View style={styles.cardSection}>
          <CardField
            testID="card-field"
            postalCodeEnabled
            cardStyle={{
              backgroundColor: "#FFFFFF",
              textColor: "#000000"
            }}
            style={styles.cardField}
            onCardChange={(d: any) => {
              setCardValid(Boolean(d?.complete));
              if (error) setError(null);
            }}
          />
          {error ? <Text style={[styles.note, { color: theme.colors.error }]}>{error}</Text> : null}
          <TouchableOpacity
            onPress={save}
            disabled={!cardValid || processing}
            style={[styles.saveBtn, (!cardValid || processing) && { opacity: 0.6 }]}
          >
            <Text style={styles.saveText}>{processing ? "Processing..." : "Save Card"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

function labelFor(m: Method): string {
  switch (m) {
    case "card":
      return "Credit/Debit Card";
    case "paypal":
      return "PayPal";
    case "applepay":
      return "Apple Pay";
    case "googlepay":
      return "Google Pay";
  }
}

function createStyles(theme: any) {
  return StyleSheet.create({
    option: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 12,
      padding: 12
    },
    label: { color: theme.colors.text.primary, fontWeight: "800" },
    note: { color: theme.colors.text.secondary, marginTop: 4 },
    cardSection: { gap: 10 },
    cardField: { height: 48, marginTop: 8 },
    saveBtn: { alignSelf: "flex-end", backgroundColor: theme.colors.accent.emerald, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    saveText: { color: theme.colors.text.inverse, fontWeight: "900" },
    express: { gap: 10, paddingVertical: 8 },
    payBtn: { paddingVertical: 12, alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated },
    payText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
