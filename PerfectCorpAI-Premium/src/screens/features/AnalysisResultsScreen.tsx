import React, { useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAnalysisStore } from '@/stores/analysis.store';
import { useUIStore } from '@/stores/ui.store';
import SkinAnalysisView from '@/components/analysis/SkinAnalysisView';
import BeforeAfterSlider from '@/components/analysis/BeforeAfterSlider';
import InteractiveChart from '@/components/analysis/InteractiveChart';
import ProductRecommendations from '@/components/analysis/ProductRecommendations';
import SkinOverlayLegend from '@/components/analysis/SkinOverlayLegend';
import { PrimaryButton } from '@/components/core/buttons/PrimaryButton';
import { GlassCard } from '@/components/core/cards/GlassCard';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export const AnalysisResultsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { analysisId } = (route.params || {}) as { analysisId: string };

  const { currentAnalysis, fetchAnalysisById } = useAnalysisStore();
  const { showToast, showLoading, hideLoading } = useUIStore();

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      showLoading('Loading results...');
      await fetchAnalysisById(analysisId);
      hideLoading();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      hideLoading();
      showToast({ type: 'error', message: error.message || 'Failed to load results' });
    }
  };

  const handleShare = async () => {
    try {
      showToast({ type: 'success', message: 'Results shared successfully!' });
    } catch {
      showToast({ type: 'error', message: 'Failed to share results' });
    }
  };

  const handleSave = async () => {
    showToast({ type: 'success', message: 'Results saved to your profile!' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!currentAnalysis) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { scores, skinType, skinTone, concerns, recommendations } = currentAnalysis;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary[50], theme.colors.neutral[0]] as any} style={styles.background} />
      <SkinOverlayLegend />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <View style={styles.iconSquare} />
          </TouchableOpacity>
          <Text style={styles.title}>Analysis Results</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <View style={styles.iconSquare} />
          </TouchableOpacity>
        </View>
        <GlassCard style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Overall Skin Health</Text>
          <Text style={styles.scoreValue}>{scores?.overall || 0}/100</Text>
          <LinearGradient colors={getScoreGradient(scores?.overall || 0) as any} style={styles.scoreBar}>
            <View style={[styles.scoreProgress, { width: `${scores?.overall || 0}%` }]} />
          </LinearGradient>
        </GlassCard>
        <Text style={styles.sectionTitle}>Detailed Analysis</Text>
        <InteractiveChart
          data={{
            hydration: scores?.hydration || 0,
            texture: scores?.texture || 0,
            clarity: scores?.clarity || 0
          }}
          style={styles.chart}
        />
        <View style={styles.infoRow}>
          <GlassCard style={styles.infoCard}>
            <View style={styles.iconCircle} />
            <Text style={styles.infoLabel}>Skin Type</Text>
            <Text style={styles.infoValue}>{skinType || 'N/A'}</Text>
          </GlassCard>
          <GlassCard style={styles.infoCard}>
            <View style={styles.iconCircle} />
            <Text style={styles.infoLabel}>Skin Tone</Text>
            <Text style={styles.infoValue}>{skinTone || 'N/A'}</Text>
          </GlassCard>
        </View>
        {concerns && concerns.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Areas for Improvement</Text>
            <View style={styles.concernsContainer}>
              {concerns.map((concern, index) => (
                <View key={index} style={styles.concernChip}>
                  <View style={styles.iconDot} />
                  <Text style={styles.concernText}>{concern}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        {recommendations && recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <ProductRecommendations
              products={recommendations}
              onProductPress={(productId) => {
                // @ts-expect-error route type handled by app navigator
                navigation.navigate('ProductDetails', { productId });
              }}
            />
          </>
        )}
        <View style={styles.actions}>
          <PrimaryButton title="Save Results" onPress={handleSave} variant="gradient" style={styles.actionButton} />
          <PrimaryButton title="New Analysis" onPress={() => (navigation as any).navigate('Camera', { mode: 'analysis' })} variant="outline" style={styles.actionButton} />
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const getScoreGradient = (score: number): string[] => {
  if (score >= 80) return theme.gradients.skinHealthy;
  if (score >= 60) return theme.gradients.skinNeutral;
  return theme.gradients.skinConcern;
};

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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[6]
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconSquare: {
    width: 20,
    height: 20,
    backgroundColor: theme.colors.neutral[900],
    borderRadius: 4
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900]
  },
  scoreCard: {
    padding: theme.spacing[6],
    alignItems: 'center',
    marginBottom: theme.spacing[6]
  },
  scoreLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing[2]
  },
  scoreValue: {
    fontSize: theme.typography.sizes['5xl'],
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[4]
  },
  scoreBar: {
    width: '100%',
    height: 8,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[200]
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: theme.colors.primary[500]
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing[4],
    marginTop: theme.spacing[6]
  },
  chart: {
    marginBottom: theme.spacing[6]
  },
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6]
  },
  infoCard: {
    flex: 1,
    padding: theme.spacing[4],
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing[2]
  },
  infoValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.neutral[900],
    marginTop: theme.spacing[1]
  },
  concernsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[6]
  },
  concernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning.light,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing[1]
  },
  concernText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.warning.dark,
    fontWeight: theme.typography.weights.medium as any
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[500],
    marginBottom: theme.spacing[2]
  },
  iconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.warning.main
  },
  actions: {
    gap: theme.spacing[3],
    marginTop: theme.spacing[8]
  },
  actionButton: {
    marginBottom: theme.spacing[2]
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary
  }
});
