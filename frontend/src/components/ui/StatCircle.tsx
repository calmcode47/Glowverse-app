import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence } from "react-native-reanimated";
import { theme } from "@constants/theme";

type StatCircleProps = {
  value?: number | string;
  icon?: "home" | "bell" | "user";
  size?: number;
  style?: ViewStyle;
};

export default function StatCircle({ value, icon, size = 56, style }: StatCircleProps) {
  const scale = useSharedValue(0.8);
  React.useEffect(() => {
    scale.value = withSequence(
      withSpring(1, { damping: 12 }),
    );
  }, [value, icon]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconName = icon === "home" ? "home" : icon === "bell" ? "bell-outline" : "account-outline";

  return (
    <Animated.View
      style={[
        styles.outer,
        { width: size, height: size, borderRadius: size / 2, borderWidth: 2 },
        animatedStyle,
        style,
      ]}
    >
      <View style={[styles.inner, { width: size - 12, height: size - 12, borderRadius: (size - 12) / 2 }]}>
        {icon ? (
          <MaterialCommunityIcons
            name={iconName}
            size={size * 0.4}
            color={theme.colors.text.inverse}
          />
        ) : (
          <Text style={[styles.value, { fontSize: size * 0.36 }]}>{value ?? ""}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderColor: theme.colors.borderOrange,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceDark,
  },
  inner: {
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    color: theme.colors.text.inverse,
    fontWeight: "700",
  },
});
