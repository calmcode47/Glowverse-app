import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { CardField } from "@stripe/stripe-react-native";
import { useStripePaymentService } from "../../services/stripe.service";
import { usePlatformPayments } from "../../services/platformPayments.service";
import { useTheme } from "../../theme/themeContext";
import Checkbox from "../ui/Checkbox";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";
import { usePaymentAnalytics } from "../../hooks/analytics/usePaymentAnalytics";
import { getDefaultSavedPaymentMethodId, listSavedPaymentMethods, removeSavedPaymentMethod, setDefaultSavedPaymentMethodId, upsertSavedPaymentMethod, type SavedPaymentMethod } from "../../services/payments/savedPaymentMethods";

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
  const { trackSelected, trackAdded } = usePaymentAnalytics();
  const [cardValid, setCardValid] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveForFuture, setSaveForFuture] = React.useState(true);
  const [savedMethods, setSavedMethods] = React.useState<SavedPaymentMethod[]>([]);
  const [defaultSavedId, setDefaultSavedId] = React.useState<string | null>(null);
  const [selectedSavedId, setSelectedSavedId] = React.useState<string | null>(null);
  const [applePayAvailable, setApplePayAvailable] = React.useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      const [a, g] = await Promise.all([platform.isApplePaySupported(), platform.isGooglePaySupported()]);
      setApplePayAvailable(a);
      setGooglePayAvailable(g);
    })();
  }, []);
  React.useEffect(() => {
    (async () => {
      const [methods, def] = await Promise.all([listSavedPaymentMethods(), getDefaultSavedPaymentMethodId()]);
      setSavedMethods(methods);
      setDefaultSavedId(def);
      if (def && methods.some((m) => m.id === def)) {
        setSelectedSavedId(def);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (selected !== "card") return;
    const id = selectedSavedId || null;
    if (id) onPaymentMethodReady?.(id);
  }, [onPaymentMethodReady, selected, selectedSavedId]);

  async function selectSaved(paymentMethodId: string) {
    setSelectedSavedId(paymentMethodId);
    setDefaultSavedId(paymentMethodId);
    await setDefaultSavedPaymentMethodId(paymentMethodId);
    onPaymentMethodReady?.(paymentMethodId);
  }

  async function deleteSaved(paymentMethodId: string) {
    setProcessing(true);
    try {
      await removeSavedPaymentMethod(paymentMethodId);
      const [methods, def] = await Promise.all([listSavedPaymentMethods(), getDefaultSavedPaymentMethodId()]);
      setSavedMethods(methods);
      setDefaultSavedId(def);
      if (selectedSavedId === paymentMethodId) {
        setSelectedSavedId(def && methods.some((m) => m.id === def) ? def : methods[0]?.id || null);
      }
    } finally {
      setProcessing(false);
    }
  }

  async function save() {
    if (selectedSavedId) {
      onPaymentMethodReady?.(selectedSavedId);
      return;
    }
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
      trackAdded("card", res.paymentMethod.id);
      if (saveForFuture) {
        const card = (res.paymentMethod as any).card || {};
        const record: SavedPaymentMethod = {
          id: res.paymentMethod.id,
          brand: card.brand,
          last4: card.last4,
          expMonth: typeof card.expiryMonth === "number" ? card.expiryMonth : card.exp_month,
          expYear: typeof card.expiryYear === "number" ? card.expiryYear : card.exp_year,
          addedAt: new Date().toISOString()
        };
        await upsertSavedPaymentMethod(record);
        await setDefaultSavedPaymentMethodId(record.id);
        const [methods, def] = await Promise.all([listSavedPaymentMethods(), getDefaultSavedPaymentMethodId()]);
        setSavedMethods(methods);
        setDefaultSavedId(def);
        setSelectedSavedId(record.id);
      }
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
      trackSelected("applepay");
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
      trackSelected("googlepay");
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
          onPress={() => { onSelect(m); trackSelected(m); }}
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
          {savedMethods.length ? (
            <View style={styles.savedSection}>
              <Text style={styles.label}>Saved cards</Text>
              {savedMethods.map((m: SavedPaymentMethod) => {
                const selected = selectedSavedId === m.id || (!selectedSavedId && defaultSavedId === m.id);
                const title = `${(m.brand || "Card").toUpperCase()} •••• ${m.last4 || "••••"}`;
                const subtitle =
                  m.expMonth && m.expYear ? `Exp ${String(m.expMonth).padStart(2, "0")}/${String(m.expYear).slice(-2)}` : "Saved payment method";
                return (
                  <View key={m.id} style={styles.savedRow}>
                    <TouchableOpacity
                      onPress={() => selectSaved(m.id)}
                      disabled={processing}
                      style={[styles.savedCard, selected && { borderColor: theme.colors.accent.emerald }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Use saved card ending ${m.last4 || ""}`}
                    >
                      <Text style={styles.savedTitle}>{title}</Text>
                      <Text style={styles.note}>{subtitle}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteSaved(m.id)}
                      disabled={processing}
                      style={styles.deleteBtn}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete saved card ending ${m.last4 || ""}`}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              <TouchableOpacity
                onPress={() => setSelectedSavedId(null)}
                disabled={processing}
                style={[styles.useNewBtn, !selectedSavedId && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel="Use a new card"
              >
                <Text style={styles.useNewText}>Use a new card</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <CardField
            {...useTestID(TestIDs.CHECKOUT.PAYMENT_CARD_NUMBER)}
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
          <Checkbox
            label="Save for future purchases"
            checked={saveForFuture}
            onPress={() => setSaveForFuture((v: boolean) => !v)}
          />
          {error ? <Text style={[styles.note, { color: theme.colors.error }]}>{error}</Text> : null}
          <TouchableOpacity
            onPress={save}
            disabled={(!selectedSavedId && !cardValid) || processing}
            style={[styles.saveBtn, ((!selectedSavedId && !cardValid) || processing) && { opacity: 0.6 }]}
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
    payText: { color: theme.colors.text.primary, fontWeight: "800" },
    savedSection: { gap: 8 },
    savedRow: { flexDirection: "row", alignItems: "stretch", gap: 10 },
    savedCard: { flex: 1, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12 },
    savedTitle: { color: theme.colors.text.primary, fontWeight: "900" },
    deleteBtn: { alignSelf: "center", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light },
    deleteText: { color: theme.colors.text.primary, fontWeight: "800" },
    useNewBtn: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light },
    useNewText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
