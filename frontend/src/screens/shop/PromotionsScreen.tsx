import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import * as PromoAPI from "../../services/api/promotions.api";
import PromotionCard from "../../components/promotions/PromotionCard";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { measureScreenLoad } from "../../utils/performanceMonitor";

export default function PromotionsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const [items, setItems] = React.useState<PromoAPI.Promotion[]>([]);
  const [loading, setLoading] = React.useState(true);
  useEffect(() => {
    const end = measureScreenLoad("Promotions");
    return end;
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const list = await PromoAPI.listPromotions();
        setItems(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onShop = async (code?: string) => {
    if (code) await AsyncStorage.setItem("pendingPromoCode", code);
    navigation.navigate("ShopTab");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <ProfessionalBackground variant="subtle" />
      {items.length === 0 && !loading ? (
        <View style={{ alignItems: "center", paddingTop: 60, gap: 6 }}>
          <Text style={{ color: theme.colors.text.primary, fontWeight: "800" }}>No active promotions</Text>
          <Text style={{ color: theme.colors.text.secondary }}>Check back soon for amazing deals!</Text>
        </View>
      ) : null}
      {items.filter((p) => p.featured).slice(0, 1).map((p) => (
        <PromotionCard key={p.id} promo={p} featured onPress={() => {}} onShop={onShop} onCopied={() => Alert.alert("Copied", "Code copied to clipboard")} />
      ))}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        {items.filter((p) => !p.featured).map((p) => (
          <View key={p.id} style={{ width: "100%" }}>
            <PromotionCard promo={p} onPress={() => {}} onShop={onShop} onCopied={() => Alert.alert("Copied", "Code copied to clipboard")} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary }
  });
}
