import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";
import type { RootStackParamList } from "@navigation/types";
import { SearchBar, AnimatedBarChart, CarouselCard } from "@components/ui";
import { mockProducts, categoryChartData } from "@constants/mockData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ProductDetailRoute = RouteProp<RootStackParamList, "ProductDetail">;

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailRoute>();
  const productId = route.params?.productId ?? "";
  const product = mockProducts.find((p) => p.id === productId) ?? mockProducts[0];
  const [carouselIndex, setCarouselIndex] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>SHOP</Text>
          <Text style={styles.headerSubtitle}>NAME</Text>
        </View>
        <TouchableOpacity style={styles.checkBtn}>
          <MaterialCommunityIcons name="check-circle" size={32} color={theme.colors.orange} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: product.imageUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.searchWrap}>
          <SearchBar placeholder="Search..." containerStyle={styles.searchBar} />
        </View>

        <View style={styles.chartSection}>
          <AnimatedBarChart
            data={categoryChartData}
            title="Categories"
            height={100}
          />
        </View>

        <View style={styles.infoCard}>
          <CarouselCard
            title="here"
            body="Boys beauty and grooming essentials. This product is part of our curated collection for skincare, styling, and accessories."
            onPrev={() => setCarouselIndex((i) => Math.max(0, i - 1))}
            onNext={() => setCarouselIndex((i) => i + 1)}
            dark={false}
          />
        </View>

        <View style={styles.productMeta}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="account" size={24} color={theme.colors.text.inverse} />
          </View>
          <View style={styles.dots}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === 1 && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.arrowBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.orange} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowBtn}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.orange} />
          </TouchableOpacity>
          <Text style={styles.metaNum}>11</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionIcon}>
            <MaterialCommunityIcons name="shopping-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <MaterialCommunityIcons name="heart-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaText}>Title goes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 48,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: "700",
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  checkBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  heroWrap: {
    width: SCREEN_WIDTH,
    height: 260,
    backgroundColor: theme.colors.surface,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    backgroundColor: theme.colors.surfaceDark,
  },
  chartSection: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text.muted,
  },
  dotActive: {
    backgroundColor: theme.colors.orange,
    width: 16,
  },
  arrowBtn: {
    padding: 4,
  },
  metaNum: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  actionIcon: {
    padding: 8,
  },
  ctaButton: {
    flex: 1,
    backgroundColor: theme.colors.orange,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  ctaText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.text.inverse,
  },
  bottomPad: {
    height: 24,
  },
});
