import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Method = "card" | "paypal" | "applepay" | "googlepay";

type Props = {
  selected?: Method;
  onSelect: (m: Method) => void;
};

export default function PaymentStep({ selected, onSelect }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const methods: Method[] = ["card", "paypal", ...(Platform.OS === "ios" ? ["applepay"] as Method[] : ["googlepay"] as Method[])];
  return (
    <View style={{ paddingHorizontal: 16, gap: 10 }}>
      {methods.map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => onSelect(m)}
          style={[styles.option, selected === m && { borderColor: theme.colors.accent.emerald }]}
        >
          <Text style={styles.label}>{labelFor(m)}</Text>
          <Text style={styles.note}>{m === "card" ? "Visa, Mastercard, Amex" : "Payment integration coming soon"}</Text>
        </TouchableOpacity>
      ))}
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
    note: { color: theme.colors.text.secondary, marginTop: 4 }
  });
}
