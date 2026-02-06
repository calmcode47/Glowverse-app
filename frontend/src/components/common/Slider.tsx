import React from "react";
import { View, StyleSheet, LayoutChangeEvent, Text } from "react-native";
import { useTheme } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
};

export default function Slider({ value, onChange, min = 0, max = 100, step = 1, showValue = true }: Props) {
  const theme = useTheme();
  const [width, setWidth] = React.useState(0);
  const x = useSharedValue(0);

  const clamp = (v: number) => Math.min(Math.max(v, min), max);
  const snap = (v: number) => Math.round(v / step) * step;

  React.useEffect(() => {
    const ratio = (value - min) / (max - min);
    x.value = withTiming(ratio * width, { duration: 150 });
  }, [value, width, min, max]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const onGestureEvent = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    const nx = Math.min(Math.max(nativeEvent.translationX + nativeEvent.x, 0), width);
    const val = snap(clamp(min + (nx / width) * (max - min)));
    runOnJS(onChange)(val);
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - 12 }]
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: x.value
  }));

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={[styles.track, { backgroundColor: theme.colors.outline }]} />
      <Animated.View style={[styles.fill, { backgroundColor: theme.colors.primary }, fillStyle]} />
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={[styles.thumb, { backgroundColor: theme.colors.primary }, thumbStyle]} />
      </PanGestureHandler>
      {showValue ? <Text style={styles.value}>{value}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 32, justifyContent: "center" },
  track: { position: "absolute", height: 4, left: 0, right: 0, borderRadius: 2 },
  fill: { position: "absolute", height: 4, left: 0, borderRadius: 2 },
  thumb: { position: "absolute", width: 24, height: 24, borderRadius: 12 },
  value: { position: "absolute", right: 0, top: 6 }
});
