import React from "react";
import { StyleSheet } from "react-native";
import { Button as PaperButton, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Variant = "primary" | "secondary" | "outline" | "text";
type Size = "small" | "medium" | "large";

type Props = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  iconName?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  fullWidth?: boolean;
};

export default function Button({
  variant = "primary",
  size = "medium",
  loading,
  disabled,
  iconName,
  icon,
  onPress,
  children,
  accessibilityLabel,
  fullWidth
}: Props) {
  const theme = useTheme();

  const mode =
    variant === "primary"
      ? "contained"
      : variant === "secondary"
      ? "contained-tonal"
      : variant === "outline"
      ? "outlined"
      : "text";

  const contentStyle =
    size === "small"
      ? styles.small
      : size === "large"
      ? styles.large
      : styles.medium;

  const iconNode =
    icon ??
    (iconName ? <MaterialCommunityIcons name={iconName as any} size={18} color={theme.colors.onPrimary} /> : undefined);

  return (
    <PaperButton
      mode={mode as any}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={iconNode as any}
      contentStyle={contentStyle}
      style={[fullWidth ? styles.fullWidth : undefined]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  small: { height: 36 },
  medium: { height: 44 },
  large: { height: 52 },
  fullWidth: { alignSelf: "stretch" }
});
