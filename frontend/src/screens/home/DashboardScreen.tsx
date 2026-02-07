import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";
import type { RootStackParamList } from "@navigation/types";
import {
  GradientCard,
  StatCircle,
  AnimatedBarChart,
  CarouselCard,
  ShopProductCard,
} from "@components/ui";
import {
  brandChartData,
  dashboardStats,
  mockProducts,
} from "@constants/mockData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;

export default function DashboardScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const featured = mockProducts.slice(0, 4);

  const scoreStat = dashboardStats.find((s) => s.id === "score");
  const engagementStat = dashboardStats.find((s) => s.id === "engagement");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>Your Brand</Text>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="account-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="crown" size={20} color={theme.colors.orange} />
            <Text style={styles.proBadge}>pro</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.gradientWrap}>
          <GradientCard
            title={scoreStat?.label ?? "NAME"}
            value={scoreStat?.value as number}
          />
        </View>
        <View style={styles.statCircles}>
          <StatCircle value={engagementStat?.value as number} size={52} />
          <StatCircle icon="bell" size={52} />
          <StatCircle icon="user" size={52} />
        </View>
      </View>

      <View style={styles.carouselWrap}>
        <CarouselCard
          title="Your Brand"
          body="Discover boys beauty products and grooming essentials. Curated for you."
          onPrev={() => setCarouselIndex((i) => Math.max(0, i - 1))}
          onNext={() => setCarouselIndex((i) => i + 1)}
          dark={false}
        />
      </View>

      <View style={styles.carouselSection}>
        <CarouselCard
          title="Title goes"
          body="Featured accessories and skincare picks."
          onPrev={() => {}}
          onNext={() => {}}
          dark={false}
        />
      </View>

      <View>
        <Text style={styles.sectionTitle}>Trending</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {featured.map((product, i) => (
            <View key={product.id} style={styles.productCardWrap}>
              <ShopProductCard
                product={product}
                variant="light"
                onPress={() =>
                  navigation.navigate("ProductDetail", { productId: product.id })
                }
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.chartSection}>
        <AnimatedBarChart data={brandChartData} title="Your Brand" />
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingTop: Platform.OS === "ios" ? 56 : 48,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  brandName: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: "700",
    color: theme.colors.text.primary,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  proBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.orange,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  gradientWrap: {
    flex: 1,
    minWidth: 140,
  },
  statCircles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  carouselWrap: {
    paddingHorizontal: 16,
  },
  carouselSection: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginLeft: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: CARD_GAP,
    paddingBottom: 8,
  },
  productCardWrap: {
    marginRight: CARD_GAP,
  },
  chartSection: {
    marginTop: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  bottomPad: {
    height: 24,
  },
});
