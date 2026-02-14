import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TransactionReference from "../../components/checkout/TransactionReference";

export default function PaymentGenericErrorScreen({ route }: any) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const error = route?.params?.error;
  const onRetry = route?.params?.onRetry || (() => {});
  const onChangeMethod = route?.params?.onChangeMethod || (() => {});
  const onContactSupport = route?.params?.onContactSupport || (() => {});
  return (
    <SafeAreaView style={styles.container}>
      <MaterialCommunityIcons name="alert-outline" size={64} color={theme.colors.error} />
      <Text style={styles.title}>Payment Error</Text>
      <Text style={styles.message}>{error?.userMessage || "We were unable to complete the payment."}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onRetry} style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.emerald }]}><Text style={styles.primaryText}>Try Again</Text></TouchableOpacity>
        <TouchableOpacity onPress={onChangeMethod} style={styles.outlineBtn}><Text style={styles.outlineText}>Change Method</Text></TouchableOpacity>
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
    outlineBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: theme.colors.border.light },
    outlineText: { color: theme.colors.text.primary, fontWeight: "900" },
    textBtn: { alignItems: "center", paddingVertical: 8 },
    textBtnText: { color: theme.colors.text.secondary, fontWeight: "700" }
  });
}
