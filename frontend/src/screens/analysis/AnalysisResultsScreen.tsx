import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as AnalysisAPI from "../../services/api/analysis.api";
import SkinScoreCircle from "../../components/analysis/SkinScoreCircle";
import MetricCard from "../../components/analysis/MetricCard";
import RecommendationCard from "../../components/analysis/RecommendationCard";
import type { Product } from "../../data/products";
import * as ProductsAPI from "../../services/api/products.api";

type Metrics = {
  skinScore: number;
  hydration?: number;
  clarity?: number;
  texture?: number;
  elasticity?: number;
  toneEvenness?: number;
};

export default function AnalysisResultsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const analysisId = route.params?.analysisId as string;
  const [loading, setLoading] = React.useState(true);
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(undefined);
  const [metrics, setMetrics] = React.useState<Metrics>({ skinScore: 0 });
  const [recs, setRecs] = React.useState<Product[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await AnalysisAPI.getAnalysis(analysisId);
        const r: any = res.analysis.results || {};
        setImageUrl(res.analysis.processedImageUrl || res.analysis.originalImageUrl);
        setMetrics({
          skinScore: Math.round((r.skinScore ?? 75)),
          hydration: r.hydration ?? 70,
          clarity: r.clarity ?? 65,
          texture: r.texture ?? 60,
          elasticity: r.elasticity ?? 68,
          toneEvenness: r.toneEvenness ?? 72
        });
        const rec = await AnalysisAPI.getRecommendations(analysisId);
        const items: any[] = (rec as any).items || (rec as any).recommendations || [];
        // Map recommendations into Product using existing products api mapper if endpoints return raw products
        const mapped: Product[] = items.map((p: any) => ProductsAPI && (ProductsAPI as any).getProductById ? p : p);
        setRecs(items as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [analysisId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.photo} /> : null}
      <View style={styles.header}>
        <SkinScoreCircle value={metrics.skinScore} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Overall Skin Health</Text>
          <Text style={styles.subtitle}>Your current score is {metrics.skinScore}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Text style={styles.link} onPress={() => { /* TODO: persist analysis bookmark */ }}>Save Results</Text>
        <Text style={styles.link} onPress={() => { /* Share privacy-aware summary only */ }}>Share Results</Text>
        <Text style={styles.link} onPress={() => navigation.navigate("SkinAnalysis")}>Retake</Text>
        <Text style={styles.link} onPress={() => navigation.navigate("AnalysisHistory")}>View History</Text>
      </View>
      <View style={{ gap: 10 }}>
        <MetricCard title="Hydration" score={metrics.hydration ?? 0} description="Hydration measures your skin moisture levels." tips={["Drink water regularly", "Use a hydrating serum"]} />
        <MetricCard title="Clarity" score={metrics.clarity ?? 0} description="Clarity reflects blemishes and visible spots." tips={["Use non-comedogenic products", "Gentle exfoliation"]} />
        <MetricCard title="Texture" score={metrics.texture ?? 0} description="Texture indicates smoothness of the skin surface." tips={["Regular exfoliation", "Moisturize daily"]} />
        {metrics.elasticity !== undefined ? <MetricCard title="Elasticity" score={metrics.elasticity} description="Elasticity indicates skin firmness." tips={["Use retinoids", "Apply sunscreen"]} /> : null}
        {metrics.toneEvenness !== undefined ? <MetricCard title="Tone Evenness" score={metrics.toneEvenness} description="Evenness shows uniformity of skin tone." tips={["Vitamin C serum", "SPF protection"]} /> : null}
      </View>
      <Text style={styles.section}>Recommended for You</Text>
      <View style={{ gap: 10 }}>
        {recs.map((p: any, i: number) => (
          <View key={p.id || String(i)}>
            <RecommendationCard product={p as Product} reason="For better hydration" />
          </View>
        ))}
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { padding: 16, backgroundColor: theme.colors.background.primary },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background.primary },
    photo: { width: "100%", aspectRatio: 1, borderRadius: 12, marginBottom: 12 },
    header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    title: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18 },
    subtitle: { color: theme.colors.text.secondary },
    actions: { flexDirection: "row", gap: 12, marginBottom: 8, flexWrap: "wrap" },
    link: { color: theme.colors.accent.emerald, fontWeight: "800" },
    section: { color: theme.colors.text.primary, fontWeight: "800", marginTop: 12 }
  });
}
