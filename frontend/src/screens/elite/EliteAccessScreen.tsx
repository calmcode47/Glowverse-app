import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EliteAccessScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="star-face" size={48} color={theme.colors.accent.gold} />
      <Text style={styles.title}>Elite Member Early Access</Text>
      <Text style={styles.subtitle}>Exclusive drops, early sales, and member-only labs.</Text>
      <TouchableOpacity style={styles.cta} onPress={() => Linking.openURL("https://www.ray-ban.com/")}>
        <Text style={styles.ctaText}>Explore Now</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary, alignItems: "center", justifyContent: "center", padding: 16, gap: 8 },
    title: { fontSize: 22, fontWeight: "800", color: theme.colors.text.primary },
    subtitle: { fontSize: 14, color: theme.colors.text.secondary, textAlign: "center" },
    cta: { marginTop: 12, backgroundColor: theme.colors.accent.emerald, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    ctaText: { color: theme.colors.text.inverse, fontWeight: "800" }
  });
}
