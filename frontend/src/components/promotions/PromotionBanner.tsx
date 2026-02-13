import React from "react";
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Promotion } from "../../services/api/promotions.api";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

const { width } = Dimensions.get("window");

type Props = {
  items: Promotion[];
  onPress: (p: Promotion) => void;
};

export default function PromotionBanner({ items, onPress }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const idx = useSharedValue(0);
  React.useEffect(() => {
    const t = setInterval(() => {
      idx.value = (idx.value + 1) % Math.max(1, items.length);
    }, 4000);
    return () => clearInterval(t);
  }, [items.length]);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateX: withTiming(-idx.value * width) }] }));
  if (items.length === 0) return null as any;
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.row, anim]}>
        {items.map((p) => (
          <TouchableOpacity key={p.id} style={styles.slide} onPress={() => onPress(p)}>
            {p.image ? <Image source={{ uri: p.image }} style={styles.image} /> : <View style={[styles.image, { backgroundColor: theme.colors.background.secondary }]} />}
          </TouchableOpacity>
        ))}
      </Animated.View>
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx.value && { backgroundColor: theme.colors.accent.emerald }]} />
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { height: 160 },
    row: { flexDirection: "row", width: width * 3, height: "100%" },
    slide: { width, height: "100%" },
    image: { width: "92%", height: "100%", marginHorizontal: "4%", borderRadius: 16 },
    dots: { position: "absolute", bottom: 8, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ffffff66" }
  });
}
