import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";
import type { RootStackParamList } from "@navigation/types";
import {
  CategoryFilters,
  AnimatedBarChart,
  ShopProductCard,
  SearchBar,
  StatCircle,
} from "@components/ui";
import {
  mockProducts,
  brandChartData,
  shopListItems,
} from "@constants/mockData";
import ShopListCard from "@components/ui/ShopListCard";

export default function ShopScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [category, setCategory] = useState("good");
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    let list = mockProducts;
    if (category === "good") list = list.filter((p) => p.badge === "Good");
    else if (category === "our_brands") list = list.filter((p) => p.badge === "Our Brands");
    else if (category === "offers") list = list.filter((p) => p.badge === "Offers");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
      );
    }
    return list;
  }, [category, search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brandLabel}>Your Brand</Text>
          <Text style={styles.headerTitle}>SHOP</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="star-outline" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="map-marker-outline" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <CategoryFilters selectedId={category} onSelect={setCategory} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {shopListItems.slice(0, 4).map((item) => (
          <ShopListCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            icon="cart"
            onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
          />
        ))}

        <View style={styles.chartWrap}>
          <AnimatedBarChart
            data={brandChartData}
            title="Your Brand"
            height={100}
          />
        </View>

        <View style={styles.bottomStats}>
          <StatCircle value={63} size={48} />
          <StatCircle value={89} size={48} />
          <StatCircle icon="home" size={48} />
        </View>

        <Text style={styles.sectionTitle}>Products</Text>
        <View style={styles.grid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ShopProductCard
                product={product}
                variant="dark"
                fullWidth
                onPress={() =>
                  navigation.navigate("ProductDetail", { productId: product.id })
                }
              />
            </View>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 48,
    paddingBottom: 8,
  },
  brandLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.muted,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: "700",
    color: theme.colors.text.inverse,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  chartWrap: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.lg,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderOrange,
  },
  bottomStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.text.inverse,
    marginLeft: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 12,
  },
  bottomPad: {
    height: 24,
  },
});
