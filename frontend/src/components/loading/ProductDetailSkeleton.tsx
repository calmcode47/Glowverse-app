import React from "react";
import { View, StyleSheet, Animated } from "react-native";

export default function ProductDetailSkeleton() {
  const v = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = () => {
      v.setValue(0);
      Animated.timing(v, { toValue: 1, duration: 1200, useNativeDriver: true }).start(() => loop());
    };
    loop();
  }, [v]);
  const opacity = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] });
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.image, { opacity }]} />
      <Animated.View style={[styles.line, { width: "70%", opacity }]} />
      <Animated.View style={[styles.line, { width: "40%", opacity }]} />
      <Animated.View style={[styles.bigLine, { opacity }]} />
      <Animated.View style={[styles.bigLine, { width: "90%", opacity }]} />
      <Animated.View style={[styles.bigLine, { width: "80%", opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  image: { width: "100%", aspectRatio: 1, borderRadius: 12, backgroundColor: "#e5e7eb" },
  line: { height: 14, borderRadius: 7, backgroundColor: "#e5e7eb" },
  bigLine: { height: 10, borderRadius: 6, backgroundColor: "#e5e7eb" }
});
