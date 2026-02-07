import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { theme } from "@constants/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type PillButtonProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function PillButton({ label, selected, onPress, style }: PillButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: theme.animation.durations.fast });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: theme.animation.durations.fast });
  };

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.pill,
        selected ? styles.pillSelected : styles.pillDefault,
        animatedStyle,
        style,
      ]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
        {label}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: theme.spacing.scale[5],
    paddingVertical: theme.spacing.scale[2],
    borderRadius: theme.radius.round,
    minWidth: 100,
    alignItems: "center",
  },
  pillSelected: {
    backgroundColor: theme.colors.orangeLight,
  },
  pillDefault: {
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.borderOrange,
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  labelSelected: {
    color: theme.colors.text.primary,
  },
  labelDefault: {
    color: theme.colors.text.inverse,
  },
});
