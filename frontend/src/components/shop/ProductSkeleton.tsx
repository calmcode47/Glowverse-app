import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../theme/themeContext";

export default function ProductSkeleton() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.line} />
      <View style={[styles.line, { width: "60%" }]} />
      <View style={[styles.row, { marginTop: 8 }]}>
        <View style={[styles.badge, { width: 60 }]} />
        <View style={[styles.badge, { width: 40 }]} />
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      overflow: "hidden",
      padding: 12
    },
    image: {
      width: "100%",
      aspectRatio: 1,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 12,
      marginBottom: 12
    },
    line: {
      height: 12,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 8,
      marginBottom: 8
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between"
    },
    badge: {
      height: 12,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 8
    }
  });
}
