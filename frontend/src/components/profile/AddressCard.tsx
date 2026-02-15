import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Address } from "../../services/api/orders.api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <LinearGradient colors={theme.colors.gradients.primary} style={styles.iconGrad}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={theme.colors.text.inverse} />
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{address.fullName}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{address.street}</Text>
          </View>
        </View>
        {address.isDefault ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Default</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.line} numberOfLines={2}>{address.city}, {address.state} {address.postalCode}</Text>
      <Text style={styles.line} numberOfLines={1}>{address.country}</Text>
      {address.phone ? <Text style={styles.line}>{address.phone}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity onPress={onEdit} style={styles.btn} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Edit address">
          <MaterialCommunityIcons name="pencil-outline" size={16} color={theme.colors.text.primary} />
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={[styles.btn, { borderColor: theme.colors.error }]} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Delete address">
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={theme.colors.error} />
          <Text style={[styles.btnText, { color: theme.colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 16, padding: 14, gap: 6 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    iconWrap: { width: 34, height: 34, borderRadius: 12, overflow: "hidden" },
    iconGrad: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
    name: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 15 },
    subtitle: { color: theme.colors.text.secondary, fontWeight: "700", marginTop: 2, fontSize: 12 },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: theme.colors.accent.emerald + "18", borderWidth: 1, borderColor: theme.colors.accent.emerald + "33" },
    badgeText: { color: theme.colors.accent.emerald, fontWeight: "900", fontSize: 12 },
    line: { color: theme.colors.text.secondary, fontWeight: "600" },
    row: { flexDirection: "row", gap: 10, marginTop: 10 },
    btn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.primary },
    btnText: { color: theme.colors.text.primary, fontWeight: "900" }
  });
}
