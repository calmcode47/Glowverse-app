import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { CircularProgress } from '@/components/charts/CircularProgress';
import { theme } from '@/design-system/theme';
import { NeumorphicCard } from '@/components/core/cards/NeumorphicCard';
import { PillToggle } from '@/components/core/controls/PillToggle';
import { useThemeMode } from '@/design-system/theme-mode';
import { SoftDarkCard } from '@/components/core/cards/SoftDarkCard';
import { WaveSection } from '@/components/core/decor/WaveSection';

export const BrandDashboardScreen: React.FC = () => {
  const [toggle, setToggle] = useState(true);
  const { setMode } = useThemeMode();
  useEffect(() => setMode('light'), []);
  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.brandLight as any} style={styles.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Brand</Text>
        <View style={styles.row}>
          <NeumorphicCard style={styles.metricCard}>
            <Text style={styles.metricLabel}>NAME</Text>
            <Text style={styles.metricValue}>43</Text>
          </NeumorphicCard>
          <NeumorphicCard style={styles.metricCard}>
            <CircularProgress value={69} radius={32} strokeWidth={8} color="#FFB800" backgroundColor="#E2E8F0" />
            <Text style={styles.metricLabel}>Score</Text>
          </NeumorphicCard>
        </View>

        <View style={styles.row}>
          <NeumorphicCard style={styles.toggleCard}>
            <Text style={styles.toggleLabel}>Mode</Text>
            <PillToggle value={toggle} onChange={setToggle} />
          </NeumorphicCard>
          <SoftDarkCard style={styles.sliderCard}>
            <Text style={styles.sliderLabel}>Title goes</Text>
            <View style={styles.sliderRow}>
              <TouchableOpacity style={styles.arrowDark}><Text style={styles.arrowText}>{'<'}</Text></TouchableOpacity>
              <View style={styles.sliderDotDark} />
              <TouchableOpacity style={styles.arrowDark}><Text style={styles.arrowText}>{'>'}</Text></TouchableOpacity>
            </View>
          </SoftDarkCard>
        </View>

        <View style={styles.grid}>
          <NeumorphicCard style={styles.tile}>
            <View style={[styles.tileIcon, { backgroundColor: '#FF6B2C' }]} />
            <Text style={styles.tileText}>Workout</Text>
          </NeumorphicCard>
          <NeumorphicCard style={styles.tile}>
            <View style={[styles.tileIcon, { backgroundColor: '#2D3250' }]} />
            <Text style={styles.tileText}>Rings</Text>
          </NeumorphicCard>
          <NeumorphicCard style={styles.tile}>
            <View style={[styles.tileIcon, { backgroundColor: '#00C9FF' }]} />
            <Text style={styles.tileText}>Tools</Text>
          </NeumorphicCard>
          <NeumorphicCard style={styles.tile}>
            <View style={[styles.tileIcon, { backgroundColor: '#B4FF39' }]} />
            <Text style={styles.tileText}>Care</Text>
          </NeumorphicCard>
        </View>

        <View style={{ marginTop: theme.spacing[4] }}>
          <WaveSection height={160} topColor="#FFFFFF" bottomColor="#FFE6CC" />
          <NeumorphicCard style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Title goes</Text>
            <TouchableOpacity style={styles.ctaButton}><Text style={styles.ctaButtonText}>Try now</Text></TouchableOpacity>
          </NeumorphicCard>
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
    fontWeight: '700' as any,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[4]
  },
  row: { flexDirection: 'row', gap: theme.spacing[3], marginBottom: theme.spacing[3] },
  metricCard: { flex: 1, padding: theme.spacing[4], alignItems: 'center' },
  metricLabel: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[600] },
  metricValue: { fontSize: theme.typography.sizes['3xl'], color: '#FF6B2C', fontWeight: '700' as any },
  toggleCard: { flex: 1, padding: theme.spacing[4] },
  toggleLabel: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[600], marginBottom: theme.spacing[2] },
  toggle: {
    height: 36,
    backgroundColor: '#E2E8F0',
    borderRadius: 18,
    justifyContent: 'center'
  },
  toggleActive: { backgroundColor: '#FFB800' },
  knob: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', marginLeft: 2 },
  knobRight: { alignSelf: 'flex-end', marginRight: 2 },
  sliderCard: { flex: 1, padding: theme.spacing[4] },
  sliderLabel: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[600], marginBottom: theme.spacing[2] },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: theme.typography.sizes.lg, color: theme.colors.neutral[700] },
  sliderDot: { width: 120, height: 8, borderRadius: 4, backgroundColor: '#FF6B2C' },
  arrowDark: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2D3250', alignItems: 'center', justifyContent: 'center' },
  sliderDotDark: { width: 140, height: 8, borderRadius: 4, backgroundColor: '#FF6B2C' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3], marginTop: theme.spacing[3] },
  tile: { width: '47%', padding: theme.spacing[4], alignItems: 'center' },
  tileIcon: { width: 60, height: 60, borderRadius: 16, marginBottom: theme.spacing[2] },
  tileText: { fontSize: theme.typography.sizes.sm, color: theme.colors.neutral[900] },
  ctaCard: { padding: theme.spacing[4], alignItems: 'center', marginTop: theme.spacing[4] },
  ctaTitle: { fontSize: theme.typography.sizes.lg, color: theme.colors.neutral[900], marginBottom: theme.spacing[2] },
  ctaButton: { backgroundColor: '#FF6B2C', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2], borderRadius: theme.borderRadius.base },
  ctaButtonText: { color: theme.colors.neutral[0], fontWeight: '700' as any }
});
