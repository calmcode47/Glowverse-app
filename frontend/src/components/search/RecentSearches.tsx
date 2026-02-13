import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../theme/themeContext";

const KEY = "recent-searches";

type Props = {
  onSelect: (q: string) => void;
};

export default function RecentSearches({ onSelect }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [items, setItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    })();
  }, []);

  const clearAll = async () => {
    setItems([]);
    await AsyncStorage.setItem(KEY, JSON.stringify([]));
  };
  const remove = async (q: string) => {
    const next = items.filter((i) => i !== q);
    setItems(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  if (items.length === 0) return null as any;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <TouchableOpacity onPress={clearAll}><Text style={styles.clear}>Clear All</Text></TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity onPress={() => onSelect(item)}><Text style={styles.text}>{item}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item)}><Text style={styles.remove}>✕</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12, gap: 8 },
    header: { flexDirection: "row", justifyContent: "space-between" },
    title: { color: theme.colors.text.primary, fontWeight: "800" },
    clear: { color: theme.colors.accent.emerald, fontWeight: "800" },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border.light },
    text: { color: theme.colors.text.primary },
    remove: { color: theme.colors.text.secondary }
  });
}
