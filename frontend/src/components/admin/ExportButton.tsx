import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";

export default function ExportButton({ onPress }: { onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
      <MaterialCommunityIcons name="download" size={22} color={theme.colors.text.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { position: "absolute", right: 20, bottom: 24, borderRadius: 24, width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1 }
});
