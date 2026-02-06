import React from "react";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Direction = "left" | "right" | "up" | "down";
type Props = {
  children: React.ReactNode;
  duration?: number;
  direction?: Direction;
  distance?: number;
  style?: any;
};

export default function SlideInView({ children, duration = 300, direction = "up", distance = 20, style }: Props) {
  const v = useSharedValue(direction === "up" ? distance : direction === "down" ? -distance : 0);
  const h = useSharedValue(direction === "left" ? distance : direction === "right" ? -distance : 0);
  React.useEffect(() => {
    v.value = withTiming(0, { duration });
    h.value = withTiming(0, { duration });
  }, []);
  const s = useAnimatedStyle(() => ({
    transform: [{ translateY: v.value }, { translateX: h.value }]
  }));
  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}
