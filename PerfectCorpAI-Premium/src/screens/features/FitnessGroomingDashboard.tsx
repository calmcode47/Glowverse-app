import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { CircularProgress } from '@/components/charts/CircularProgress';
import { BarChart } from '@/components/charts/BarChart';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const GROOMING_CATEGORIES = [
  { id: 'pre_workout', name: 'Pre-Workout', color: '#FF6B2C' },
  { id: 'post_workout', name: 'Post-Workout', color: '#FFB800' },
  { id: 'daily', name: 'Daily Care', color: '#B4FF39' },
  { id: 'recovery', name: 'Recovery', color: '#00C9FF' }
];

const DAILY_STATS = {
  workoutCompleted: true,
  groomingRoutine: 75,
  waterIntake: 6,
  skinHealth: 88,
  caloriesBurned: 578,
  stepsCount: 7890
};

const WEEKLY_PROGRESS = [
  { day: 'Mon', skinHealth: 82, grooming: 70 },
  { day: 'Tue', skinHealth: 84, grooming: 80 },
  { day: 'Wed', skinHealth: 86, grooming: 75 },
  { day: 'Thu', skinHealth: 87, grooming: 85 },
  { day: 'Fri', skinHealth: 88, grooming: 75 },
  { day: 'Sat', skinHealth: 0, grooming: 0 },
  { day: 'Sun', skinHealth: 0, grooming: 0 }
];

export const FitnessGroomingDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1419', '#1A1F3A', '#2D3250']} style={styles.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning, King 👑</Text>
            <Text style={styles.date}>Friday, February 7</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={styles.iconSquare} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
        <GlassCard style={styles.challengeCard}>
          <View style={styles.challengeContent}>
            <View style={styles.challengeIcon}>
              <LinearGradient colors={['#B4FF39', '#7FFF00']} style={styles.challengeIconGradient}>
                <View style={styles.iconCircle} />
              </LinearGradient>
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>New Challenge</Text>
              <Text style={styles.challengeSubtitle}>7 Days of Perfect Skin</Text>
            </View>
            <TouchableOpacity style={styles.challengeButton}>
              <LinearGradient colors={['#B4FF39', '#7FFF00']} style={styles.challengeButtonGradient}>
                <Text style={styles.challengeButtonText}>START</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <View style={styles.statsGrid}>
          <ActivityStatCard value={DAILY_STATS.caloriesBurned} label="Kcal" color="#FF6B2C" unit="cal" />
          <ActivityStatCard value={DAILY_STATS.stepsCount} label="Steps" color="#00C9FF" unit="" />
          <ActivityStatCard value={25} label="Active" color="#B4FF39" unit="min" />
        </View>

        <Text style={styles.sectionTitle}>Today's Grooming Routine</Text>
        <View style={styles.progressRow}>
          <CircularProgressCard value={DAILY_STATS.groomingRoutine} label="Routine" color="#FF6B2C" />
          <CircularProgressCard value={DAILY_STATS.skinHealth} label="Skin Health" color="#B4FF39" />
        </View>

        <View style={styles.periodSelector}>
          {(['day', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => {
                setSelectedPeriod(period);
                Haptics.selectionAsync();
              }}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Your Progress</Text>
          <BarChart data={WEEKLY_PROGRESS} height={180} colors={['#FF6B2C', '#B4FF39']} />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF6B2C' }]} />
              <Text style={styles.legendText}>Skin Health</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#B4FF39' }]} />
              <Text style={styles.legendText}>Grooming</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Grooming by Activity</Text>
        <View style={styles.categoriesGrid}>
          {GROOMING_CATEGORIES.map((category) => (
            <GroomingCategoryCard
              key={category.id}
              category={category}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <GlassCard style={styles.activityCard}>
          <ActivityItem title="Walking" subtitle="Today at 10:42pm" value="7890" unit="steps" color="#B4FF39" />
          <ActivityItem title="Skin Analysis" subtitle="Yesterday at 8:30pm" value="12" unit="points" color="#FF6B2C" />
        </GlassCard>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const ActivityStatCard: React.FC<{ value: number; label: string; color: string; unit: string }> = ({
  value,
  label,
  color,
  unit
}) => (
  <View style={styles.activityStatCard}>
    <LinearGradient colors={[color + '40', color + '20']} style={styles.activityStatGradient}>
      <View style={[styles.iconDot, { backgroundColor: color }]} />
      <Text style={styles.activityStatValue}>
        {value.toLocaleString()}
        <Text style={styles.activityStatUnit}> {unit}</Text>
      </Text>
      <Text style={styles.activityStatLabel}>{label}</Text>
    </LinearGradient>
  </View>
);

const CircularProgressCard: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <View style={styles.circularProgressCard}>
    <CircularProgress value={value} maxValue={100} radius={50} strokeWidth={8} color={color} backgroundColor="#2D3250" />
    <Text style={styles.circularProgressLabel}>{label}</Text>
  </View>
);

const GroomingCategoryCard: React.FC<{ category: { id: string; name: string; color: string }; onPress: () => void }> = ({
  category,
  onPress
}) => (
  <TouchableOpacity onPress={onPress} style={styles.categoryCard}>
    <LinearGradient colors={[category.color + '40', category.color + '20']} style={styles.categoryGradient}>
      <View style={[styles.iconCircle, { backgroundColor: category.color }]} />
      <Text style={styles.categoryName}>{category.name}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const ActivityItem: React.FC<{ title: string; subtitle: string; value: string; unit: string; color: string }> = ({
  title,
  subtitle,
  value,
  unit,
  color
}) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: color + '40' }]}>
      <View style={[styles.iconSquare, { backgroundColor: color }]} />
    </View>
    <View style={styles.activityInfo}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.activityValue}>
      <Text style={styles.activityValueText}>{value}</Text>
      <Text style={styles.activityValueUnit}>{unit}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    ...StyleSheet.absoluteFillObject
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: theme.spacing[4],
    paddingTop: 60
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[6]
  },
  greeting: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing[1]
  },
  date: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.neutral[400]
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF6B2C',
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationCount: {
    fontSize: 10,
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.weights.bold as any
  },
  challengeCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6]
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  challengeIcon: {
    marginRight: theme.spacing[3]
  },
  challengeIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  challengeInfo: {
    flex: 1
  },
  challengeTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[0],
    marginBottom: 2
  },
  challengeSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[400]
  },
  challengeButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden'
  },
  challengeButtonGradient: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[2]
  },
  challengeButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold as any,
    color: '#0F1419'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6]
  },
  activityStatCard: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden'
  },
  activityStatGradient: {
    padding: theme.spacing[4],
    alignItems: 'center'
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  activityStatValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[0],
    marginTop: theme.spacing[2]
  },
  activityStatUnit: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium as any
  },
  activityStatLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[400],
    marginTop: theme.spacing[1]
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing[4]
  },
  progressRow: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6]
  },
  circularProgressCard: {
    flex: 1,
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    alignItems: 'center'
  },
  circularProgressLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[0],
    marginTop: theme.spacing[3],
    fontWeight: theme.typography.weights.medium as any
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#2D3250',
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    marginBottom: theme.spacing[4]
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg
  },
  periodButtonActive: {
    backgroundColor: '#FF6B2C'
  },
  periodText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[400],
    fontWeight: theme.typography.weights.medium as any
  },
  periodTextActive: {
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.weights.bold as any
  },
  chartCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6]
  },
  chartTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing[4]
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[6],
    marginTop: theme.spacing[4]
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[400]
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6]
  },
  categoryCard: {
    width: (width - theme.spacing[4] * 2 - theme.spacing[3]) / 2,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden'
  },
  categoryGradient: {
    padding: theme.spacing[4],
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center'
  },
  categoryName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[0],
    marginTop: theme.spacing[2],
    textAlign: 'center'
  },
  activityCard: {
    padding: theme.spacing[4]
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)'
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3]
  },
  activityInfo: {
    flex: 1
  },
  activityTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[0],
    marginBottom: 2
  },
  activitySubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[400]
  },
  activityValue: {
    alignItems: 'flex-end'
  },
  activityValueText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[0]
  },
  activityValueUnit: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[400]
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  iconSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: theme.colors.neutral[0]
  }
});
