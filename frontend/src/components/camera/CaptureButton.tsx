import React from "react";
import { StyleSheet } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";

type Props = {
  loading?: boolean;
  onPress?: () => void;
  success?: boolean;
};

export default function CaptureButton({ loading, onPress, success }: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);

  React.useEffect(() => {
    ring.value = withTiming(success ? 1 : 0, { duration: 300 });
  }, [success]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value }));

  return (
    <TouchableOpacity
      onPress={() => {
        scale.value = withTiming(0.92, { duration: 80 }, () => {
          scale.value = withTiming(1, { duration: 80 });
        });
        onPress?.();
      }}
      accessibilityLabel="Capture photo"
    >
      <Animated.View style={[styles.button, { borderColor: theme.colors.primary }, style]}>
        {loading ? <ActivityIndicator /> : <Animated.View style={[styles.success, ringStyle]} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  success: { position: "absolute", width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(76,175,80,0.5)" }
});
