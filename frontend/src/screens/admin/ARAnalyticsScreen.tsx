import React from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useTheme } from "../../theme/themeContext";
import LineChartCard from "../../components/admin/charts/LineChartCard";
import BarChartCard from "../../components/admin/charts/BarChartCard";
import PieChartCard from "../../components/admin/charts/PieChartCard";
import MetricCard from "../../components/admin/charts/MetricCard";
import DateRangePicker from "../../components/admin/DateRangePicker";

export default function ARAnalyticsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [range, setRange] = React.useState({ start: new Date(Date.now() - 14 * 86400000), end: new Date() });
  const [loading, setLoading] = React.useState(false);
  const [sessions, setSessions] = React.useState<{ x: Date; y: number }[]>([]);
  const [topProducts, setTopProducts] = React.useState<{ label: string; value: number }[]>([]);
  const [segments, setSegments] = React.useState<{ label: string; value: number }[]>([]);
  const [metrics, setMetrics] = React.useState({ sessionsTotal: 0, cartRate: 0, purchaseRate: 0, avgDuration: 0, productsPerSession: 0, analyses: 0 });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const days = Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86400000));
      const s = new Array(days).fill(0).map((_, i) => ({ x: new Date(range.start.getTime() + i * 86400000), y: Math.round(Math.random() * 200) + 20 }));
      setSessions(s);
      setMetrics({ sessionsTotal: s.reduce((a, b) => a + b.y, 0), cartRate: 12.3, purchaseRate: 5.6, avgDuration: 140, productsPerSession: 2.1, analyses: 532 });
      setTopProducts([{ label: "Lipstick B", value: 320 }, { label: "Serum A", value: 280 }, { label: "Foundation D", value: 210 }]);
      setSegments([{ label: "New", value: 35 }, { label: "Casual", value: 40 }, { label: "Frequent", value: 18 }, { label: "Power", value: 7 }]);
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />} contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={[styles.header, { color: theme.colors.text.primary }]}>AR & AI Analytics</Text>
        <DateRangePicker value={range} onChange={setRange} />
        <View style={styles.metrics}>
          <MetricCard label="AR Sessions" value={metrics.sessionsTotal} />
          <MetricCard label="AR→Cart" value={`${metrics.cartRate}%`} />
          <MetricCard label="AR→Purchase" value={`${metrics.purchaseRate}%`} />
          <MetricCard label="AI Analyses" value={metrics.analyses} />
          <MetricCard label="Avg Duration (s)" value={metrics.avgDuration} />
          <MetricCard label="Products/Session" value={metrics.productsPerSession} />
        </View>
        <LineChartCard title="AR Sessions Over Time" data={sessions} />
        <BarChartCard title="Top Products Tried" data={topProducts} horizontal />
        <PieChartCard title="AR User Segments" data={segments} />
      </ScrollView>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: { fontSize: 18, fontWeight: "900" },
    metrics: { flexDirection: "row", flexWrap: "wrap", gap: 12 }
  });
}

