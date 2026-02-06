import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, Text } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from "react-native-reanimated";

type Props = {
  value?: number;
  indeterminate?: boolean;
  color?: string;
  showPercentage?: boolean;
  steps?: number;
};

export default function ProgressBar({ value = 0, indeterminate, color, showPercentage, steps }: Props) {
  const theme = useTheme();
  const v = useSharedValue(0);
  React.useEffect(() => {
    if (indeterminate) {
      v.value = withRepeat(withTiming(100, { duration: 1200 }), -1, true);
    } else {
      v.value = withTiming(value, { duration: 200 });
    }
  }, [value, indeterminate]);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, v.value))}%`
  }));
  const c = color || theme.colors.primary;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: theme.colors.outline }]}>
        <Animated.View style={[styles.fill, { backgroundColor: c }, fillStyle]} />
      </View>
      {steps ? (
        <View style={styles.steps}>
          {Array.from({ length: steps }).map((_, i) => (
            <View key={i} style={[styles.step, { backgroundColor: theme.colors.outline }]} />
          ))}
        </View>
      ) : null}
      {showPercentage ? <Text style={styles.percent}>{Math.round(value)}%</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6 },
  steps: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  step: { width: 4, height: 4, borderRadius: 2 },
  percent: { marginTop: 6, alignSelf: "flex-end" }
});
