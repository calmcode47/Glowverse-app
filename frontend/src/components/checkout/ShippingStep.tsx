import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/themeContext";
import * as OrdersAPI from "../../services/api/orders.api";
import { useAuth } from "../../context/AuthContext";
import AddressForm from "./AddressForm";

type Props = {
  selectedId?: string;
  onSelect: (id: string) => void;
};

export default function ShippingStep({ selectedId, onSelect }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addresses, setAddresses] = React.useState<OrdersAPI.Address[]>([]);
  const [formOpen, setFormOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const list = await OrdersAPI.getUserAddresses(user.id);
      setAddresses(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const addAddress = async (draft: Omit<OrdersAPI.Address, "id" | "isDefault"> & { isDefault?: boolean }) => {
    if (!user?.id) return;
    const saved = await OrdersAPI.addUserAddress(user.id, draft);
    setAddresses((prev) => [saved, ...prev]);
    onSelect(saved.id);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.error, marginBottom: 8 }}>{error}</Text>
        <TouchableOpacity onPress={load} style={styles.retry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={addresses}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelect(item.id)}
            style={[styles.card, selectedId === item.id && { borderColor: theme.colors.accent.emerald }]}
          >
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.addr}>{item.street}, {item.city}</Text>
            <Text style={styles.addr}>{item.state} {item.postalCode}, {item.country}</Text>
            {item.phone ? <Text style={styles.addr}>{item.phone}</Text> : null}
            {item.isDefault ? <Text style={[styles.badge, { color: theme.colors.accent.emerald }]}>Default</Text> : null}
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity onPress={() => setFormOpen(true)} style={styles.addBtn}>
            <Text style={styles.addText}>Add New Address</Text>
          </TouchableOpacity>
        }
      />
      <AddressForm
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={addAddress}
      />
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    center: { alignItems: "center", justifyContent: "center", padding: 16 },
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 12,
      padding: 12
    },
    name: { color: theme.colors.text.primary, fontWeight: "800" },
    addr: { color: theme.colors.text.secondary, marginTop: 2 },
    badge: { marginTop: 4, fontWeight: "700" },
    addBtn: { margin: 16, alignSelf: "flex-start" },
    addText: { color: theme.colors.accent.emerald, fontWeight: "800" },
    retry: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.colors.accent.emerald },
    retryText: { color: theme.colors.text.inverse, fontWeight: "800" }
  });
}
