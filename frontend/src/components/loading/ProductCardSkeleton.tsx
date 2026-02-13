import React from "react";
import { View, StyleSheet, Animated } from "react-native";

export default function ProductCardSkeleton() {
  const shimmer = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = () => {
      shimmer.setValue(0);
      Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }).start(() => loop());
    };
    loop();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] });
  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { opacity }]} />
      <Animated.View style={[styles.line, { width: "80%", opacity }]} />
      <Animated.View style={[styles.line, { width: "60%", opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", gap: 8 },
  image: { width: "100%", aspectRatio: 1, borderRadius: 12, backgroundColor: "#e5e7eb" },
  line: { height: 12, borderRadius: 6, backgroundColor: "#e5e7eb" }
});
