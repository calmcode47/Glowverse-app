import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  enabled: boolean;
  onToggle: () => void;
};

export default function CompareControl({ enabled, onToggle }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggle} style={[styles.button, enabled && styles.buttonActive]}>
        <MaterialCommunityIcons name={enabled ? "eye-off-outline" : "eye-outline"} size={18} color={enabled ? theme.colors.text.inverse : theme.colors.text.primary} />
        <Text style={[styles.text, enabled && styles.textActive]}>{enabled ? "Compare: ON" : "Compare: OFF"}</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Swipe vertically to reveal before/after</Text>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { alignItems: "center", gap: 6 },
    button: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border?.light || "#ffffff33" },
    buttonActive: { backgroundColor: theme.colors.accent.emerald },
    text: { color: theme.colors.text.primary, fontWeight: "700" },
    textActive: { color: theme.colors.text.inverse },
    hint: { color: theme.colors.text.tertiary, fontSize: 12 }
  });
}
