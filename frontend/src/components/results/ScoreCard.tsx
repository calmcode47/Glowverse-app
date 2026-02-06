import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";
import Animated, { useSharedValue, withTiming, useAnimatedProps } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  title: string;
  score: number;
  maxScore?: number;
  color?: string;
  icon?: string;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ScoreCard({ title, score, maxScore = 100, color, icon }: Props) {
  const theme = useTheme();
  const size = 80;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  React.useEffect(() => {
    const pct = Math.max(0, Math.min(1, score / maxScore));
    progress.value = withTiming(pct, { duration: 600 });
  }, [score, maxScore]);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value)
  }));
  const c = color || theme.colors.primary;

  return (
    <View style={[styles.card]}>
      <View style={styles.row}>
        {icon ? <MaterialCommunityIcons name={icon as any} size={18} color={c} /> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.graph}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.outline} strokeWidth={stroke} fill="none" />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={c}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps as any}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.score}>{Math.round(score)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  title: { marginLeft: 6 },
  graph: { position: "relative" },
  score: { position: "absolute", alignSelf: "center", top: 28 }
});
