import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";

type Props = {
  onRetry: () => void;
  attempt?: number;
};

export default function ServerError({ onRetry, attempt = 0 }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="server" size={48} color={theme.colors.accent.rose} />
      <Text style={styles.title}>Server error occurred</Text>
      <Text style={styles.subtitle}>We're working on it</Text>
      <TouchableOpacity onPress={onRetry} style={styles.btn}>
        <Text style={styles.btnText}>Retry{attempt ? ` (${attempt})` : ""}</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", gap: 6, padding: 16 },
    title: { color: theme.colors.text.primary, fontWeight: "800" },
    subtitle: { color: theme.colors.text.secondary },
    btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.colors.accent.emerald, marginTop: 6 },
    btnText: { color: theme.colors.text.inverse, fontWeight: "900" }
  });
}
