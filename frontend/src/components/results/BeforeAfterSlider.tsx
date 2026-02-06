import React from "react";
import { View, Image, StyleSheet, LayoutChangeEvent } from "react-native";
import { Text } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

type Props = {
  beforeUri: string;
  afterUri: string;
};

export default function BeforeAfterSlider({ beforeUri, afterUri }: Props) {
  const w = React.useRef(0);
  const x = useSharedValue(0);
  const onLayout = (e: LayoutChangeEvent) => {
    w.current = e.nativeEvent.layout.width;
    x.value = withTiming(w.current / 2, { duration: 150 });
  };
  const maskStyle = useAnimatedStyle(() => ({ width: x.value }));
  const onGestureEvent = ({ nativeEvent }: any) => {
    const nx = Math.min(Math.max(nativeEvent.absoluteX, 0), w.current);
    x.value = nx;
  };
  return (
    <View style={styles.container} onLayout={onLayout}>
      <Image source={{ uri: afterUri }} style={styles.img} />
      <Animated.View style={[styles.mask, maskStyle]}>
        <Image source={{ uri: beforeUri }} style={styles.img} />
      </Animated.View>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={[styles.handle, { left: x.value - 12 }]}>
          <View style={styles.line} />
        </Animated.View>
      </PanGestureHandler>
      <Text style={[styles.label, { left: 12 }]}>Before</Text>
      <Text style={[styles.label, { right: 12 }]}>After</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 280, borderRadius: 12, overflow: "hidden" },
  img: { width: "100%", height: "100%" },
  mask: { position: "absolute", left: 0, top: 0, bottom: 0, overflow: "hidden" },
  handle: { position: "absolute", top: 0, bottom: 0, width: 24, alignItems: "center", justifyContent: "center" },
  line: { width: 2, height: "100%", backgroundColor: "#ffffff88" },
  label: { position: "absolute", bottom: 10, color: "#fff" }
});
