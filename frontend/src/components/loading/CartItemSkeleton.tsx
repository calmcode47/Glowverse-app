import React from "react";
import { View, StyleSheet, Animated } from "react-native";

export default function CartItemSkeleton() {
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
    <View style={styles.row}>
      <Animated.View style={[styles.thumb, { opacity }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <Animated.View style={[styles.line, { width: "70%", opacity }]} />
        <Animated.View style={[styles.line, { width: "40%", opacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  thumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: "#e5e7eb" },
  line: { height: 12, borderRadius: 6, backgroundColor: "#e5e7eb" }
});
