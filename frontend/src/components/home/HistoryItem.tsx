import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text, IconButton, useTheme } from "react-native-paper";
import { Share } from "react-native";

type Props = {
  thumbnail: string;
  type: string;
  date: string;
  onPress?: () => void;
  onDelete?: () => void;
};

export default function HistoryItem({ thumbnail, type, date, onPress, onDelete }: Props) {
  const theme = useTheme();
  const share = async () => {
    await Share.share({ message: thumbnail, url: thumbnail });
  };
  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel={`${type} ${date}`}>
      <View style={[styles.item, { backgroundColor: theme.colors.surface }]}>
        <Image source={{ uri: thumbnail }} style={styles.thumb} />
        <View style={styles.info}>
          <Text variant="labelMedium">{type}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{date}</Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="share-variant" onPress={share} />
          <IconButton icon="delete" onPress={onDelete} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: { width: 220, borderRadius: 12, padding: 8, marginRight: 12, flexDirection: "row", alignItems: "center" },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  info: { flex: 1, marginHorizontal: 8 },
  actions: { flexDirection: "row" }
});
