import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Analysis } from "../../services/api/analysis.api";
import ProgressChart from "./ProgressChart";

type Props = {
  items: Analysis[];
  onPress: (id: string) => void;
};

export default function AnalysisTimeline({ items, onPress }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={{ gap: 12 }}>
      {items.map((a, idx) => {
        const date = new Date(a.createdAt);
        const score = (a as any).results?.skinScore ?? Math.round(60 + (idx % 5) * 5);
        return (
          <TouchableOpacity key={a.id} onPress={() => onPress(a.id)} style={styles.item}>
            {a.processedImageUrl || a.originalImageUrl ? (
              <Image source={{ uri: a.processedImageUrl || a.originalImageUrl }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, { backgroundColor: theme.colors.background.secondary }]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.date}>{date.toLocaleDateString()}</Text>
              <Text style={styles.score}>Score: {score}</Text>
              <ProgressChart data={[score - 10, score - 5, score]} width={140} height={32} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    item: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 10 },
    thumb: { width: 48, height: 48, borderRadius: 10 },
    date: { color: theme.colors.text.primary, fontWeight: "800" },
    score: { color: theme.colors.text.secondary, marginBottom: 4 }
  });
}
