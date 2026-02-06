import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Variant = "no_data" | "error" | "no_results";

type Props = {
  iconName?: string;
  title: string;
  description?: string;
  ctaText?: string;
  onPressCTA?: () => void;
  variant?: Variant;
};

export default function EmptyState({ iconName = "information-outline", title, description, ctaText, onPressCTA, variant = "no_data" }: Props) {
  const theme = useTheme();
  const color =
    variant === "error"
      ? theme.colors.error
      : variant === "no_results"
      ? theme.colors.secondary
      : theme.colors.primary;
  return (
    <View style={styles.container} accessibilityLabel="Empty state">
      <MaterialCommunityIcons name={iconName as any} size={48} color={color} />
      <Text variant="titleLarge" style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {ctaText ? <Button mode="contained" onPress={onPressCTA}>{ctaText}</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { marginTop: 12, marginBottom: 8 },
  desc: { marginBottom: 16, textAlign: "center" }
});
