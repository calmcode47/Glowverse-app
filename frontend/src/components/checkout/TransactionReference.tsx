import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = {
  transactionId?: string;
};

export default function TransactionReference({ transactionId }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  if (!transactionId) return null as any;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Reference</Text>
      <Text style={styles.value}>{transactionId}</Text>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    wrap: { marginTop: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: 8, backgroundColor: theme.colors.background.elevated },
    label: { color: theme.colors.text.secondary, marginBottom: 4 },
    value: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
