import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';
import { useAppleScrollHandler } from '../../components/animations/AppleScrollAnimation';
import ParallaxView from '../../components/animations/ParallaxView';
import ModernProductCard from '../../components/products/ModernProductCard';
import StatsSection from '../../components/home/StatsSection';
import CircularStats from '../../components/home/CircularStats';
import ActionGrid from '../../components/home/ActionGrid';
import FeaturedCarousel from '../../components/home/FeaturedCarousel';
import TrendingCarousel from '../../components/home/TrendingCarousel';
import PriceTrendGraph from '../../components/home/PriceTrendGraph';
import { categories } from '../../data/products';
import type { Product } from '../../data/products';
import * as ProductsAPI from '../../services/api/products.api';
import type { RootStackParamList } from '../../navigation/types';
import PromotionBanner from '../../components/promotions/PromotionBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const { scrollY, scrollHandler } = useAppleScrollHandler();
  const [refreshing, setRefreshing] = useState(false);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const onRefresh = () => {
    setRefreshing(true);
    (async () => {
      try {
        const [f, t, n] = await Promise.all([
          ProductsAPI.getFeaturedProducts(),
          ProductsAPI.getBestsellers(),
          ProductsAPI.getNewArrivals()
        ]);
        setFeatured(f);
        setTrending(t);
        setNewArrivals(n);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message || 'Failed to refresh');
      } finally {
        setRefreshing(false);
      }
    })();
  };

  React.useEffect(() => {
    (async () => {
      try {
        const [f, t, n] = await Promise.all([
          ProductsAPI.getFeaturedProducts(),
          ProductsAPI.getBestsellers(),
          ProductsAPI.getNewArrivals()
        ]);
        setFeatured(f);
        setTrending(t);
        setNewArrivals(n);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container}>
      {/* Parallax Background */}
      <ParallaxView
        scrollY={scrollY}
        speed={0.3}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <ProfessionalBackground variant="subtle" />
      </ParallaxView>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <ScrollReveal delay={0} scale springy>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, Alex 👋</Text>
              <Text style={styles.subgreeting}>Elevate your style today</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={22}
                  color={theme.colors.text.primary}
                />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('Cart')}
              >
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={22}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollReveal>

        {/* Quick Actions */}
        <ActionGrid />

        {/* Promo Banner with Parallax */}
        <ParallaxView scrollY={scrollY} speed={0.15}>
          <ScrollReveal delay={100} scale springy>
            <PromotionBanner items={[]} onPress={() => navigation.navigate('Promotions' as any)} />
          </ScrollReveal>
        </ParallaxView>

        {/* Circular Stats Section (New) */}
        <ScrollReveal delay={200} scale springy>
          <CircularStats />
        </ScrollReveal>

        {/* Categories */}
        <ScrollReveal delay={400} scale springy>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
        </ScrollReveal>

        <ScrollReveal delay={450} direction="left" springy>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <ScrollReveal key={category.id} delay={500 + index * 50} scale springy>
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    activeCategory === category.id && styles.categoryCardActive,
                  ]}
                  onPress={() => {
                    setActiveCategory(category.id);
                    navigation.navigate('ShopTab' as any);
                  }}
                >
                  <View style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color + '15' }
                  ]}>
                    <MaterialCommunityIcons
                      name={category.icon as any}
                      size={28}
                      color={category.color}
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              </ScrollReveal>
            ))}
          </ScrollView>
        </ScrollReveal>

        {/* Featured Products */}
        <ScrollReveal delay={600} scale springy>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShopTab' as any)}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
        </ScrollReveal>

        {/* Featured Products Carousel */}
        <ScrollReveal delay={700} direction="up" springy>
          {loading ? (
            <View style={{ paddingHorizontal: theme.spacing.lg, flexDirection: 'row', gap: 12 }}>
              <View style={{ width: SCREEN_WIDTH * 0.6 }}>
                <View style={{ height: 220, backgroundColor: theme.colors.background.elevated, borderRadius: 16 }} />
              </View>
              <View style={{ width: SCREEN_WIDTH * 0.6 }}>
                <View style={{ height: 220, backgroundColor: theme.colors.background.elevated, borderRadius: 16 }} />
              </View>
            </View>
          ) : (
            <FeaturedCarousel products={featured} />
          )}
        </ScrollReveal>

        {/* Price Tracking Section (New) */}
        <ScrollReveal delay={800} scale springy>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market Trends</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.priceTrendsContainer}
          >
            {trending.filter(p => p.priceHistory).slice(0, 5).map((product, idx) => (
              <TouchableOpacity
                key={product.id}
                style={styles.priceTrendCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id, product })}
              >
                <View style={styles.trendInfo}>
                  <Text style={styles.trendName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.trendPrice}>${product.price}</Text>
                </View>
                <PriceTrendGraph
                  data={product.priceHistory!}
                  width={100}
                  height={35}
                  color={idx % 2 === 0 ? theme.colors.accent.emerald : theme.colors.accent.rose}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollReveal>

        {/* Trending Section (Swipable) */}
        <ScrollReveal delay={900} scale springy>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
        </ScrollReveal>

        <View style={{ marginBottom: theme.spacing.xl }}>
          <TrendingCarousel products={trending} />
        </View>

        {/* New Arrivals (Extra Content) */}
        <ScrollReveal delay={1100} scale springy>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
          </View>
          <View style={styles.newArrivalsGrid}>
            {newArrivals.slice(0, 2).map((product, index) => (
              <ScrollReveal key={product.id} delay={1150 + index * 100} direction="up" springy>
                <ModernProductCard
                  product={product}
                  width={SCREEN_WIDTH * 0.44}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product.id, product })}
                />
              </ScrollReveal>
            ))}
          </View>
        </ScrollReveal>

        {/* Daily Tips (Extended Content) */}
        <ScrollReveal delay={1200} scale springy>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Tips</Text>
          </View>
        </ScrollReveal>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingBottom: 20 }}>
          <TipCard title="Dress for Success" description="Tips on formal wear matching." color="#3B82F6" theme={theme} />
          <TipCard title="Summer Vibes" description="Choosing the right sunglasses." color="#F59E0B" theme={theme} />
          <TipCard title="Shoe Care" description="Keep your sneakers fresh." color="#10B981" theme={theme} />
          <TipCard title="Smart Style" description="Accessorizing with tech gadgets." color="#8B5CF6" theme={theme} />
          <TipCard title="Glow Guide" description="Maintaining your premium look." color="#EC4899" theme={theme} />
        </ScrollView>

        {/* Brand Spotlight */}
        <ScrollReveal delay={1300} scale springy>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brand Spotlight</Text>
          </View>
          <View style={styles.brandSpotlight}>
            <LinearGradient
              colors={['#1F2937', '#111827']}
              style={styles.spotlightGradient}
            >
              <MaterialCommunityIcons name="star-face" size={32} color={theme.colors.accent.gold} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.spotlightTitle}>Elite Member Early Access</Text>
                <Text style={styles.spotlightSubtitle}>Ray-Ban Custom Lab is now open for you.</Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollReveal>

        {/* Bottom Spacing */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, theme }: {
  icon: string;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={{
      flex: 1,
      padding: theme.spacing.base,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      borderWidth: 1,
      backgroundColor: theme.colors.background.elevated,
      borderColor: theme.colors.border.light,
      ...theme.shadows.sm,
    }}>
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={theme.colors.accent.emerald}
      />
      <Text style={{
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
        marginTop: theme.spacing.xs,
        color: theme.colors.text.primary,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: theme.typography.sizes.xs,
        marginTop: 2,
        color: theme.colors.text.secondary,
      }}>
        {label}
      </Text>
    </View>
  );
}

const TipCard = ({ title, description, color, theme }: any) => (
  <TouchableOpacity style={{
    width: 200,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  }}>
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: color + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12
    }}>
      <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={color} />
    </View>
    <Text style={{
      fontSize: theme.typography.sizes.base,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: 4
    }}>{title}</Text>
    <Text style={{
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary
    }}>{description}</Text>
  </TouchableOpacity>
);

function TrendingCard({ title, description, icon, theme }: {
  title: string;
  description: string;
  icon: string;
  theme: any;
}) {
  return (
    <View style={{
      flex: 1,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      backgroundColor: theme.colors.background.elevated,
      borderColor: theme.colors.border.light,
      ...theme.shadows.sm,
    }}>
      <View style={{
        width: 56,
        height: 56,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.accent.emerald + '15'
      }}>
        <MaterialCommunityIcons
          name={icon as any}
          size={32}
          color={theme.colors.accent.emerald}
        />
      </View>
      <Text style={{
        fontSize: theme.typography.sizes.base,
        fontWeight: theme.typography.weights.semibold,
        marginBottom: theme.spacing.xs,
        color: theme.colors.text.primary,
      }}>
        {title}
      </Text>
      <Text style={{
        fontSize: theme.typography.sizes.xs,
        lineHeight: 16,
        color: theme.colors.text.secondary,
      }}>
        {description}
      </Text>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    greeting: {
      fontSize: theme.typography.sizes['2xl'],
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    subgreeting: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      marginTop: 4,
    },
    headerIcons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background.elevated,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.accent.rose,
    },
    promoBanner: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    promoGradient: {
      borderRadius: theme.radius.xl,
    },
    promoContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
    },
    promoTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.inverse,
    },
    promoSubtitle: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.inverse,
      opacity: 0.9,
      marginTop: 4,
    },
    promoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.text.inverse,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      gap: 4,
    },
    promoButtonText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.accent.emerald,
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    statCard: {
      flex: 1,
      padding: theme.spacing.base,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      borderWidth: 1,
      ...theme.shadows.sm,
    },
    statValue: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold,
      marginTop: theme.spacing.xs,
    },
    statLabel: {
      fontSize: theme.typography.sizes.xs,
      marginTop: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    seeAll: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.accent.emerald,
      fontWeight: theme.typography.weights.medium,
    },
    categoriesContainer: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.base,
      paddingBottom: theme.spacing.base,
      marginBottom: theme.spacing.xl,
    },
    categoryCard: {
      alignItems: 'center',
      width: 80,
    },
    categoryCardActive: {
      transform: [{ scale: 1.05 }],
    },
    categoryIcon: {
      width: 64,
      height: 64,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    categoryName: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.weights.medium,
      textAlign: 'center',
    },
    trendingGrid: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    trendingCard: {
      flex: 1,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      ...theme.shadows.sm,
    },
    trendingIcon: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    trendingTitle: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      marginBottom: theme.spacing.xs,
    },
    trendingDescription: {
      fontSize: theme.typography.sizes.xs,
      lineHeight: 16,
    },
    // New Styles
    priceTrendsContainer: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    priceTrendCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.elevated,
      padding: theme.spacing.base,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      gap: theme.spacing.md,
      ...theme.shadows.sm,
    },
    trendInfo: {
      width: 80,
    },
    trendName: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.weights.medium,
    },
    trendPrice: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.accent.rose + '15',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      gap: 4,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.accent.rose,
    },
    liveText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.accent.rose,
    },
    newArrivalsGrid: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xl,
    },
    brandSpotlight: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    spotlightGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    spotlightTitle: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.inverse,
    },
    spotlightSubtitle: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.inverse,
      opacity: 0.8,
      marginTop: 2,
    },
  });

const styles = StyleSheet.create({});
