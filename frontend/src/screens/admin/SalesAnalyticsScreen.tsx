import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Text } from "react-native";
import { useTheme } from "../../theme/themeContext";
import LineChartCard from "../../components/admin/charts/LineChartCard";
import BarChartCard from "../../components/admin/charts/BarChartCard";
import PieChartCard from "../../components/admin/charts/PieChartCard";
import MetricCard from "../../components/admin/charts/MetricCard";
import DateRangePicker from "../../components/admin/DateRangePicker";
import ExportModal from "../../components/admin/ExportModal";
import ExportButton from "../../components/admin/ExportButton";
import { adminDataExportService } from "../../services/adminDataExportService";

export default function SalesAnalyticsScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [range, setRange] = React.useState({ start: new Date(Date.now() - 7 * 86400000), end: new Date() });
  const [loading, setLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [metrics, setMetrics] = React.useState({ revenue: 0, orders: 0, aov: 0, conversion: 0 });
  const [series, setSeries] = React.useState<{ x: Date; y: number }[]>([]);
  const [byCategory, setByCategory] = React.useState<{ label: string; value: number }[]>([]);
  const [byStatus, setByStatus] = React.useState<{ label: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = React.useState<{ label: string; value: number }[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // Mock data for charts; in production, call admin analytics endpoints
      const days = Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86400000));
      const s = new Array(days).fill(0).map((_, i) => ({ x: new Date(range.start.getTime() + i * 86400000), y: Math.round(Math.random() * 500) + 100 }));
      setSeries(s);
      setMetrics({
        revenue: s.reduce((a, b) => a + b.y, 0),
        orders: s.length * 3,
        aov: Math.round((s.reduce((a, b) => a + b.y, 0) / Math.max(1, s.length * 3)) * 100) / 100,
        conversion: 3.4
      });
      setByCategory([
        { label: "Skincare", value: 1200 },
        { label: "Makeup", value: 800 },
        { label: "Hair", value: 400 }
      ]);
      setByStatus([
        { label: "Processing", value: 15 },
        { label: "Shipped", value: 35 },
        { label: "Delivered", value: 42 },
        { label: "Cancelled", value: 8 }
      ]);
      setTopProducts([
        { label: "Serum A", value: 2400 },
        { label: "Lipstick B", value: 1800 },
        { label: "Moisturizer C", value: 1500 }
      ]);
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => { load(); }, [load]);

  const onExport = async (fmt: "csv" | "xlsx" | "json") => {
    setExporting(true);
    try {
      const path = await adminDataExportService.exportSalesData(range, fmt);
      await adminDataExportService.shareExportedFile(path);
    } finally {
      setExporting(false);
      setShowExport(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} /> } contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={[styles.header, { color: theme.colors.text.primary }]}>Sales Analytics</Text>
        <DateRangePicker value={range} onChange={setRange} />

        <View style={styles.metrics}>
          <MetricCard label="Revenue" value={`$${metrics.revenue.toFixed(2)}`} delta={2.3} />
          <MetricCard label="Orders" value={metrics.orders} delta={1.1} />
          <MetricCard label="Avg Order Value" value={`$${metrics.aov.toFixed(2)}`} />
          <MetricCard label="Conversion Rate" value={`${metrics.conversion}%`} />
        </View>

        <LineChartCard title="Revenue Over Time" data={series} yLabel="Revenue ($)" loading={loading} />
        <BarChartCard title="Revenue by Category" data={byCategory} loading={loading} />
        <PieChartCard title="Orders by Status" data={byStatus} />
        <BarChartCard title="Top Products by Revenue" data={topProducts} horizontal />
      </ScrollView>
      <ExportButton onPress={() => setShowExport(true)} />
      <ExportModal visible={showExport} onClose={() => setShowExport(false)} onExport={onExport} exporting={exporting} />
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

