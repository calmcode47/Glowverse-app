import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Address } from "../../services/api/orders.api";

type Props = {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
};

export default function AddressCard({ address, onEdit, onDelete }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.name}>{address.fullName}</Text>
        {address.isDefault ? <Text style={styles.badge}>Default</Text> : null}
      </View>
      <Text style={styles.line}>{address.street}</Text>
      <Text style={styles.line}>{address.city}, {address.state} {address.postalCode}</Text>
      <Text style={styles.line}>{address.country}</Text>
      {address.phone ? <Text style={styles.line}>{address.phone}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity onPress={onEdit} style={styles.btn}><Text style={styles.btnText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={[styles.btn, { borderColor: theme.colors.error }]}><Text style={[styles.btnText, { color: theme.colors.error }]}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12, gap: 4 },
    name: { color: theme.colors.text.primary, fontWeight: "800" },
    badge: { color: theme.colors.accent.emerald, fontWeight: "800" },
    line: { color: theme.colors.text.secondary },
    row: { flexDirection: "row", gap: 8, marginTop: 8 },
    btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light },
    btnText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
