import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import LottieView from "lottie-react-native";

type Props = {
  autoDismissMs?: number;
  onDismiss?: () => void;
  source?: any;
};

export default function SuccessAnimation({ autoDismissMs = 1200, onDismiss, source }: Props) {
  const v = useSharedValue(0);
  React.useEffect(() => {
    v.value = withTiming(1, { duration: 250 }, () => {
      setTimeout(() => {
        v.value = withTiming(0, { duration: 200 });
        onDismiss?.();
      }, autoDismissMs);
    });
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: v.value }));
  return (
    <Animated.View style={[styles.container, style]}>
      {source ? (
        <LottieView source={source} autoPlay loop={false} style={{ width: 120, height: 120 }} />
      ) : (
        <View style={styles.check} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  check: { width: 80, height: 80, borderRadius: 40, borderWidth: 8, borderColor: "#2ecc71" }
});
