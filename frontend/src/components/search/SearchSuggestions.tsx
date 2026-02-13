import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = {
  query: string;
  suggestions: string[];
  onSelect: (text: string) => void;
};

export default function SearchSuggestions({ query, suggestions, onSelect }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const q = query.trim().toLowerCase();
  const render = ({ item }: { item: string }) => {
    const idx = item.toLowerCase().indexOf(q);
    if (q.length === 0 || idx < 0) {
      return (
        <TouchableOpacity onPress={() => onSelect(item)} style={styles.row}>
          <Text style={styles.text}>{item}</Text>
        </TouchableOpacity>
      );
    }
    const pre = item.slice(0, idx);
    const mid = item.slice(idx, idx + q.length);
    const post = item.slice(idx + q.length);
    return (
      <TouchableOpacity onPress={() => onSelect(item)} style={styles.row}>
        <Text style={styles.text}>
          <Text style={styles.dim}>{pre}</Text>
          <Text style={styles.highlight}>{mid}</Text>
          <Text style={styles.dim}>{post}</Text>
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <FlatList data={suggestions.slice(0, 8)} keyExtractor={(i) => i} renderItem={render} />
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, overflow: "hidden" },
    row: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border.light },
    text: { color: theme.colors.text.primary },
    dim: { color: theme.colors.text.secondary },
    highlight: { color: theme.colors.accent.emerald, fontWeight: "800" }
  });
}
