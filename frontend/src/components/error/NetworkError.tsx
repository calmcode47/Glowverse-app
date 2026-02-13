import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";

type Props = {
  onRetry: () => void;
};

export default function NetworkError({ onRetry }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="wifi-off" size={48} color={theme.colors.accent.blue} />
      <Text style={styles.title}>No internet connection</Text>
      <TouchableOpacity onPress={onRetry} style={styles.btn}>
        <Text style={styles.btnText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", gap: 8, padding: 16 },
    title: { color: theme.colors.text.primary, fontWeight: "800" },
    btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.colors.accent.emerald, marginTop: 6 },
    btnText: { color: theme.colors.text.inverse, fontWeight: "900" }
  });
}
