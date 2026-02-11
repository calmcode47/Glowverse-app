import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, ActivityIndicator, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import * as UserAPI from "@services/api/user.api";
import HistoryItem from "@components/history/HistoryItem";

import { useTheme } from "../../theme/themeContext";
export default function HistoryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [analyses, setAnalyses] = React.useState<any[]>([]);
  const [tryOns, setTryOns] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await UserAPI.getHistory();
        setAnalyses((res as any).analyses || []);
        setTryOns((res as any).tryOns || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background.elevated }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { padding: 16 }]}>
        <Text>{error}</Text>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>Back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Your History</Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>Analyses</Text>
      <View style={styles.list}>
        {analyses.length === 0 ? <Text variant="bodyMedium">No analyses yet</Text> : analyses.map((a, i) => (
          <HistoryItem
            key={`a-${i}`}
            title={a.type || "Skin Analysis"}
            subtitle={a.status || ""}
            date={a.createdAt || ""}
            imageUri={a.originalImageUrl || a.processedImageUrl}
            badge="Analysis"
            onPress={() => navigation.navigate("Results", { imageUri: a.originalImageUrl } as any)}
          />
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Try-Ons</Text>
      <View style={styles.list}>
        {tryOns.length === 0 ? <Text variant="bodyMedium">No try-ons yet</Text> : tryOns.map((t, i) => (
          <HistoryItem
            key={`t-${i}`}
            title={t.productName || "Virtual Try-On"}
            subtitle={t.type || ""}
            date={t.createdAt || ""}
            imageUri={t.resultImageUrl || t.originalImageUrl}
            badge="Try-On"
            onPress={() => navigation.navigate("Results", { imageUri: t.resultImageUrl || t.originalImageUrl } as any)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: { marginTop: 12, marginBottom: 8 },
  list: { gap: 12 }
});
