import React from "react";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

export function useFade(duration = 250) {
  const v = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ opacity: v.value }));
  const show = () => (v.value = withTiming(1, { duration }));
  const hide = () => (v.value = withTiming(0, { duration }));
  return { style, show, hide, value: v };
}

export function useScale(duration = 250, from = 0.95, to = 1) {
  const v = useSharedValue(from);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: v.value }] }));
  const up = () => (v.value = withTiming(to, { duration }));
  const down = () => (v.value = withTiming(from, { duration }));
  return { style, up, down, value: v };
}

export function useSlide(duration = 250, axis: "x" | "y" = "y", distance = 20) {
  const v = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: axis === "y" ? [{ translateY: v.value }] : [{ translateX: v.value }]
  }));
  const inFn = () => (v.value = withTiming(0, { duration }));
  const outFn = () => (v.value = withTiming(distance, { duration }));
  return { style, in: inFn, out: outFn, value: v };
}
