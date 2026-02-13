import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import type { TryOn } from "../../services/api/tryon.api";

type Props = {
  item: TryOn;
  onPress: () => void;
  onFavorite?: () => void;
};

export default function TryOnCard({ item, onPress, onFavorite }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const date = new Date(item.createdAt);
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {item.resultImageUrl ? (
        <Image source={{ uri: item.resultImageUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: theme.colors.background.secondary }]} />
      )}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{item.productName || item.productId || "Makeup Try-On"}</Text>
          <Text style={styles.date}>{date.toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity onPress={onFavorite} style={styles.fav}>
          <MaterialCommunityIcons name="star-outline" size={18} color={theme.colors.accent.gold} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { width: "48%", marginBottom: 12 },
    thumb: { width: "100%", aspectRatio: 1, borderRadius: 12, marginBottom: 6 },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    name: { color: theme.colors.text.primary, fontWeight: "700" },
    date: { color: theme.colors.text.tertiary, fontSize: 12, marginTop: 2 },
    fav: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background.elevated, borderWidth: 1, borderColor: theme.colors.border.light }
  });
}
