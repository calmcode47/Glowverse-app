import React from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useTheme } from "../../theme/themeContext";
import LineChartCard from "../../components/admin/charts/LineChartCard";
import MetricCard from "../../components/admin/charts/MetricCard";
import DateRangePicker from "../../components/admin/DateRangePicker";

export default function UserEngagementScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [range, setRange] = React.useState({ start: new Date(Date.now() - 30 * 86400000), end: new Date() });
  const [loading, setLoading] = React.useState(false);
  const [growth, setGrowth] = React.useState<{ x: Date; y: number }[]>([]);
  const [active, setActive] = React.useState<{ x: Date; y: number }[]>([]);
  const [metrics, setMetrics] = React.useState({ users: 0, newUsers: 0, dau: 0, retention: 0, churn: 0, sessionDuration: 0, sessionsPerUser: 0 });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const days = Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86400000));
      const data = new Array(days).fill(0).map((_, i) => ({ x: new Date(range.start.getTime() + i * 86400000), y: Math.round(Math.random() * 1000) }));
      setGrowth(data);
      setActive(data.map(d => ({ x: d.x, y: Math.round(d.y * 0.4) })));
      setMetrics({
        users: 50234, newUsers: 324, dau: 4230, retention: 42, churn: 3.2, sessionDuration: 5.6, sessionsPerUser: 2.3
      });
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />} contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={[styles.header, { color: theme.colors.text.primary }]}>User Engagement</Text>
        <DateRangePicker value={range} onChange={setRange} />
        <View style={styles.metrics}>
          <MetricCard label="Total Users" value={metrics.users} delta={1.2} />
          <MetricCard label="New Users" value={metrics.newUsers} />
          <MetricCard label="DAU" value={metrics.dau} />
          <MetricCard label="Retention" value={`${metrics.retention}%`} />
          <MetricCard label="Churn" value={`${metrics.churn}%`} />
          <MetricCard label="Avg Session (min)" value={metrics.sessionDuration} />
          <MetricCard label="Sessions/User" value={metrics.sessionsPerUser} />
        </View>
        <LineChartCard title="User Growth" data={growth} />
        <LineChartCard title="Active Users Trend" data={active} color="#7C3AED" />
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

