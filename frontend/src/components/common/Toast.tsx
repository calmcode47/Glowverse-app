import React, { forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";

export type ToastVariant = "success" | "error" | "info" | "warning";
export type ToastItem = { id: string; title: string; variant: ToastVariant; duration?: number };

export type ToastRef = {
  show: (item: Omit<ToastItem, "id">) => void;
};

export default forwardRef<ToastRef, {}>(function Toast(_, ref) {
  const theme = useTheme();
  const [queue, setQueue] = React.useState<ToastItem[]>([]);

  const add = (item: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    const t: ToastItem = { id, ...item };
    setQueue((q) => [...q, t]);
    const d = item.duration ?? 3000;
    setTimeout(() => dismiss(id), d);
  };

  useImperativeHandle(ref, () => ({ show: add }), []);

  const dismiss = (id: string) => {
    setQueue((q) => q.filter((x) => x.id !== id));
  };

  const colorFor = (v: ToastVariant) =>
    v === "success"
      ? theme.colors.primary
      : v === "error"
      ? theme.colors.error
      : v === "warning"
      ? theme.colors.secondary
      : theme.colors.surface;

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {queue.map((t) => (
        <ToastRow key={t.id} title={t.title} color={colorFor(t.variant)} onDismiss={() => dismiss(t.id)} />
      ))}
    </View>
  );
});

function ToastRow({ title, color, onDismiss }: { title: string; color: string; onDismiss: () => void }) {
  const y = useSharedValue(50);
  const opacity = useSharedValue(0);
  React.useEffect(() => {
    y.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: opacity.value }));

  const onGestureEvent = ({ nativeEvent }: any) => {
    if (nativeEvent.translationX > 40 || nativeEvent.translationX < -40) {
      runOnJS(onDismiss)();
    }
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View style={[styles.row, style, { backgroundColor: color }]}>
        <Text style={styles.text}>{title}</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, right: 0, bottom: 24, alignItems: "center", paddingHorizontal: 16 },
  row: { minWidth: 280, borderRadius: 12, padding: 12, marginVertical: 6 },
  text: { color: "#fff" }
});
