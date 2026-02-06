import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, { useSharedValue, withTiming, useAnimatedProps } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  icon: string;
  label: string;
  value: number;
  color?: string;
  onPress?: () => void;
};

const AnimatedText = Animated.createAnimatedComponent((Text as unknown) as React.ComponentType<any>);

export default function StatsCard({ icon, label, value, color, onPress }: Props) {
  const theme = useTheme();
  const animated = useSharedValue(0);
  React.useEffect(() => {
    animated.value = withTiming(value, { duration: 600 });
  }, [value]);
  const animatedProps = useAnimatedProps(() => ({}));
  const c = color || theme.colors.primary;
  return (
    <View style={[styles.card]}>
      <View style={styles.row}>
        <MaterialCommunityIcons name={icon as any} size={18} color={c} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <AnimatedText animatedProps={animatedProps} style={[styles.value, { color: c }]} onPress={onPress as any}>
        {Math.round(value)}
      </AnimatedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, alignItems: "center", minWidth: 100 },
  row: { flexDirection: "row", alignItems: "center" },
  label: { marginLeft: 6 },
  value: { marginTop: 8, fontSize: 24, fontWeight: "600" }
});
