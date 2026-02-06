import React from "react";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: any;
};

export default function FadeInView({ children, duration = 300, delay = 0, style }: Props) {
  const v = useSharedValue(0);
  React.useEffect(() => {
    setTimeout(() => {
      v.value = withTiming(1, { duration });
    }, delay);
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: v.value }));
  return <Animated.View style={[style, s]}>{children}</Animated.View>;
}
