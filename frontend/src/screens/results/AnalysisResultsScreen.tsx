import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, ActivityIndicator, useTheme } from "react-native-paper";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "@navigation/types";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import BeforeAfterSlider from "@components/results/BeforeAfterSlider";
import ScoreCard from "@components/results/ScoreCard";
import FaceMapper, { Marker } from "@components/results/FaceMapper";
import ProductCard from "@components/results/ProductCard";
import ShareSheet from "@components/results/ShareSheet";
import ProgressBar from "@components/common/ProgressBar";
import { useAI } from "@context/AIContext";
import { getRecommendations } from "@services/api/perfectcorp";

type RouteProps = RouteProp<RootStackParamList, "Results">;

export default function AnalysisResultsScreen() {
  const route = useRoute<RouteProps>();
  const theme = useTheme();
  const navigation = useNavigation();
  const [shareOpen, setShareOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const { results } = useAI();

  const imageUri = route.params?.imageUri;
  const appear = useSharedValue(0);
  React.useEffect(() => {
    appear.value = withTiming(1, { duration: 250 });
  }, []);
  const appearStyle = useAnimatedStyle(() => ({ opacity: appear.value, transform: [{ translateY: (1 - appear.value) * 12 }] }));

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const recs = await getRecommendations("demo");
        setProducts(recs.map((r) => ({ image: r.imageUrl || "", name: r.name, brand: r.brand || "", price: "$", rating: r.score || 4 })));
      } catch (e: any) {
        setError(e?.message || null);
      }
    })();
  }, [results]);

  const markers: Marker[] = [
    { x: 0.5, y: 0.3, label: "T-zone", severity: "medium" },
    { x: 0.35, y: 0.55, label: "Cheek", severity: "low" },
    { x: 0.65, y: 0.55, label: "Cheek", severity: "high" }
  ];

  return (
    <Animated.View style={[styles.container, appearStyle]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text>{error}</Text>
          <Button onPress={() => setLoading(true)}>Retry</Button>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            {imageUri ? (
              <BeforeAfterSlider beforeUri={imageUri} afterUri={imageUri} />
            ) : (
              <View style={styles.center}>
                <Text>No image</Text>
              </View>
            )}
            <Button style={{ marginTop: 8 }} mode="outlined" onPress={() => setShareOpen(true)}>Share</Button>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.title}>Summary</Text>
            <View style={styles.row}>
              <ScoreCard title="Overall" score={82} icon="star-circle" />
              <ScoreCard title="Acne" score={24} color={theme.colors.error} icon="emoticon-sad-outline" />
              <ScoreCard title="Wrinkles" score={18} color={theme.colors.secondary} icon="emoticon-neutral-outline" />
            </View>
            <View style={{ marginTop: 8 }}>
              <ProgressBar value={82} showPercentage />
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.title}>Detailed Analysis</Text>
            {imageUri ? <FaceMapper imageUri={imageUri} markers={markers} /> : null}
            <View style={styles.row}>
              <Button mode="contained">Skin Tone</Button>
              <Button mode="outlined">Recommendations</Button>
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.title}>Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {products.map((p, i) => (
                <ProductCard
                  key={i}
                  image={p.image}
                  name={p.name}
                  brand={p.brand}
                  price={p.price}
                  rating={p.rating}
                  onTryOn={() => navigation.navigate("MainTabs", { screen: "HomeTab" } as any)}
                  onDetails={() => {}}
                  onFavorite={() => {}}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <Button mode="contained">Save</Button>
            <Button mode="outlined" onPress={() => setShareOpen(true)}>Share</Button>
            <Button mode="text" onPress={() => navigation.navigate("MainTabs", { screen: "HomeTab" } as any)}>New Analysis</Button>
            <Button mode="text">View Recommendations</Button>
          </View>
        </ScrollView>
      )}
      <ShareSheet visible={shareOpen} onDismiss={() => setShareOpen(false)} imageUri={imageUri} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  section: { marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { marginBottom: 8 },
  footer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingVertical: 12 }
});
