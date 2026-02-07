import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { theme } from "@constants/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type CarouselCardProps = {
  title: string;
  body?: string;
  onPrev?: () => void;
  onNext?: () => void;
  dark?: boolean;
};

export default function CarouselCard({
  title,
  body,
  onPrev,
  onNext,
  dark = false,
}: CarouselCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg = dark ? theme.colors.surfaceDark : theme.colors.surface;
  const textColor = dark ? theme.colors.text.inverse : theme.colors.text.primary;
  const mutedColor = dark ? theme.colors.text.muted : theme.colors.text.secondary;

  return (
    <Animated.View style={[styles.card, { backgroundColor: bg, borderColor: theme.colors.borderOrange }, animatedStyle]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <View style={styles.arrows}>
          <TouchableOpacity onPress={onPrev} style={styles.arrowBtn}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={theme.colors.orange}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={styles.arrowBtn}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.orange}
            />
          </TouchableOpacity>
        </View>
      </View>
      {body ? (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={[styles.bodyText, { color: mutedColor }]}>{body}</Text>
        </ScrollView>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.scale[4],
    minHeight: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: "700",
  },
  arrows: {
    flexDirection: "row",
  },
  arrowBtn: {
    padding: 4,
  },
  body: {
    maxHeight: 60,
    marginTop: 8,
  },
  bodyText: {
    fontSize: theme.typography.fontSizes.sm,
  },
});
