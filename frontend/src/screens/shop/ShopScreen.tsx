import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/types";
import type { Product } from "../../data/products";
import * as ProductsAPI from "../../services/api/products.api";
import ProductSkeleton from "../../components/shop/ProductSkeleton";
import ShopHeroCard from "../../components/shop/ShopHeroCard";
import FilterBar, { Filters } from "../../components/shop/FilterBar";
import FilterModal from "../../components/shop/FilterModal";
import { focusManagement } from "../../utils/focusManagement";
import { useFilterAnalytics } from "../../hooks/analytics/useFilterAnalytics";
import { imagePreloader } from "../../services/imagePreloader.service";
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolate } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 16;
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.92);

function CarouselItem({ item, index, cardWidth, scrollX, onPress }: { item: Product; index: number; cardWidth: number; scrollX: any; onPress: () => void }) {
  const animatedStyle = useAnimatedStyle(() => {
    const interval = cardWidth + GAP;
    const center = index * interval;
    const n = (scrollX.value - center) / interval;
    const absN = Math.min(Math.abs(n), 1);
    const scale = interpolate(absN, [0, 1], [1, 0.94], Extrapolate.CLAMP);
    const translateY = interpolate(absN, [0, 1], [-10, 0], Extrapolate.CLAMP);
    const translateX = interpolate(n, [-1, 0, 1], [24, 0, -24], Extrapolate.CLAMP);
    const rotate = interpolate(n, [-1, 0, 1], [4.5, 0, -4.5], Extrapolate.CLAMP);
    const opacity = interpolate(absN, [0, 1], [1, 0.9], Extrapolate.CLAMP);
    return { transform: [{ translateX }, { translateY }, { rotateZ: `${rotate}deg` }, { scale }], opacity };
  });
  return (
    <Animated.View style={[{ width: cardWidth, paddingVertical: 10, minHeight: Math.round(cardWidth * 1.18) }, animatedStyle]}>
      <ShopHeroCard product={item} onPress={onPress} width={cardWidth} scrollX={scrollX} index={index} gap={GAP} />
    </Animated.View>
  );
}

export default function ShopScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark, insets);
  const { trackApply, trackRemove, trackSort } = useFilterAnalytics();
  const prevFiltersRef = React.useRef<Filters>({});
  // Horizontal swipe animation state
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    }
  });

  const [items, setItems] = React.useState<Product[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<Filters>({ sortBy: "newest" });
  const [filterOpen, setFilterOpen] = React.useState(false);

  const load = React.useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      const params: ProductsAPI.ProductQueryParams = {
        page: reset ? 1 : page,
        limit: 20,
        category: filters.category,
        brand: filters.brand,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        inStockOnly: filters.inStockOnly
      };
      const res = await ProductsAPI.getProducts(params);
      setTotalPages(res.totalPages);
      if (reset) {
        setItems(res.products);
      } else {
        setItems((prev) => [...prev, ...res.products]);
      }
      if (reset) {
        const prev = prevFiltersRef.current || {};
        const curr = filters;
        const count = res.products.length;
        if (prev.category !== curr.category) {
          if (curr.category) trackApply("category", curr.category, count);
          else if (prev.category) trackRemove("category", prev.category, count);
        }
        if (prev.brand !== curr.brand) {
          if (curr.brand) trackApply("brand", curr.brand, count);
          else if (prev.brand) trackRemove("brand", prev.brand, count);
        }
        if ((prev.minPrice ?? undefined) !== (curr.minPrice ?? undefined) || (prev.maxPrice ?? undefined) !== (curr.maxPrice ?? undefined)) {
          const label = `${curr.minPrice ?? ""}-${curr.maxPrice ?? ""}` || "range";
          if (curr.minPrice !== undefined || curr.maxPrice !== undefined) {
            trackApply("price", label, count);
          } else if (prev.minPrice !== undefined || prev.maxPrice !== undefined) {
            const prevLabel = `${prev.minPrice ?? ""}-${prev.maxPrice ?? ""}` || "range";
            trackRemove("price", prevLabel, count);
          }
        }
        if (prev.sortBy !== curr.sortBy && curr.sortBy) {
          trackSort(curr.sortBy, count);
        }
        prevFiltersRef.current = { ...filters };
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [page, filters]);

  React.useEffect(() => {
    load(true);
  }, [filters]);
  React.useEffect(() => {
    if (loading) {
      focusManagement.announce("Loading products");
    } else if (!loading && items.length > 0) {
      focusManagement.announce(`${items.length} products loaded`);
    }
  }, [loading, items.length]);

  React.useEffect(() => {
    const newFilters = route?.params?.filters as Filters | undefined;
    const cat = route?.params?.category as string | undefined;
    const brand = route?.params?.brand as string | undefined;

    if (newFilters) {
      setFilters(newFilters);
    } else if (cat || brand) {
      setFilters((f) => ({ ...f, category: cat ?? f.category, brand: brand ?? f.brand }));
    }
  }, [route?.params?.filters, route?.params?.category, route?.params?.brand]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const loadMore = () => {
    if (loadingMore || loading || page >= totalPages) return;
    setPage((p) => p + 1);
  };

  React.useEffect(() => {
    if (page > 1) load(false);
  }, [page]);

  const renderCarouselItem = React.useCallback(({ item, index }: { item: Product; index: number }) => (
    <CarouselItem
      item={item}
      index={index}
      cardWidth={CARD_WIDTH}
      scrollX={scrollX}
      onPress={() => navigation.navigate("ProductDetail", { productId: item.id, product: item })}
    />
  ), [navigation]);
  const keyExtractor = React.useCallback((item: Product) => item.id, []);
  const getItemLayout = React.useCallback((data: Product[] | null | undefined, index: number) => {
    const length = CARD_WIDTH + GAP;
    return { length, offset: length * index, index };
  }, []);

  const onViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (!Array.isArray(viewableItems) || viewableItems.length === 0) return;
    const indices = viewableItems.map((v) => (typeof v.index === "number" ? v.index : -1)).filter((i) => i >= 0);
    if (indices.length === 0) return;
    const start = Math.min(...indices);
    const end = Math.max(...indices);
    imagePreloader.preloadForList(items as any, { start, end }, 2);
  }).current;
  const viewabilityConfig = React.useRef({ minimumViewTime: 50, viewAreaCoveragePercentThreshold: 20 }).current;

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Search")}
            accessibilityRole="button"
            accessibilityLabel="Search products"
            accessibilityHint="Opens search screen"
          >
            <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Cart")}
            accessibilityRole="button"
            accessibilityLabel="Open cart"
            accessibilityHint="View items in your cart"
          >
            <MaterialCommunityIcons name="shopping-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <FilterBar
        filters={filters}
        onOpenFilters={() => navigation.navigate("AdvancedFilters", { currentFilters: filters })}
        onClearAll={() => setFilters({ sortBy: "newest" })}
      />
      {loading && items.length === 0 ? (
        <View style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={{ width: CARD_WIDTH }}>
              <ProductSkeleton />
            </View>
          ))}
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => load(true)} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No products found</Text>
          <TouchableOpacity onPress={() => setFilters({})} style={styles.retryBtn}>
            <Text style={styles.retryText}>Browse all</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          data={items}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + GAP}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          removeClippedSubviews={false}
          initialNumToRender={4}
          windowSize={5}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={renderCarouselItem}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? <View style={{ width: CARD_WIDTH, alignItems: "center", justifyContent: "center", paddingVertical: 8 }}><Text style={{ color: theme.colors.text.tertiary }}>Loading...</Text></View> : null
          }
        />
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingTop: Math.max(insets.top - 10, 8),
      paddingBottom: insets.bottom
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 0,
      marginBottom: 2
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.colors.text.primary
    },
    headerIcons: {
      flexDirection: "row",
      gap: 10
    },
    iconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.background.elevated,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    grid: {
      paddingHorizontal: 16,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: GAP
    },
    errorBox: {
      alignItems: "center",
      padding: 24
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: 8
    },
    emptyBox: {
      alignItems: "center",
      padding: 24
    },
    emptyTitle: {
      color: theme.colors.text.primary,
      marginBottom: 8,
      fontWeight: "700"
    },
    retryBtn: {
      backgroundColor: theme.colors.accent.emerald,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10
    },
    retryText: {
      color: theme.colors.text.inverse,
      fontWeight: "700"
    }
  });
