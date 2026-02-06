import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Props = {
  visible: boolean;
  message?: string;
};

export default function LoadingOverlay({ visible, message }: Props) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  React.useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;
  return (
    <Animated.View style={[styles.overlay, style]} accessibilityLabel="Loading overlay">
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <ActivityIndicator />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)"
  },
  card: {
    minWidth: 180,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  message: {
    marginTop: 8
  }
});
