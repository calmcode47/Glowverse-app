import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import LottieView from "lottie-react-native";

type Props = {
  size?: "small" | "medium" | "large";
  source?: any;
};

export default function LoadingAnimation({ size = "medium", source }: Props) {
  const dim = size === "small" ? 48 : size === "large" ? 120 : 80;
  const v = useSharedValue(0.6);
  React.useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: v.value }], opacity: v.value }));

  if (source) {
    return <LottieView source={source} autoPlay loop style={{ width: dim, height: dim }} />;
  }

  return (
    <View style={[styles.container, { width: dim, height: dim }]}>
      <Animated.View style={[styles.dot, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  dot: { width: "50%", height: "50%", borderRadius: 60, backgroundColor: "#6C5CE7" }
});
