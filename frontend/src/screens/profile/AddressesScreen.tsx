import React from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as OrdersAPI from "../../services/api/orders.api";
import { useNavigation } from "@react-navigation/native";
import AddressCard from "../../components/profile/AddressCard";
import { Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export default function AddressesScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<OrdersAPI.Address[]>([]);

  const load = React.useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const list = await OrdersAPI.getUserAddresses(user.id);
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onDelete = (id: string) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!user?.id) return;
            await OrdersAPI.deleteUserAddress?.(user.id, id);
          } catch {}
          load();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Your Addresses</Text>
        <Button mode="contained" onPress={() => navigation.navigate("EditAddress")}>Add New</Button>
      </View>
      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onEdit={() => navigation.navigate("EditAddress", { address: item })}
            onDelete={() => onDelete(item.id)}
          />
        )}
        ListEmptyComponent={!loading ? <Text style={{ color: theme.colors.text.secondary, textAlign: "center", marginTop: 24 }}>No addresses yet</Text> : null}
      />
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "800" }
  });
}
