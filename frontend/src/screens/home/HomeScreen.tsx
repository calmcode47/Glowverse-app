import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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
import Product3DCard from '../../components/products/Product3DCard';
import { featuredProducts, categories } from '../../data/products';
import type { RootStackParamList } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const { scrollY, scrollHandler } = useAppleScrollHandler();

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
      >
        {/* Header */}
        <ScrollReveal delay={0} scale springy>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, Alex 👋</Text>
              <Text style={styles.subgreeting}>Elevate your style today</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={22}
                  color={theme.colors.text.primary}
                />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={22}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollReveal>

        {/* Promo Banner with Parallax */}
        <ParallaxView scrollY={scrollY} speed={0.15}>
          <ScrollReveal delay={100} scale springy>
            <View style={styles.promoBanner}>
              <LinearGradient
                colors={theme.colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoGradient}
              >
                <View style={styles.promoContent}>
                  <View>
                    <Text style={styles.promoTitle}>Summer Collection</Text>
                    <Text style={styles.promoSubtitle}>Up to 40% off on sunglasses</Text>
                  </View>
                  <TouchableOpacity style={styles.promoButton}>
                    <Text style={styles.promoButtonText}>Shop Now</Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={16}
                      color={theme.colors.accent.emerald}
                    />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </ScrollReveal>
        </ParallaxView>

        {/* Stats Row with Staggered Animation */}
        <ScrollReveal delay={200} direction="up" scale springy>
          <View style={styles.statsRow}>
            <ScrollReveal delay={250} scale springy>
              <StatCard
                icon="shopping-outline"
                label="Orders"
                value="24"
                theme={theme}
              />
            </ScrollReveal>
            <ScrollReveal delay={300} scale springy>
              <StatCard
                icon="heart-outline"
                label="Wishlist"
                value="12"
                theme={theme}
              />
            </ScrollReveal>
            <ScrollReveal delay={350} scale springy>
              <StatCard
                icon="medal-outline"
                label="Points"
                value="340"
                theme={theme}
              />
            </ScrollReveal>
          </View>
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

        <ScrollReveal delay={700} direction="up" springy>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
          >
            {featuredProducts.map((product, index) => (
              <ScrollReveal key={product.id} delay={750 + index * 80} scale springy>
                <Product3DCard
                  product={product}
                  index={index}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                />
              </ScrollReveal>
            ))}
          </ScrollView>
        </ScrollReveal>

        {/* Trending Section */}
        <ScrollReveal delay={900} scale springy>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
        </ScrollReveal>

        <ScrollReveal delay={1000} direction="up" springy>
          <View style={styles.trendingGrid}>
            <ScrollReveal delay={1050} scale springy>
              <TrendingCard
                title="Classic Aviators"
                description="Timeless style for every occasion"
                icon="sunglasses"
                theme={theme}
              />
            </ScrollReveal>
            <ScrollReveal delay={1100} scale springy>
              <TrendingCard
                title="Smart Watches"
                description="Stay connected in style"
                icon="watch"
                theme={theme}
              />
            </ScrollReveal>
          </View>
        </ScrollReveal>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
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
  });

const styles = StyleSheet.create({});
