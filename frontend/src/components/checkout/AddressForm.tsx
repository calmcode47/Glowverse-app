import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Address } from "../../services/api/orders.api";

type Draft = Omit<Address, "id" | "isDefault"> & { isDefault?: boolean };

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: Draft) => Promise<void>;
};

export default function AddressForm({ visible, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [draft, setDraft] = React.useState<Draft>({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: ""
  });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const validate = () => {
    if (!draft.fullName || !draft.street || !draft.city || !draft.state || !draft.postalCode || !draft.country) {
      setError("All fields are required");
      return false;
    }
    return true;
  };
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add Address</Text>
          <ScrollView contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
            <TextInput style={styles.input} placeholder="Full Name" value={draft.fullName} onChangeText={(t) => setDraft({ ...draft, fullName: t })} />
            <TextInput style={styles.input} placeholder="Street Address" value={draft.street} onChangeText={(t) => setDraft({ ...draft, street: t })} />
            <TextInput style={styles.input} placeholder="City" value={draft.city} onChangeText={(t) => setDraft({ ...draft, city: t })} />
            <TextInput style={styles.input} placeholder="State/Province" value={draft.state} onChangeText={(t) => setDraft({ ...draft, state: t })} />
            <TextInput style={styles.input} placeholder="Postal Code" value={draft.postalCode} onChangeText={(t) => setDraft({ ...draft, postalCode: t })} />
            <TextInput style={styles.input} placeholder="Country" value={draft.country} onChangeText={(t) => setDraft({ ...draft, country: t })} />
            <TextInput style={styles.input} placeholder="Phone Number" value={draft.phone} onChangeText={(t) => setDraft({ ...draft, phone: t })} />
            {error ? <Text style={{ color: theme.colors.error }}>{error}</Text> : null}
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                setError(null);
                if (!validate()) return;
                setLoading(true);
                try {
                  await onSave(draft);
                  onClose();
                } catch (e: any) {
                  setError(e?.message || "Failed to save");
                } finally {
                  setLoading(false);
                }
              }}
              style={styles.primary}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
    sheet: { backgroundColor: theme.colors.background.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border.light, maxHeight: "80%" },
    title: { color: theme.colors.text.primary, fontWeight: "800", fontSize: 16, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, color: theme.colors.text.primary },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
    secondary: { paddingHorizontal: 14, paddingVertical: 10 },
    secondaryText: { color: theme.colors.text.primary, fontWeight: "700" },
    primary: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.colors.accent.emerald, borderRadius: 10 },
    primaryText: { color: theme.colors.text.inverse, fontWeight: "800" }
  });
}
