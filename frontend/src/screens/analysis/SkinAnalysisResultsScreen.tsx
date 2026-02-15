import React from "react";
import { View, StyleSheet, ScrollView, Image, FlatList, RefreshControl, Share } from "react-native";
import { Text, Button, Chip } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import ScoreDisplay from "../../components/analysis/ScoreDisplay";
import ConcernCard from "../../components/analysis/ConcernCard";
import ComparisonSlider from "../../components/analysis/ComparisonSlider";
import RecommendationCard from "../../components/analysis/RecommendationCard";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import { analytics } from "../../services/analytics.service";
import * as AnalysisAPI from "../../services/api/analysis.api";
import { skinAnalysisAPI } from "../../services/ai/skinAnalysisAPI.service";
import type { SkinAnalysisResult, SkinConcern, ProductRecommendation } from "../../services/ai/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RouteParams = { analysisId?: string; result?: Partial<SkinAnalysisResult>; previousAnalysisId?: string };

function SectionTitle({ children }: React.PropsWithChildren) {
  const { theme } = useTheme();
  return <Text style={{ color: theme.colors.text.primary, fontWeight: "900", fontSize: 16, marginVertical: 8 }}>{children}</Text>;
}

export default function SkinAnalysisResultsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { analysisId, result: initialResult, previousAnalysisId } = (route.params || {}) as RouteParams;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);
  const [previous, setPrevious] = React.useState<any | null>(null);
  const [recs, setRecs] = React.useState<ProductRecommendation[]>([]);

  const width = Dimensions.get("window").width - 32;

  React.useEffect(() => {
    analytics.logScreenView("SkinAnalysisResultsScreen");
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const cached = analysisId ? await AsyncStorage.getItem(`analysis:${analysisId}`) : null;
        if (cached && !initialResult) {
          setResult(JSON.parse(cached));
        }
        const r = await loadResult(analysisId, initialResult);
        setResult(r);
        if (analysisId) await AsyncStorage.setItem(`analysis:${analysisId}`, JSON.stringify(r));
        if (previousAnalysisId) {
          try {
            const prev = await AnalysisAPI.getAnalysis(previousAnalysisId);
            setPrevious(prev.analysis);
          } catch {}
        }
        const recommended = await fetchRecommendations(r);
        setRecs(recommended as any);
      } catch (e: any) {
        setError(e.message || "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    })();
  }, [analysisId]);

  const onRefresh = React.useCallback(async () => {
    if (!analysisId) return;
    setLoading(true);
    try {
      const r = await loadResult(analysisId, initialResult);
      setResult(r);
      if (analysisId) await AsyncStorage.setItem(`analysis:${analysisId}`, JSON.stringify(r));
      const recommended = await fetchRecommendations(r);
      setRecs(recommended as any);
    } catch (e: any) {
      setError(e.message || "Failed to refresh");
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  const shareResult = async () => {
    try {
      const url = result?.imageUrl;
      if (!url) return;
      await Share.share({ url, message: "My Glowverse skin analysis results" });
    } catch {}
  };

  const onLongPressConcern = async (c: SkinConcern) => {
    try {
      await Share.share({ message: `Concern: ${c.type} (${c.severity})` });
    } catch {}
  };

  return (
    <ErrorBoundary onRetry={() => onRefresh()}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Skin Analysis</Text>
              <Text style={styles.subtitle}>{result ? new Date((result as any).timestamp || Date.now()).toLocaleString() : ""}</Text>
              {result?.skinType ? (
                <Chip style={styles.badge} accessibilityLabel={`Skin type ${result.skinType}`}>{String(result.skinType).toUpperCase()}</Chip>
              ) : null}
            </View>
            <ScoreDisplay score={result?.scores?.overall ?? 0} />
          </View>

          {/* Comparison */}
          {previous ? (
            <>
              <SectionTitle>Comparison</SectionTitle>
              <ComparisonSlider
                leftImage={previous.processedImageUrl || previous.originalImageUrl}
                rightImage={result?.imageUrl}
                height={220}
              />
            </>
          ) : null}

          {/* Concerns */}
          <SectionTitle>Concerns</SectionTitle>
          {result?.concerns && result.concerns.length > 0 ? (
            <FlatList<SkinConcern>
              data={result.concerns}
              keyExtractor={(c, i) => `${c.type}-${i}`}
              renderItem={({ item }: { item: SkinConcern }) => <ConcernCard item={item} onLongPressShare={onLongPressConcern} />}
              contentContainerStyle={{ gap: 8 }}
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No concerns detected</Text>
              <Text style={styles.emptyText}>Great job! Keep your routine consistent.</Text>
            </View>
          )}

          {/* Scores */}
          <SectionTitle>Scores</SectionTitle>
          <View style={styles.chartsRow}>
            <ProgressChart
              data={{
                labels: ["Hydration", "Texture", "Clarity"],
                data: [
                  (result?.scores?.hydration ?? 0) / 100,
                  (result?.scores?.texture ?? 0) / 100,
                  (result?.scores?.clarity ?? 0) / 100
                ]
              }}
              width={width}
              height={180}
              strokeWidth={12}
              radius={24}
              chartConfig={{
                backgroundGradientFrom: "#111827",
                backgroundGradientTo: "#111827",
                color: () => "#A78BFA",
                labelColor: () => "#D1D5DB",
                propsForBackgroundLines: { stroke: "#1F2937" }
              }}
              hideLegend={false}
            />
          </View>

          {/* Recommendations */}
          <SectionTitle>Recommendations</SectionTitle>
          <View style={{ gap: 8 }}>
            {recs && recs.length > 0 ? (
              recs.slice(0, 8).map((r: ProductRecommendation) => (
                <RecommendationCard key={r.productId} product={{ id: r.productId, name: r.name, image: undefined, price: 0 } as any} reason={r.reason} />
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No recommendations</Text>
                <Text style={styles.emptyText}>We’ll suggest products once we have enough data.</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button mode="contained" onPress={shareResult} accessibilityLabel="Share results">Share</Button>
            <Button mode="outlined" onPress={() => navigation.goBack()} accessibilityLabel="Back">Done</Button>
          </View>
        </ScrollView>
        <LoadingOverlay visible={loading} message="Loading results..." />
      </View>
    </ErrorBoundary>
  );
}

async function loadResult(analysisId?: string, initial?: Partial<SkinAnalysisResult> | undefined): Promise<SkinAnalysisResult> {
  if (initial?.analysisId) return initial as SkinAnalysisResult;
  if (!analysisId) throw new Error("Missing analysis id");
  try {
    const res = await AnalysisAPI.getAnalysis(analysisId);
    const anyRes: any = res.analysis?.results || {};
    return {
      analysisId: analysisId,
      userId: "me",
      skinType: anyRes.skinType || "combination",
      skinTypeConfidence: anyRes.skinTypeConfidence || 0.7,
      skinTone: anyRes.skinTone || "#E7C4A8",
      concerns: (anyRes.concerns || []) as SkinConcern[],
      recommendations: (anyRes.recommendations || []) as ProductRecommendation[],
      scores: {
        overall: anyRes.skinScore ?? 70,
        hydration: anyRes.hydration ?? 70,
        texture: anyRes.texture ?? 65,
        clarity: anyRes.clarity ?? 68
      },
      imageUrl: res.analysis.processedImageUrl || res.analysis.originalImageUrl,
      timestamp: Date.parse(res.analysis.createdAt)
    } as any;
  } catch {
    const fallback = await skinAnalysisAPI.getAnalysis(analysisId);
    return fallback as any;
  }
}

async function fetchRecommendations(r: SkinAnalysisResult): Promise<ProductRecommendation[]> {
  if (r?.recommendations?.length) return r.recommendations;
  const topConcerns = (r?.concerns || []).map(c => c.type).slice(0, 3);
  const items = await skinAnalysisAPI.getRecommendations({ skinType: r.skinType, concerns: topConcerns });
  return items as any;
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0F14" },
    content: { padding: 16, gap: 12 },
    header: { flexDirection: "row", alignItems: "center", gap: 12 },
    title: { color: "#fff", fontWeight: "900", fontSize: 18 },
    subtitle: { color: "#9CA3AF", marginTop: 2 },
    badge: { alignSelf: "flex-start", marginTop: 6, backgroundColor: "rgba(167, 139, 250, 0.15)" },
    chartsRow: { gap: 8 },
    empty: { alignItems: "center", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#1F2937", backgroundColor: "#0F172A" },
    emptyTitle: { color: "#E5E7EB", fontWeight: "800" },
    emptyText: { color: "#94A3B8", marginTop: 6 },
    actions: { flexDirection: "row", gap: 10, marginTop: 12 }
  });
}
