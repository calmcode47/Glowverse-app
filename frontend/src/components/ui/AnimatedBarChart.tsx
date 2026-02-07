import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { theme } from "@constants/theme";
import type { ChartDataPoint } from "@constants/mockData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_PADDING = 24;
const MAX_BAR_WIDTH = (SCREEN_WIDTH - CHART_PADDING * 2) / 8 - 8;
const MAX_HEIGHT = 120;

type AnimatedBarChartProps = {
  data: ChartDataPoint[];
  title?: string;
  maxValue?: number;
  height?: number;
};

export default function AnimatedBarChart({
  data,
  title,
  maxValue,
  height = MAX_HEIGHT,
}: AnimatedBarChartProps) {
  const computedMax = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={[styles.chartRow, { height }]}>
        {data.map((point, index) => (
          <Bar
            key={point.label}
            label={point.label}
            value={point.value}
            maxValue={computedMax}
            color={point.color === "orange" ? theme.colors.orange : theme.colors.primary}
            height={height}
            index={index}
          />
        ))}
      </View>
    </View>
  );
}

function Bar({
  label,
  value,
  maxValue,
  color,
  height,
  index,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  height: number;
  index: number;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      index * 80,
      withTiming(value / maxValue, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [value, maxValue, index]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    height: height * 0.85 * progress.value,
  }));

  return (
    <View style={styles.barWrapper}>
      <View style={[styles.barContainer, { height }]}>
        <Animated.View style={[styles.bar, { backgroundColor: color }, animatedBarStyle]} />
      </View>
      <Text style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: CHART_PADDING,
    paddingVertical: theme.spacing.scale[4],
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.scale[2],
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  barContainer: {
    width: MAX_BAR_WIDTH,
    maxWidth: 40,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    minHeight: 4,
    borderRadius: theme.radius.xs,
  },
  barLabel: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
});
