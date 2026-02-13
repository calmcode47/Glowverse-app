import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import * as AnalysisAPI from "../../services/api/analysis.api";
import AnalysisTimeline from "../../components/analysis/AnalysisTimeline";
import ComparisonView from "../../components/analysis/ComparisonView";
import InsightsCard from "../../components/analysis/InsightsCard";

export default function AnalysisHistoryScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [items, setItems] = React.useState<AnalysisAPI.Analysis[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [leftId, setLeftId] = React.useState<string | null>(null);
  const [rightId, setRightId] = React.useState<string | null>(null);
  const [compareOpen, setCompareOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await AnalysisAPI.getAnalyses({ limit: 50 });
      setItems(res.analyses || []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const firstScore = (items[0] as any)?.results?.skinScore ?? 60;
  const lastScore = (items[items.length - 1] as any)?.results?.skinScore ?? (firstScore + 5);
  const improvement = items.length > 1 ? ((lastScore - firstScore) / Math.max(1, firstScore)) * 100 : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analysis History</Text>
      {loading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.subtitle}>No analyses yet</Text>
          <Button mode="contained">Take your first skin analysis</Button>
        </View>
      ) : (
        <>
          <InsightsCard improvementPct={improvement} hydrationDelta={2} notes="Keep your routine consistent for best results." />
          <AnalysisTimeline items={items} onPress={() => {}} />
          <View style={styles.actions}>
            <Button mode="outlined" onPress={() => {
              setLeftId(items[0]?.id || null);
              setRightId(items[1]?.id || null);
              setCompareOpen(true);
            }}>Compare Analyses</Button>
            <Button mode="outlined">Export Report</Button>
          </View>
          <ComparisonView visible={compareOpen} onClose={() => setCompareOpen(false)} left={items.find(i => i.id === leftId) || null} right={items.find(i => i.id === rightId) || null} />
        </>
      )}
    </ScrollView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { padding: 16, backgroundColor: theme.colors.background.primary },
    center: { alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
    title: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18, marginBottom: 8 },
    subtitle: { color: theme.colors.text.secondary, marginBottom: 8 },
    actions: { flexDirection: "row", gap: 8, marginTop: 12 }
  });
}
