import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TransactionReference from "../../components/checkout/TransactionReference";

export default function PaymentFraudScreen({ route }: any) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const error = route?.params?.error;
  const onContactSupport = route?.params?.onContactSupport || (() => {});
  return (
    <SafeAreaView style={styles.container}>
      <MaterialCommunityIcons name="shield-lock-outline" size={64} color={theme.colors.error} />
      <Text style={styles.title}>Security Verification Needed</Text>
      <Text style={styles.message}>{error?.userMessage || "We could not complete the payment for security reasons."}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onContactSupport} style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.emerald }]}><Text style={styles.primaryText}>Contact Support</Text></TouchableOpacity>
      </View>
      <TransactionReference transactionId={error?.supportContext?.transactionId} />
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 8, backgroundColor: theme.colors.background.primary },
    title: { color: theme.colors.text.primary, fontSize: 22, fontWeight: "900", marginTop: 8 },
    message: { color: theme.colors.text.secondary, textAlign: "center", marginTop: 6 },
    actions: { marginTop: 16, gap: 10, width: "100%" },
    primaryBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
    primaryText: { color: theme.colors.text.inverse, fontWeight: "900" }
  });
}
