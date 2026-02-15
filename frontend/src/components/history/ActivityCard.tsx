import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ActivityItem } from "../../services/history/types";
import { useTheme } from "../../theme/themeContext";

type Props = {
  item: ActivityItem;
  onPress?: (item: ActivityItem) => void;
};

function iconForType(t: ActivityItem["type"]) {
  switch (t) {
    case "analysis": return "face-recognition";
    case "fitness": return "run";
    case "tryon": return "sparkles";
    case "order": return "cart";
    default: return "history";
  }
}

export default function ActivityCard({ item, onPress }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity onPress={() => onPress?.(item)} style={styles.card} accessibilityRole="button" accessibilityLabel={item.title}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <MaterialCommunityIcons name={iconForType(item.type) as any} size={20} color="#fff" />
        </View>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
      </View>
      <View style={styles.body}>
        {item.thumbnailUrl ? <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} /> : null}
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 10, gap: 8 },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    icon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.accent.emerald },
    title: { flex: 1, color: theme.colors.text.primary, fontWeight: "800" },
    date: { color: theme.colors.text.secondary },
    body: { flexDirection: "row", gap: 10, alignItems: "center" },
    thumb: { width: 56, height: 56, borderRadius: 8 },
    desc: { flex: 1, color: theme.colors.text.secondary }
  });
}
