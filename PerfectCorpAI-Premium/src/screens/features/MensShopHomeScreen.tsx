import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { theme } from '@/design-system/theme';
import { useNavigation } from '@react-navigation/native';
import { MEN_PRODUCTS } from '@/mocks/products';
import { SearchBar } from '@/components/core/inputs/SearchBar';
import { SegmentedControl } from '@/components/core/controls/SegmentedControl';
import { BarChart } from '@/components/charts/BarChart';
import CartPreview from '@/components/shop/CartPreview';
import WishlistMock from '@/components/shop/WishlistMock';
import { useThemeMode } from '@/design-system/theme-mode';

const SECTIONS = [
  { id: 'pre_workout', name: 'Pre-Workout', color: '#FF6B2C' },
  { id: 'recovery', name: 'Recovery', color: '#00C9FF' },
  { id: 'daily', name: 'Daily Care', color: '#B4FF39' },
  { id: 'tools', name: 'Tools', color: '#2D3250' }
];

export const MensShopHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setMode: setThemeMode } = useThemeMode();
  React.useEffect(() => setThemeMode('dark'), []);
  const [query, setQuery] = React.useState('');
  const [segment, setSegment] = React.useState('All');
  const chartData = [
    { day: 'Mon', skinHealth: 12, grooming: 8 },
    { day: 'Tue', skinHealth: 8, grooming: 10 },
    { day: 'Wed', skinHealth: 14, grooming: 9 },
    { day: 'Thu', skinHealth: 15, grooming: 11 },
    { day: 'Fri', skinHealth: 18, grooming: 12 }
  ];
  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.darkBlue as any} style={styles.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Shop</Text>
        <SearchBar value={query} onChangeText={setQuery} style={{ marginBottom: theme.spacing[3] }} />
        <SegmentedControl segments={['All', 'Care', 'Tools', 'Workout']} value={segment} onChange={setSegment} style={{ marginBottom: theme.spacing[3] }} />
        <View style={styles.grid}>
          {SECTIONS.map((s) => (
            <GlassCard key={s.id} style={styles.sectionCard}>
              <View style={[styles.sectionIcon, { backgroundColor: s.color }]} />
              <Text style={styles.sectionName}>{s.name}</Text>
            </GlassCard>
          ))}
        </View>

        <Text style={styles.subtitle}>Featured</Text>
        {MEN_PRODUCTS.map((p) => (
          <GlassCard key={p.id} style={styles.productCard}>
            <View style={[styles.productIcon, { backgroundColor: p.heroColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={styles.productMeta}>
                {p.brand} • ${p.price.toFixed(2)} • {p.rating}★
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('MensProductDetails', { productId: p.id })}
              style={styles.productCta}
            >
              <Text style={styles.productCtaText}>VIEW</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}
        <GlassCard style={{ padding: theme.spacing[4], marginTop: theme.spacing[4] }}>
          <Text style={styles.subtitle}>Weekly</Text>
          <BarChart data={chartData as any} colors={['#FF6B2C', '#FFB800']} />
        </GlassCard>
        <View style={{ height: 100 }} />
        <WishlistMock />
        <CartPreview />
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3], marginBottom: theme.spacing[4] },
  sectionCard: { padding: theme.spacing[4], width: '47%' },
  sectionIcon: { width: 40, height: 40, borderRadius: 10, marginBottom: theme.spacing[2] },
  sectionName: { fontSize: theme.typography.sizes.lg, color: theme.colors.neutral[0], fontWeight: '600' as any },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600' as any,
    color: theme.colors.neutral[0],
    marginBottom: theme.spacing[2]
  },
  productCard: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing[4], gap: theme.spacing[3] },
  productIcon: { width: 48, height: 48, borderRadius: 12 },
  productName: { fontSize: theme.typography.sizes.lg, color: theme.colors.neutral[0], fontWeight: '600' as any },
  productMeta: { fontSize: theme.typography.sizes.xs, color: theme.colors.neutral[400] },
  productCta: {
    backgroundColor: '#FF6B2C',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base
  },
  productCtaText: { color: theme.colors.neutral[0], fontWeight: '700' as any }
});
