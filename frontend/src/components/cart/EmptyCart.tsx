import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = { onBrowse: () => void };

export default function EmptyCart({ onBrowse }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your cart is empty</Text>
      <Text style={styles.subtitle}>Discover amazing products</Text>
      <TouchableOpacity onPress={onBrowse} style={styles.btn}>
        <Text style={styles.btnText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { color: theme.colors.text.primary, fontWeight: "800", fontSize: 18 },
    subtitle: { color: theme.colors.text.secondary, marginTop: 6 },
    btn: { marginTop: 12, backgroundColor: theme.colors.accent.emerald, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
    btnText: { color: theme.colors.text.inverse, fontWeight: "800" }
  });
}
