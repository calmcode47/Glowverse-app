import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TransactionReference from "../../components/checkout/TransactionReference";
import { useTestID } from "../../hooks/useTestID";

export default function PaymentDeclinedScreen({ route }: any) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const error = route?.params?.error;
  const onTryDifferentCard = route?.params?.onChangeMethod || (() => {});
  const onContactBank = route?.params?.onContactBank || (() => {});
  const onContactSupport = route?.params?.onContactSupport || (() => {});
  return (
    <SafeAreaView style={styles.container} {...useTestID("paymentDeclinedScreen")}>
      <MaterialCommunityIcons name="credit-card-off" size={64} color={theme.colors.error} />
      <Text style={styles.title}>Payment Declined</Text>
      <Text style={styles.message}>{error?.userMessage || "Your card was declined."}</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Why was my card declined?</Text>
        <Text style={styles.infoText}>• Insufficient funds{"\n"}• Card expired{"\n"}• Incorrect details{"\n"}• Security restrictions</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onTryDifferentCard} style={[styles.primaryBtn, { backgroundColor: theme.colors.accent.emerald }]}><Text style={styles.primaryText}>Try Different Card</Text></TouchableOpacity>
        <TouchableOpacity onPress={onContactBank} style={styles.outlineBtn}><Text style={styles.outlineText}>Contact Bank</Text></TouchableOpacity>
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
    infoCard: { marginTop: 12, width: "100%", borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: 10, padding: 12, backgroundColor: theme.colors.background.elevated },
    infoTitle: { color: theme.colors.text.primary, fontWeight: "800", marginBottom: 6 },
    infoText: { color: theme.colors.text.secondary },
    actions: { marginTop: 16, gap: 10, width: "100%" },
    primaryBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
    primaryText: { color: theme.colors.text.inverse, fontWeight: "900" },
    outlineBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: theme.colors.border.light },
    outlineText: { color: theme.colors.text.primary, fontWeight: "900" },
    textBtn: { alignItems: "center", paddingVertical: 8 },
    textBtnText: { color: theme.colors.text.secondary, fontWeight: "700" }
  });
}
