import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Switch } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { Button } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as OrdersAPI from "../../services/api/orders.api";
import { useAuth } from "../../context/AuthContext";

export default function EditAddressScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const existing = route.params?.address as OrdersAPI.Address | undefined;
  const [draft, setDraft] = React.useState({
    fullName: existing?.fullName || "",
    street: existing?.street || "",
    city: existing?.city || "",
    state: existing?.state || "",
    postalCode: existing?.postalCode || "",
    country: existing?.country || "",
    phone: existing?.phone || "",
    isDefault: existing?.isDefault || false
  });
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      if (existing) {
        await OrdersAPI.updateUserAddress(user.id, existing.id, draft);
      } else {
        await OrdersAPI.addUserAddress(user.id, draft);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput style={styles.input} placeholder="Full Name" value={draft.fullName} onChangeText={(t) => setDraft({ ...draft, fullName: t })} accessibilityLabel="Full name" />
      <TextInput style={styles.input} placeholder="Street" value={draft.street} onChangeText={(t) => setDraft({ ...draft, street: t })} accessibilityLabel="Street address" />
      <TextInput style={styles.input} placeholder="City" value={draft.city} onChangeText={(t) => setDraft({ ...draft, city: t })} accessibilityLabel="City" />
      <TextInput style={styles.input} placeholder="State" value={draft.state} onChangeText={(t) => setDraft({ ...draft, state: t })} accessibilityLabel="State or province" />
      <TextInput style={styles.input} placeholder="Postal Code" value={draft.postalCode} onChangeText={(t) => setDraft({ ...draft, postalCode: t })} accessibilityLabel="Postal code" keyboardType="numbers-and-punctuation" />
      <TextInput style={styles.input} placeholder="Country" value={draft.country} onChangeText={(t) => setDraft({ ...draft, country: t })} accessibilityLabel="Country" />
      <TextInput style={styles.input} placeholder="Phone" value={draft.phone} onChangeText={(t) => setDraft({ ...draft, phone: t })} accessibilityLabel="Phone number" keyboardType="phone-pad" />
      <View style={styles.row}>
        <Text style={styles.label}>Set as default</Text>
        <Switch value={draft.isDefault} onValueChange={(v) => setDraft({ ...draft, isDefault: v })} />
      </View>
      <Button mode="contained" onPress={save} loading={saving} disabled={saving} accessibilityLabel="Save address" accessibilityRole="button">Save</Button>
    </ScrollView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { padding: 16, gap: 10, backgroundColor: theme.colors.background.primary, flexGrow: 1 },
    input: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: theme.colors.text.primary },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
    label: { color: theme.colors.text.primary, fontWeight: "700" }
  });
}
