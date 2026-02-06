import React from "react";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  duration?: number;
  scale?: number;
  style?: any;
};

export default function ScaleInView({ children, duration = 300, scale = 1, style }: Props) {
  const v = useSharedValue(0.9);
  React.useEffect(() => {
    v.value = withTiming(scale, { duration });
  }, []);
  const s = useAnimatedStyle(() => ({ transform: [{ scale: v.value }] }));
  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}
