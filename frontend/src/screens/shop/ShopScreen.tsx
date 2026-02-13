import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/types";
import type { Product } from "../../data/products";
import * as ProductsAPI from "../../services/api/products.api";
import ProductCard from "../../components/shop/ProductCard";
import ProductSkeleton from "../../components/shop/ProductSkeleton";
import FilterBar, { Filters } from "../../components/shop/FilterBar";
import FilterModal from "../../components/shop/FilterModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - GAP) / 2;

export default function ShopScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, isDark, insets);

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
        sortBy: filters.sortBy
      };
      const res = await ProductsAPI.getProducts(params);
      setTotalPages(res.totalPages);
      if (reset) {
        setItems(res.products);
      } else {
        setItems((prev) => [...prev, ...res.products]);
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
    const cat = route?.params?.category as string | undefined;
    const brand = route?.params?.brand as string | undefined;
    if (cat || brand) {
      setFilters((f) => ({ ...f, category: cat ?? f.category, brand: brand ?? f.brand }));
    }
  }, [route?.params]);

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

  const renderItem = React.useCallback(({ item }: { item: Product }) => (
    <View style={{ width: CARD_WIDTH }}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate("ProductDetail", { productId: item.id, product: item })}
      />
    </View>
  ), [navigation]);
  const keyExtractor = React.useCallback((item: Product) => item.id, []);
  const getItemLayout = React.useCallback((data: Product[] | null | undefined, index: number) => {
    const length = CARD_WIDTH + GAP + 12;
    return { length, offset: length * index, index };
  }, []);

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
        onOpenFilters={() => setFilterOpen(true)}
        onClearAll={() => setFilters({})}
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
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: 16, marginBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={100}
          onEndReachedThreshold={0.2}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? <View style={{ paddingVertical: 16, alignItems: "center" }}><Text style={{ color: theme.colors.text.tertiary }}>Loading...</Text></View> : null
          }
        />
      )}
      <FilterModal
        visible={filterOpen}
        value={filters}
        onChange={(v) => setFilters(v)}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingTop: insets.top,
      paddingBottom: insets.bottom
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 8
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text.primary
    },
    headerIcons: {
      flexDirection: "row",
      gap: 12
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
