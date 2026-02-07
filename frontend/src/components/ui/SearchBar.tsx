import React from "react";
import { View, TextInput, StyleSheet, TextInputProps, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";

type SearchBarProps = TextInputProps & {
  containerStyle?: object;
};

export default function SearchBar({ containerStyle, ...inputProps }: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color={theme.colors.text.muted}
        style={styles.icon}
      />
      <TextInput
        placeholder="Search..."
        placeholderTextColor={theme.colors.text.muted}
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.scale[4],
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.inverse,
    paddingVertical: 0,
    ...(Platform.OS === "android" ? { paddingVertical: 4 } : {}),
  },
});
