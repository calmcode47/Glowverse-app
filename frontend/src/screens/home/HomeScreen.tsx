import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Image } from "react-native";
import { Text, Avatar, IconButton, useTheme, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { useApp } from "@context/AppContext";
import { useCameraContext } from "@context/CameraContext";
import FeatureCard from "@components/home/FeatureCard";
import HistoryItem from "@components/home/HistoryItem";
import HeroBanner from "@components/home/HeroBanner";
import TipCard from "@components/home/TipCard";
import EmptyState from "@components/common/EmptyState";

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useApp();
  const { capturedImages, removeImage } = useCameraContext();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const startAnalysis = () => {
    navigation.navigate("MainTabs", { screen: "CameraTab" } as any);
  };

  const banners = [
    {
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1920&auto=format&fit=crop",
      title: "AI-powered beauty analysis",
      subtitle: "Personalized insights in seconds",
      ctaText: "Start Your Analysis",
      onPress: startAnalysis
    },
    {
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1920&auto=format&fit=crop",
      title: "Try makeup in AR",
      subtitle: "Find your perfect look",
      ctaText: "Try Now",
      onPress: startAnalysis
    }
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="titleLarge">Welcome{user.name ? `, ${user.name}` : ""}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>Discover your best look</Text>
        </View>
        <View style={styles.headerRight}>
          <Avatar.Text size={36} label={(user.name || "G")[0].toUpperCase()} onTouchEnd={() => navigation.navigate("MainTabs", { screen: "ProfileTab" } as any)} />
          <IconButton icon="bell-outline" onPress={() => navigation.navigate("Settings")} />
        </View>
      </View>

      <HeroBanner items={banners} />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Features</Text>
        <View style={styles.grid}>
          <FeatureCard
            icon="face-man-shimmer"
            title="Skin Analysis"
            description="Analyze your skin metrics"
            gradient
            onPress={startAnalysis}
          />
          <FeatureCard icon="lipstick" title="Virtual Makeup" description="Try looks instantly" gradient onPress={startAnalysis} />
          <FeatureCard icon="hair-dryer" title="Hair Try-On" description="Experiment with colors" onPress={startAnalysis} />
          <FeatureCard icon="account-circle-outline" title="Face Shape" description="Discover your shape" onPress={startAnalysis} />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Recent History</Text>
        {loading ? (
          <View style={styles.row}>
            <ActivityIndicator />
          </View>
        ) : capturedImages.length === 0 ? (
          <EmptyState
            iconName="history"
            title="No recent analyses"
            description="Start an analysis to see results here."
            ctaText="Start Now"
            onPressCTA={startAnalysis}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {capturedImages.map((img) => (
              <HistoryItem
                key={img.uri}
                thumbnail={img.uri}
                type="Analysis"
                date={new Date(img.timestamp).toLocaleString()}
                onPress={() => navigation.navigate("Results", { imageUri: img.uri })}
                onDelete={() => removeImage(img.uri)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Tips & Tutorials</Text>
        <TipCard icon="lightbulb-on-outline" title="Good lighting" content="Stand facing a light source to reduce shadows." />
        <TipCard icon="camera-iris" title="Frame your face" content="Align your face within the guide for best results." />
        <TipCard icon="water" title="Clean skin" content="Remove makeup for accurate skin analysis readings." />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 }
});
