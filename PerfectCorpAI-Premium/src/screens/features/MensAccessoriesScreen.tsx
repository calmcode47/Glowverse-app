import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { theme } from '@/design-system/theme';

const { width } = Dimensions.get('window');

const ACCESSORIES = [
  { id: 'razor_pro', name: 'Pro Razor', brand: 'Forge', price: 39.99, rating: 4.7, color: '#FF6B2C' },
  { id: 'beard_trimmer', name: 'Steel Beard Trimmer', brand: 'Alpha', price: 49.99, rating: 4.8, color: '#00C9FF' },
  { id: 'massager', name: 'Recovery Massager', brand: 'Prime', price: 59.99, rating: 4.6, color: '#B4FF39' },
  { id: 'gym_bag', name: 'Gym Bag', brand: 'Torque', price: 29.99, rating: 4.5, color: '#2D3250' }
];

export const MensAccessoriesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F1419', '#1A1F3A', '#2D3250']} style={styles.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Accessories</Text>
        <View style={styles.grid}>
          {ACCESSORIES.map((item) => (
            <GlassCard key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.icon, { backgroundColor: item.color }]} />
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              <Text style={styles.cardMeta}>
                {item.brand} • ${item.price.toFixed(2)} • {item.rating}★
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.buy}>
                  <Text style={styles.buyText}>BUY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.save}>
                  <Text style={styles.saveText}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
  grid: {
    gap: theme.spacing[3]
  },
  card: {
    padding: theme.spacing[4]
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[2]
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[0]
  },
  cardMeta: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral[400]
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginTop: theme.spacing[3]
  },
  buy: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    backgroundColor: '#FF6B2C'
  },
  buyText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold as any
  },
  save: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: '#FF6B2C'
  },
  saveText: {
    color: '#FF6B2C',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold as any
  }
});
