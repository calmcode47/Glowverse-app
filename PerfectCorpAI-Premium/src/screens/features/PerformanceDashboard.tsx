import React from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { KpiCard } from '@/components/core/cards/KpiCard';
import { CircularProgress } from '@/components/charts/CircularProgress';
import { LineChart } from '@/components/charts/LineChart';
import { theme } from '@/design-system/theme';
import { DonutChart } from '@/components/charts/DonutChart';
import { TimelineChart } from '@/components/charts/TimelineChart';

const { width } = Dimensions.get('window');

const MOCK_STATS = {
  calories: 318,
  steps: 7890,
  hydration: 68,
  line: [20, 45, 30, 60, 40, 70, 50]
};

export const PerformanceDashboard: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1419', '#1A1F3A', '#2D3250']} style={styles.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Performance</Text>
        <View style={styles.kpiRow}>
          <KpiCard title="Calories" value={`${MOCK_STATS.calories} kcal`} color="#FF6B2C" style={{ flex: 1 }} />
          <KpiCard title="Steps" value={`${MOCK_STATS.steps}`} color="#00C9FF" style={{ flex: 1 }} />
          <KpiCard title="Hydration" value={`${MOCK_STATS.hydration}%`} color="#B4FF39" style={{ flex: 1 }} />
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Trend</Text>
          <LineChart width={width - 48} height={160} points={MOCK_STATS.line} color="#FF6B2C" />
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          <DonutChart
            segments={[
              { label: 'Protein', value: 35, color: '#FF6B2C' },
              { label: 'Carbs', value: 45, color: '#FFB800' },
              { label: 'Fats', value: 20, color: '#00C9FF' }
            ]}
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Workout Timeline</Text>
          <TimelineChart
            data={[
              { label: 'Warmup', minutes: 10, color: '#FFB800' },
              { label: 'Strength', minutes: 25, color: '#FF6B2C' },
              { label: 'Cardio', minutes: 15, color: '#00C9FF' }
            ]}
          />
        </GlassCard>

        <Text style={styles.sectionTitle}>Radial Gauges</Text>
        <View style={styles.gaugeRow}>
          <View style={styles.gauge}>
            <CircularProgress value={MOCK_STATS.calories % 100} radius={50} strokeWidth={8} color="#FF6B2C" backgroundColor="#2D3250" />
            <Text style={styles.gaugeLabel}>Kcal</Text>
          </View>
          <View style={styles.gauge}>
            <CircularProgress value={Math.min(100, MOCK_STATS.steps / 100)} radius={50} strokeWidth={8} color="#00C9FF" backgroundColor="#2D3250" />
            <Text style={styles.gaugeLabel}>Steps</Text>
          </View>
          <View style={styles.gauge}>
            <CircularProgress value={MOCK_STATS.hydration} radius={50} strokeWidth={8} color="#B4FF39" backgroundColor="#2D3250" />
            <Text style={styles.gaugeLabel}>Hydration</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  scrollView: { flex: 1 },
  content: { padding: theme.spacing[4], paddingTop: 60 },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing[4]
  },
  kpiRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4]
  },
  card: { padding: theme.spacing[4], marginBottom: theme.spacing[4] },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing[2]
  },
  gaugeRow: { flexDirection: 'row', gap: theme.spacing[4] },
  gauge: { flex: 1, backgroundColor: '#2D3250', borderRadius: theme.borderRadius.xl, padding: theme.spacing[4], alignItems: 'center' },
  gaugeLabel: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[0], marginTop: theme.spacing[2] }
});
