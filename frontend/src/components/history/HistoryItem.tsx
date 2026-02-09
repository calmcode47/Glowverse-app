import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Chip, useTheme } from "react-native-paper";

type Props = {
  title: string;
  subtitle?: string;
  date?: string;
  imageUri?: string;
  badge?: string;
  onPress?: () => void;
};

export default function HistoryItem({ title, subtitle, date, imageUri, badge, onPress }: Props) {
  const theme = useTheme();
  return (
    <TouchableOpacity style={[styles.container, { borderColor: theme.colors.onSurfaceVariant }]} onPress={onPress}>
      <View style={styles.left}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.thumb} /> : <View style={[styles.thumb, styles.placeholder]} />}
      </View>
      <View style={styles.body}>
        <Text variant="titleSmall">{title}</Text>
        {subtitle ? <Text variant="bodySmall">{subtitle}</Text> : null}
        {date ? <Text variant="bodySmall">{date}</Text> : null}
        {badge ? <Chip compact style={{ marginTop: 4 }}>{badge}</Chip> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", padding: 10, borderWidth: 1, borderRadius: 12, alignItems: "center", gap: 10 },
  left: { width: 64, height: 64 },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  placeholder: { backgroundColor: "#eee" },
  body: { flex: 1 }
});
