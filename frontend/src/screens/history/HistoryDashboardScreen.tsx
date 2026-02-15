import React from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from "react-native";
import { Text, Button, SegmentedButtons, ActivityIndicator } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import { useNavigation } from "@react-navigation/native";
import { analytics } from "../../services/analytics.service";
import SearchBar from "../../components/ui/SearchBar";
import Timeline from "../../components/history/Timeline";
import GridView from "../../components/history/GridView";
import FilterPanel from "../../components/history/FilterPanel";
import { aggregateActivity } from "../../services/history/aggregate.service";
import { getCachedHistory, setCachedHistory } from "../../services/history/cache.service";
import { exportHistory } from "../../services/history/export.service";
import type { ActivityItem, HistoryTab, QuickStatsData } from "../../services/history/types";

function QuickStats({ data }: { data: QuickStatsData }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 10, marginVertical: 8 }}>
      <View style={[styles.stat, { borderColor: theme.colors.border.light }]}><Text style={styles.statTitle}>Analyses</Text><Text style={styles.statValue}>{data.analysesCount}</Text></View>
      <View style={[styles.stat, { borderColor: theme.colors.border.light }]}><Text style={styles.statTitle}>AR Try-Ons</Text><Text style={styles.statValue}>{data.productsTriedAR || 0}</Text></View>
      <View style={[styles.stat, { borderColor: theme.colors.border.light }]}><Text style={styles.statTitle}>Orders</Text><Text style={styles.statValue}>{data.ordersCount || 0}</Text></View>
    </View>
  );
}

export default function HistoryDashboardScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = React.useState<HistoryTab>('all');
  const [viewMode, setViewMode] = React.useState<'timeline' | 'grid'>('timeline');
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ dateRange: 'all', types: [], sortBy: 'date_desc' } as any);
  const [items, setItems] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    analytics.logScreenView("HistoryDashboard");
    (async () => {
      const cached = await getCachedHistory();
      if (cached) setItems(cached);
      await load();
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await aggregateActivity();
      setItems(data);
      await setCachedHistory(data);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const debouncedSetQuery = React.useRef<any>(null);
  const onSearch = (text: string) => {
    setQuery(text);
    if (debouncedSetQuery.current) clearTimeout(debouncedSetQuery.current);
    debouncedSetQuery.current = setTimeout(() => {}, 250);
  };

  const filtered: ActivityItem[] = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const allowTypes = new Set<string>(filters.types || []);
    const byTab = activeTab === 'all' ? (x: ActivityItem) => true : (x: ActivityItem) => x.type === (activeTab === 'tryons' ? 'tryon' : activeTab);
    const byType = (x: ActivityItem) => allowTypes.size === 0 || allowTypes.has(x.type === 'tryon' ? 'tryons' : x.type);
    const byQuery = (x: ActivityItem) => q.length === 0 || x.title.toLowerCase().includes(q) || (x.description || '').toLowerCase().includes(q);
    let arr = items.filter(i => byTab(i) && byType(i) && byQuery(i));
    if (filters.sortBy === 'date_asc') arr = arr.slice().sort((a, b) => a.timestamp - b.timestamp);
    return arr;
  }, [items, query, filters, activeTab]);

  const stats: QuickStatsData = React.useMemo(() => {
    const analysesCount = items.filter(i => i.type === 'analysis').length;
    const ordersCount = items.filter(i => i.type === 'order').length;
    const productsTriedAR = items.filter(i => i.type === 'tryon').length;
    const lastAnalysis = items.find(i => i.type === 'analysis');
    return { analysesCount, ordersCount, productsTriedAR, lastAnalysisDate: lastAnalysis ? new Date(lastAnalysis.timestamp).toISOString() : undefined, improvementScore: undefined, activeDays: undefined };
  }, [items]);

  const exportData = async (fmt: 'pdf' | 'json' | 'csv') => {
    const out = await exportHistory(fmt, filtered);
    analytics.logEvent({ name: "history_export", properties: { format: fmt } });
    return out;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <SegmentedButtons
            value={viewMode}
            onValueChange={(v: any) => setViewMode(v)}
            buttons={[
              { value: 'timeline', label: 'Timeline' },
              { value: 'grid', label: 'Grid' }
            ]}
          />
        </View>
        <QuickStats data={stats} />
        <View style={styles.tabs}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={(v: any) => setActiveTab(v)}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'analysis', label: 'Skin' },
              { value: 'fitness', label: 'Fitness' },
              { value: 'tryons', label: 'Try-Ons' },
              { value: 'orders', label: 'Orders' }
            ]}
          />
        </View>
        <SearchBar placeholder="Search history..." onChangeText={onSearch} />
        <FilterPanel value={filters} onChange={setFilters} />
        <View style={{ height: 8 }} />
        {loading ? (
          <View style={styles.center}><ActivityIndicator /></View>
        ) : viewMode === 'timeline' ? (
          <Timeline items={filtered} groupBy="date" onPress={(item) => {
            if (item.type === 'analysis') navigation.navigate('Results', { analysisId: item.id });
            else if (item.type === 'fitness') navigation.navigate('FitnessActivityDetail', { id: item.id });
            else if (item.type === 'tryon') navigation.navigate('ARSessionDetail', { id: item.id });
            else if (item.type === 'order') navigation.navigate('OrderDetail', { orderId: item.id });
          }} />
        ) : (
          <GridView items={filtered} columns={2} contentContainerStyle={{ gap: 10 }} />
        )}
        <View style={styles.actions}>
          <Button mode="contained" onPress={() => exportData('json')}>Export JSON</Button>
          <Button mode="outlined" onPress={() => exportData('csv')}>Export CSV</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 18, fontWeight: "900", color: "#fff" },
  stat: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, gap: 4 },
  statTitle: { color: "#9CA3AF", fontWeight: "700" },
  statValue: { color: "#fff", fontWeight: "900", fontSize: 20 },
  tabs: { marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 8 },
  center: { paddingVertical: 20, alignItems: "center" }
});
