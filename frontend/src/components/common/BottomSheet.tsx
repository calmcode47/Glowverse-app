import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  snapPoints?: number[];
  children?: React.ReactNode;
};

export default function BottomSheet({ visible, onDismiss, snapPoints = [300, 500], children }: Props) {
  const theme = useTheme();
  const screenH = Dimensions.get("window").height;
  const maxPoint = Math.min(...snapPoints);
  const y = useSharedValue(screenH);
  const backdrop = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      y.value = withTiming(screenH - maxPoint, { duration: 250 });
      backdrop.value = withTiming(1, { duration: 250 });
    } else {
      y.value = withTiming(screenH, { duration: 250 });
      backdrop.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const snapToClosest = (pos: number) => {
    const targets = snapPoints.map((p) => screenH - p);
    const closest = targets.reduce((prev, curr) => (Math.abs(curr - pos) < Math.abs(prev - pos) ? curr : prev));
    y.value = withTiming(closest, { duration: 200 });
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }]
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value
  }));

  const onGestureEvent = ({ nativeEvent }: any) => {
    const next = nativeEvent.absoluteY;
    y.value = next;
  };

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === 5) {
      if (nativeEvent.absoluteY > screenH - 100) {
        runOnJS(onDismiss)();
      } else {
        runOnJS(snapToClosest)(nativeEvent.absoluteY);
      }
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
        <Animated.View style={[styles.sheet, { backgroundColor: theme.colors.surface }, sheetStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  backdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16, minHeight: 200, padding: 16 }
});
