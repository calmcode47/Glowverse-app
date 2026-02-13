import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as TryOnAPI from "../../services/api/tryon.api";
import TryOnCard from "../../components/ar/TryOnCard";
import TryOnDetailModal from "../../components/ar/TryOnDetailModal";

export default function TryOnHistoryScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [items, setItems] = React.useState<TryOnAPI.TryOn[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<TryOnAPI.TryOn | null>(null);

  const load = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await TryOnAPI.getTryOns({ limit: 50 });
      setItems(res.items || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load history");
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
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Try-On History</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Text style={{ color: theme.colors.text.primary, fontWeight: "800" }}>No try-ons yet</Text>
          <Text style={{ color: theme.colors.text.secondary }}>Try on products to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => <TryOnCard item={item} onPress={() => setActive(item)} onFavorite={async () => { try { await TryOnAPI.saveFavorite(item.id); } catch {} }} />}
        />
      )}
      <TryOnDetailModal visible={!!active} item={active} onClose={() => setActive(null)} onDeleted={(id) => setItems((prev) => prev.filter((i) => i.id !== id))} />
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
