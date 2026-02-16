import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useTheme } from "../../theme/themeContext";
import type { AppNotification } from "../../services/api/notifications.api";

type Props = {
  item: AppNotification;
  onPress: () => void;
  onDelete: () => void;
};

export default function NotificationCard({ item, onPress, onDelete }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const icon = iconFor(item.type);
  const color = colorFor(item.type, theme);
  const Left = () => (
    <View style={[styles.read, { borderColor: theme.colors.border.light }]}>
      <MaterialCommunityIcons name={item.read ? "email-open-outline" : "email-check-outline"} size={22} color={theme.colors.accent.emerald} />
    </View>
  );
  const Right = () => (
    <View style={[styles.delete, { borderColor: theme.colors.border.light }]}>
      <MaterialCommunityIcons name="delete-outline" size={22} color={theme.colors.error} />
    </View>
  );
  return (
    <Swipeable renderRightActions={Right} renderLeftActions={Left} onSwipeableLeftOpen={onPress} onSwipeableRightOpen={onDelete}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.card, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.message}`}
        accessibilityHint="Opens related content and marks as read"
      >
        <View style={[styles.iconWrap, { backgroundColor: color + "15" }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.time, { color: theme.colors.text.tertiary }]}>{timeAgo(item.createdAt)}</Text>
            {!item.read ? <View style={[styles.dot, { backgroundColor: theme.colors.accent.blue }]} /> : null}
          </View>
          <Text style={[styles.msg, { color: theme.colors.text.secondary }]} numberOfLines={3}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

function iconFor(t: AppNotification["type"]): any {
  switch (t) {
    case "order":
      return "truck-delivery-outline";
    case "promo":
      return "tag-outline";
    case "product":
      return "package-variant-closed";
    case "system":
      return "cellphone-arrow-down";
    default:
      return "bell-outline";
  }
}
function colorFor(t: AppNotification["type"], theme: any): string {
  switch (t) {
    case "order":
      return theme.colors.accent.emerald;
    case "promo":
      return "#F59E0B";
    case "product":
      return "#EC4899";
    case "system":
      return "#8B5CF6";
    default:
      return theme.colors.accent.blue;
  }
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { flexDirection: "row", padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 12, marginBottom: 10 },
    iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    row: { flexDirection: "row", alignItems: "center" },
    title: { fontWeight: "800", flex: 1 },
    time: { marginLeft: 8, fontSize: 12 },
    dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 6 },
    msg: { marginTop: 4 },
    delete: { width: 56, alignItems: "center", justifyContent: "center", borderLeftWidth: 1 },
    read: { width: 56, alignItems: "center", justifyContent: "center", borderRightWidth: 1 }
  });
}
