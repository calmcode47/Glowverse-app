import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as OrdersAPI from "../../services/api/orders.api";
import OrderCard from "../../components/orders/OrderCard";
import { useNavigation } from "@react-navigation/native";

export default function OrderHistoryScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const [orders, setOrders] = React.useState<OrdersAPI.Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const list = await OrdersAPI.listOrders();
      setOrders(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Your Orders</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Text style={{ color: theme.colors.text.primary, fontWeight: "800" }}>No orders yet</Text>
          <Text style={{ color: theme.colors.text.secondary }}>Your past orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })} />
          )}
        />
      )}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 },
    title: { fontSize: 20, fontWeight: "800" }
  });
}
