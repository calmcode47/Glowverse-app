import React from "react";
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as OrdersAPI from "../../services/api/orders.api";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AddressCard from "../../components/profile/AddressCard";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AddressesScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<OrdersAPI.Address[]>([]);

  const load = React.useCallback(async () => {
    const userId = user?.id || "guest";
    try {
      setLoading(true);
      const list = await OrdersAPI.getUserAddresses(userId);
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const onDelete = (id: string) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const userId = user?.id || "guest";
            await OrdersAPI.deleteUserAddress?.(userId, id);
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
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <LinearGradient colors={theme.colors.gradients.primary} style={styles.iconGrad}>
              <MaterialCommunityIcons name="map-marker-radius-outline" size={24} color={theme.colors.text.inverse} />
            </LinearGradient>
          </View>
          <View>
            <Text style={styles.title}>Your Addresses</Text>
            <Text style={styles.subtitle}>Shipping and billing saved locations</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("EditAddress")} activeOpacity={0.9} style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add new address">
          <LinearGradient colors={theme.colors.gradients.primary} style={styles.addBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <MaterialCommunityIcons name="plus" size={18} color={theme.colors.text.inverse} />
            <Text style={styles.addBtnText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onEdit={() => navigation.navigate("EditAddress", { address: item })}
            onDelete={() => onDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.centerText}>Loading addresses…</Text>
            </View>
          ) : (
            <View style={styles.center}>
              <MaterialCommunityIcons name="map-marker-off-outline" size={44} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No addresses yet</Text>
              <Text style={styles.emptyDesc}>Add an address to speed up checkout.</Text>
              <TouchableOpacity onPress={() => navigation.navigate("EditAddress")} activeOpacity={0.9} style={styles.emptyCta} accessibilityRole="button" accessibilityLabel="Add your first address">
                <LinearGradient colors={theme.colors.gradients.primary} style={styles.emptyCtaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.emptyCtaText}>Add Address</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

function createStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    header: { paddingTop: 18, paddingHorizontal: 16, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    iconWrap: { width: 46, height: 46, borderRadius: 16, overflow: "hidden" },
    iconGrad: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
    title: { fontSize: 20, fontWeight: "900", color: theme.colors.text.primary },
    subtitle: { marginTop: 2, fontSize: 12, fontWeight: "700", color: theme.colors.text.secondary },
    addBtn: { borderRadius: 14, overflow: "hidden" },
    addBtnGrad: { height: 42, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    addBtnText: { color: theme.colors.text.inverse, fontWeight: "900" },
    listContent: { padding: 16, paddingBottom: 40, gap: 12 },
    center: { paddingHorizontal: 18, paddingTop: 40, alignItems: "center", justifyContent: "center", gap: 10 },
    centerText: { color: theme.colors.text.secondary, fontWeight: "700" },
    emptyTitle: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18, marginTop: 4 },
    emptyDesc: { color: theme.colors.text.secondary, fontWeight: "700", textAlign: "center" },
    emptyCta: { marginTop: 6, borderRadius: 14, overflow: "hidden" },
    emptyCtaGrad: { height: 50, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
    emptyCtaText: { color: theme.colors.text.inverse, fontWeight: "900", fontSize: 15 },
  });
}
