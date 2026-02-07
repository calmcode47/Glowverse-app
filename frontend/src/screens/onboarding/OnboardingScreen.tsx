import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useApp } from "@context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { theme } from "@constants/theme";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type Slide = {
  key: string;
  title: string;
  subtitle: string;
};

const slides: Slide[] = [
  {
    key: "welcome",
    title: "Your Brand",
    subtitle: "Boys beauty products & accessories. Curated for you.",
  },
  {
    key: "shop",
    title: "Shop with confidence",
    subtitle: "Skincare, grooming, hair, and accessories in one place.",
  },
  {
    key: "start",
    title: "Get started",
    subtitle: "Discover products and track your style.",
  },
];

export default function OnboardingScreen() {
  const { setOnboardingComplete } = useApp();
  const navigation = useNavigation();
  const [index, setIndex] = React.useState(0);
  const listRef = React.useRef<FlatList>(null);

  const complete = async () => {
    await setOnboardingComplete(true);
    navigation.navigate("MainTabs" as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={complete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setIndex(Math.round(x / width));
        }}
        renderItem={({ item, index: i }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.slideContent}>
              <LinearGradient
                colors={[theme.colors.orange, theme.colors.yellow]}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>YB</Text>
              </LinearGradient>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              {i === slides.length - 1 ? (
                <TouchableOpacity style={styles.cta} onPress={complete}>
                  <Text style={styles.ctaText}>Get Started</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
  },
  topBar: {
    padding: 16,
    alignItems: "flex-end",
  },
  skipText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.orange,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  slideContent: {
    alignItems: "center",
    maxWidth: 320,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text.primary,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: "700",
    color: theme.colors.text.inverse,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.muted,
    textAlign: "center",
    lineHeight: 24,
  },
  cta: {
    marginTop: 32,
    backgroundColor: theme.colors.orange,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: theme.radius.round,
  },
  ctaText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.text.inverse,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 48,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceDark,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.orange,
  },
});
