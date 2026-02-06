import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from "react-native-reanimated";

export type FaceStatus = "ok" | "too_close" | "too_far" | "no_face";

type Props = {
  status?: FaceStatus;
};

export default function FaceGuideOverlay({ status = "no_face" }: Props) {
  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(withTiming(1.06, { duration: 1200 }), -1, true);
  }, []);
  const ovalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  const statusText =
    status === "ok"
      ? "Aligned"
      : status === "too_close"
      ? "Move back"
      : status === "too_far"
      ? "Move closer"
      : "Looking for face";

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.oval, ovalStyle]} />
      <View style={styles.indicators}>
        <View style={styles.line} />
        <View style={[styles.line, { transform: [{ rotate: "90deg" }] }]} />
      </View>
      <View style={styles.status}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  oval: {
    width: 240,
    height: 320,
    borderRadius: 160,
    borderWidth: 2,
    borderColor: "#ffffff66"
  },
  indicators: { position: "absolute", width: 240, height: 320, alignItems: "center", justifyContent: "center" },
  line: { position: "absolute", width: 160, height: 2, backgroundColor: "#ffffff33" },
  status: { position: "absolute", bottom: 60 },
  statusText: { color: "#fff" }
});
