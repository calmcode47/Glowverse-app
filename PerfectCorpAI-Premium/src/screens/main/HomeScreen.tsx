import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureCards } from '@/components/home/FeatureCards';
import { TrendingSection } from '@/components/home/TrendingSection';
import { PersonalizedFeed } from '@/components/home/PersonalizedFeed';
import { OptimizedView } from '@/components/optimized/OptimizedView';
import { useAuthStore } from '@/stores/auth.store';
import { useAnalysisStore } from '@/stores/analysis.store';
import { theme } from '@/design-system/theme';
import { useNavigation } from '@react-navigation/native';
import { useBackendHealth } from '@/hooks/useBackendHealth';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { fetchAnalyses, analyses, isLoading } = useAnalysisStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const { check } = useBackendHealth();

  useEffect(() => {
    loadData();
    check();
  }, []);

  const loadData = async () => {
    try {
      await fetchAnalyses(1);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleFeaturePress = (feature: string) => {
    switch (feature) {
      case 'skin-analysis':
        // @ts-expect-error route type handled by app navigator
        navigation.navigate('Camera', { mode: 'analysis' });
        break;
      case 'virtual-tryon':
        // @ts-expect-error route type handled by app navigator
        navigation.navigate('Camera', { mode: 'tryon' });
        break;
      case 'history':
        // @ts-expect-error route type handled by app navigator
        navigation.navigate('History');
        break;
      case 'saved-looks':
        // @ts-expect-error route type handled by app navigator
        navigation.navigate('SavedLooks');
        break;
      case 'shop':
        // @ts-expect-error route type handled by app navigator
        navigation.navigate('MensShopHome');
        break;
      case 'performance':
        // @ts-expect-error route type handled by app navigator
        navigation.navigate('PerformanceDashboard');
        break;
      case 'brand':
        // @ts-expect-error route type handled by app navigator
        navigation.navigate('BrandDashboard');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.darkBlue as any} style={styles.background} />
      <OptimizedView withBlur style={styles.overlay}>
        <View />
      </OptimizedView>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary[500]} />}
      >
        <HeroSection userName={user?.name} onStartAnalysis={() => handleFeaturePress('skin-analysis')} />
        <FeatureCards onFeaturePress={handleFeaturePress} style={styles.section} />
        {analyses.length > 0 && (
          <PersonalizedFeed analyses={analyses} onSeeAll={() => navigation.navigate('History' as never)} style={styles.section} />
        )}
        <TrendingSection style={styles.section} />
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
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
    paddingTop: 60
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  },
  section: {
    marginTop: theme.spacing[8]
  }
});
