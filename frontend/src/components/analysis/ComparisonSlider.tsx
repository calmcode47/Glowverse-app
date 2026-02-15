import React from "react";
import { View, StyleSheet, Image, PanResponder, Animated, Dimensions } from "react-native";

type Props = {
  leftImage?: string;
  rightImage?: string;
  height?: number;
};

export default function ComparisonSlider({ leftImage, rightImage, height = 220 }: Props) {
  const width = Dimensions.get("window").width - 32;
  const x = React.useRef(new Animated.Value(width / 2)).current;
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_: any, g: any) => {
        const nx = Math.max(0, Math.min(width, g.moveX - 16));
        x.setValue(nx);
      },
      onPanResponderRelease: () => {}
    })
  ).current;

  return (
    <View style={[styles.container, { height, width }]}>
      {leftImage ? <Image source={{ uri: leftImage }} style={[styles.image, { height, width }]} /> : null}
      <Animated.View style={[styles.overlay, { width: x, height }]}>
        {rightImage ? <Image source={{ uri: rightImage }} style={[styles.image, { height, width }]} /> : null}
      </Animated.View>
      <Animated.View
        style={[styles.handle, { transform: [{ translateX: Animated.subtract(x, new Animated.Value(16)) }] }]}
        {...panResponder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="Comparison slider"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "center", borderRadius: 12, overflow: "hidden" },
  image: { resizeMode: "cover" },
  overlay: { position: "absolute", left: 0, top: 0, overflow: "hidden" },
  handle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 32,
    backgroundColor: "rgba(255,255,255,0.35)"
  }
});
