import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../../theme/themeContext";

export default function TipsDetailScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const title = route.params?.title || "Tip";
  const body = route.params?.body || "Details coming soon.";
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </ScrollView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    title: { fontSize: 20, fontWeight: "800", color: theme.colors.text.primary, marginBottom: 10 },
    body: { fontSize: 14, color: theme.colors.text.secondary, lineHeight: 20 }
  });
}
