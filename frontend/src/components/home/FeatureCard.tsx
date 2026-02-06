import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Badge, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  icon: string;
  title: string;
  description?: string;
  onPress?: () => void;
  badge?: "New" | string;
  gradient?: boolean;
};

export default function FeatureCard({ icon, title, description, onPress, badge, gradient }: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const content = (
    <Animated.View style={[styles.card, style, { borderColor: theme.colors.outline }]}>
      <View style={styles.row}>
        <MaterialCommunityIcons name={icon as any} size={24} color={theme.colors.primary} />
        {badge ? <Badge style={styles.badge}>{badge}</Badge> : null}
      </View>
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {description ? <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{description}</Text> : null}
    </Animated.View>
  );
  return (
    <TouchableOpacity
      onPress={() => {
        scale.value = withTiming(0.96, { duration: 80 }, () => {
          scale.value = withTiming(1, { duration: 80 });
        });
        onPress?.();
      }}
      accessibilityLabel={title}
    >
      {gradient ? (
        <LinearGradient colors={["#6C5CE733", "#00B89433"]} style={styles.gradient}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: { borderRadius: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, minWidth: 160 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { marginLeft: 8 },
  title: { marginTop: 8, marginBottom: 4 }
});
