import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Keyboard, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import ProductCard from "../../components/shop/ProductCard";
import type { Product } from "../../data/products";
import * as ProductsAPI from "../../services/api/products.api";
import SearchSuggestions from "../../components/search/SearchSuggestions";
import RecentSearches from "../../components/search/RecentSearches";
import PopularSearches from "../../components/search/PopularSearches";
import FilterModal from "../../components/shop/FilterModal";
import { analytics } from "../../services/analytics.service";
import { imagePreloader } from "../../services/imagePreloader.service";

export default function SearchScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<{ category?: string; brand?: string; minPrice?: number; maxPrice?: number; rating?: number; sortBy?: "relevance" | "price_asc" | "price_desc" | "rating" }>({ sortBy: "relevance" });
  const [resultCount, setResultCount] = React.useState<number>(0);

  const performSearch = React.useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setResultCount(0);
      return;
    }
    setLoading(true);
    try {
      const sortKey = filters.sortBy === "relevance" ? undefined : (filters.sortBy as any);
      const res = await ProductsAPI.searchProducts(q.trim(), { category: filters.category, brand: filters.brand, sortBy: sortKey, page: 1, limit: 40 });
      setResults(res.products);
      setResultCount(res.total);
      await analytics.logSearch(q.trim(), res.total);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    analytics.logScreenView("Search", "SearchScreen");
  }, []);
  React.useEffect(() => {
    const id = setTimeout(async () => {
      if (query.trim().length === 0) {
        setSuggestions([]);
        setResults([]);
        setResultCount(0);
        return;
      }
      const s = await ProductsAPI.getSearchSuggestions(query.trim(), 8);
      setSuggestions(s);
      performSearch(query);
    }, 300);
    return () => clearTimeout(id);
  }, [query, performSearch]);

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />
      <View style={[styles.header, { paddingTop: 60 }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary }]}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <MaterialCommunityIcons name="close" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setFiltersOpen(true)}>
            <MaterialCommunityIcons name="filter-variant" size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        {query.length > 0 && suggestions.length > 0 ? (
          <SearchSuggestions
            query={query}
            suggestions={suggestions}
            onSelect={(t) => {
              setQuery(t);
              performSearch(t);
              Keyboard.dismiss();
            }}
          />
        ) : null}
      </View>
      {query.length === 0 ? (
        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          <RecentSearches onSelect={(t) => { setQuery(t); performSearch(t); }} />
          <PopularSearches onSelect={(t) => { setQuery(t); performSearch(t); }} />
        </View>
      ) : loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <Text style={{ paddingHorizontal: 16, paddingBottom: 8, color: theme.colors.text.secondary }}>{resultCount} results for "{query}"</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.resultsList}
            removeClippedSubviews
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            updateCellsBatchingPeriod={50}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate("ProductDetail", { productId: item.id, product: item })}
                onAddedToCart={() => {}}
              />
            )}
            onViewableItemsChanged={({ viewableItems }) => {
              const indices = viewableItems.map(v => (typeof v.index === "number" ? v.index : -1)).filter(i => i >= 0);
              if (indices.length > 0) {
                imagePreloader.preloadForList(results as any, { start: Math.min(...indices), end: Math.max(...indices) }, 2);
              }
            }}
            viewabilityConfig={{ minimumViewTime: 50, viewAreaCoveragePercentThreshold: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={{ color: theme.colors.text.secondary }}>No results found</Text>
              </View>
            }
          />
        </>
      )}
      <FilterModal
        visible={filtersOpen}
        onDismiss={() => setFiltersOpen(false)}
        onApply={(f: any) => {
          setFilters((prev) => ({ ...prev, ...f }));
          if (query.trim()) performSearch(query);
          setFiltersOpen(false);
        }}
        initial={filters as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    resultsList: {
        paddingHorizontal: 10,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    }
});
