import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TransactionReference from "../../components/checkout/TransactionReference";
import { useTestID } from "../../hooks/useTestID";

export default function PaymentNetworkErrorScreen({ route }: any) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const error = route?.params?.error;
  const onRetry = route?.params?.onRetry || (() => {});
  const onContactSupport = route?.params?.onContactSupport || (() => {});
  return (
    <SafeAreaView style={styles.container} {...useTestID("paymentNetworkErrorScreen")}>
      <MaterialCommunityIcons name="wifi-off" size={64} color={theme.colors.error} />
      <Text style={styles.title}>Connection Issue</Text>
      <Text style={styles.message}>{error?.userMessage || "No internet connection."}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onRetry} style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.emerald }]}><Text style={styles.primaryText}>Retry</Text></TouchableOpacity>
        <TouchableOpacity onPress={onContactSupport} style={styles.textBtn}><Text style={styles.textBtnText}>Need Help?</Text></TouchableOpacity>
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
    primaryText: { color: theme.colors.text.inverse, fontWeight: "900" },
    textBtn: { alignItems: "center", paddingVertical: 8 },
    textBtnText: { color: theme.colors.text.secondary, fontWeight: "700" }
  });
}
