import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Button, ActivityIndicator, useTheme, Chip, Card, ProgressBar } from "react-native-paper";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "@navigation/types";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import ProductCard from "@components/results/ProductCard";
import ShareSheet from "@components/results/ShareSheet";
import CircularScore from "@components/common/CircularScore";
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

  const palette = { purple: "#6D28D9", blue: "#2563EB", red: "#EF4444", yellow: "#F59E0B", orange: "#FB923C" };
  const mock = {
    overall: 8.2,
    type: "Combination",
    toneHex: "#c68653",
    concerns: { acne: 0.35, darkSpots: 0.45, wrinkles: 0.28 },
    details: { hydration: 7.4, texture: 6.9, clarity: 7.8, overall: 8.2 }
  };

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
            <Card>
              <Card.Content>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.image} />
                ) : (
                  <View style={styles.center}><Text>No image</Text></View>
                )}
                <View style={styles.summaryRow}>
                  <CircularScore value={mock.overall} />
                  <View style={styles.summaryInfo}>
                    <Chip style={styles.chip} icon="water">Skin Type: {mock.type}</Chip>
                    <View style={styles.toneRow}>
                      <View style={[styles.swatch, { backgroundColor: mock.toneHex }]} />
                      <Text>Skin Tone</Text>
                    </View>
                    <View style={styles.concernRow}>
                      <Text>Acne</Text>
                      <ProgressBar progress={mock.concerns.acne} color={palette.red} style={styles.bar} />
                    </View>
                    <View style={styles.concernRow}>
                      <Text>Dark Spots</Text>
                      <ProgressBar progress={mock.concerns.darkSpots} color={palette.yellow} style={styles.bar} />
                    </View>
                    <View style={styles.concernRow}>
                      <Text>Wrinkles</Text>
                      <ProgressBar progress={mock.concerns.wrinkles} color={palette.orange} style={styles.bar} />
                    </View>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Button mode="contained" onPress={() => {}}>Save</Button>
                  <Button mode="outlined" onPress={() => setShareOpen(true)}>Share</Button>
                  <Button onPress={() => navigation.navigate("MainTabs" as never)}>New Analysis</Button>
                </View>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.title}>Detailed Scores</Text>
            <View style={styles.cards}>
              <Card style={styles.card}><Card.Content><Text>Hydration</Text><Text variant="titleLarge">{mock.details.hydration.toFixed(1)} / 10</Text></Card.Content></Card>
              <Card style={styles.card}><Card.Content><Text>Texture</Text><Text variant="titleLarge">{mock.details.texture.toFixed(1)} / 10</Text></Card.Content></Card>
              <Card style={styles.card}><Card.Content><Text>Clarity</Text><Text variant="titleLarge">{mock.details.clarity.toFixed(1)} / 10</Text></Card.Content></Card>
              <Card style={styles.card}><Card.Content><Text>Overall</Text><Text variant="titleLarge">{mock.details.overall.toFixed(1)} / 10</Text></Card.Content></Card>
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
  footer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingVertical: 12 },
  image: { width: "100%", height: 220, borderRadius: 12 },
  summaryRow: { flexDirection: "row", gap: 16, marginTop: 12, alignItems: "center" },
  summaryInfo: { flex: 1 },
  chip: { alignSelf: "flex-start", marginBottom: 8 },
  toneRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  swatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: "#eee" },
  concernRow: { marginBottom: 8 },
  bar: { height: 8, borderRadius: 4 },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { flexBasis: "48%" },
  actions: { flexDirection: "row", gap: 12, marginTop: 12 }
});
