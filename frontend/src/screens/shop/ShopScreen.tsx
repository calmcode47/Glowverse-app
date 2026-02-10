import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import DiscoverProductCard from '../../components/products/DiscoverProductCard';
import { products, Product } from '../../data/products';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Brand list for tabs
const BRANDS = ['All', 'Nike', 'Adidas', 'Puma', 'Reebok', 'Ray-Ban'];

// 📏 Layout Constants (Pixel Perfect)
const HEADER_HEIGHT = 70; // Title + Icons + Padding
const TABS_HEIGHT = 50;   // Brand ScrollView
const DOTS_HEIGHT = 30;   // Indicators
const BOTTOM_NAV_HEIGHT = 85; // Standard Bottom Tab Bar estimate (plus spacing)

export default function ShopScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // 🧮 Precise Height Calculation
  // Available Vertical Space = Total Screen - Top Safe Area - Bottom Safe Area - UI Elements
  // We subtract a bit extra (20px) for general breathing room/padding
  // 🧮 Precise Height Calculation (Universal Compatibility Mode 🌍)
  // We prioritize safety over size.
  // Subtracting 120px ensures significant "breathing room" on all devices.
  const SAFE_VERTICAL_SPACE = SCREEN_HEIGHT
    - insets.top
    - insets.bottom
    - HEADER_HEIGHT
    - TABS_HEIGHT
    - DOTS_HEIGHT
    - BOTTOM_NAV_HEIGHT
    - 120; // Extra generous buffer for safety

  // Clamp height conservatively
  // Max 480px is a "Golden Mean" that fits well on small Androids and looks neat on huge iPhones.
  const CARD_HEIGHT = Math.min(Math.max(SAFE_VERTICAL_SPACE, 320), 480);

  // Carousel Constants
  const CARD_WIDTH = SCREEN_WIDTH * 0.8;
  const SPACING = 12;
  const ITEM_SIZE = CARD_WIDTH + SPACING * 2;
  const SPACER_WIDTH = (SCREEN_WIDTH - ITEM_SIZE) / 2;

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  // Filter products by brand
  const filteredProducts =
    selectedBrand === 'All'
      ? products
      : products.filter((p) => p.brand === selectedBrand);

  const styles = createStyles(theme, isDark, insets);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentCardIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />

      {/* Header */}
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Search')}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <MaterialCommunityIcons
              name="shopping-outline"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Brand Tabs */}
      <View style={[styles.brandTabsContainer, { height: TABS_HEIGHT }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandTabs}
        >
          {BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={styles.brandTab}
              onPress={() => {
                setSelectedBrand(brand);
                setCurrentCardIndex(0);
              }}
            >
              <Text
                style={[
                  styles.brandTabText,
                  selectedBrand === brand && styles.brandTabTextActive,
                ]}
              >
                {brand}
              </Text>
              {selectedBrand === brand && (
                <View style={styles.brandTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Cards - Explicit Height Container */}
      <View style={{ height: CARD_HEIGHT, marginVertical: 10 }}>
        <Animated.FlatList
          key={selectedBrand}
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: SPACER_WIDTH,
            alignItems: 'center',
          }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <DiscoverProductCard
              product={item}
              index={index}
              scrollX={scrollX}
              cardWidth={CARD_WIDTH}
              cardHeight={CARD_HEIGHT} // Pass precise calculated height
              itemSize={ITEM_SIZE}
              onPress={() =>
                navigation.navigate('ProductDetail', { productId: item.id, product: item })
              }
              onAddToBag={() => {
                console.log('Add to bag:', item.name);
              }}
            />
          )}
        />
      </View>

      {/* Dot Indicators */}
      <View style={[styles.dotIndicators, { height: DOTS_HEIGHT }]}>
        {filteredProducts.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentCardIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingTop: insets.top, // Handle top safe area explicitly
      paddingBottom: insets.bottom, // Handle bottom safe area explicitly
      justifyContent: 'flex-start', // Stack from top
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text.primary,
      letterSpacing: -0.5,
    },
    headerIcons: {
      flexDirection: 'row',
      gap: 12,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    brandTabsContainer: {
      marginBottom: 0,
    },
    brandTabs: {
      paddingHorizontal: 20,
      gap: 24,
      alignItems: 'center', // Center text vertically
    },
    brandTab: {
      paddingVertical: 8,
      position: 'relative',
    },
    brandTabText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.tertiary,
    },
    brandTabTextActive: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    brandTabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: theme.colors.accent.emerald,
      borderRadius: 2,
    },
    dotIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 'auto', // Push to bottom of available space if any
      marginBottom: 10,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border.DEFAULT,
    },
    dotActive: {
      width: 24,
      backgroundColor: theme.colors.accent.emerald,
    },
  });
