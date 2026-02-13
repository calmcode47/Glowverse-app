import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../theme/themeContext";
import * as ProductsAPI from "../../services/api/products.api";

type Props = { onSelect: (q: string) => void };

export default function PopularSearches({ onSelect }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [items, setItems] = React.useState<string[]>([]);
  React.useEffect(() => {
    (async () => {
      const list = await ProductsAPI.getPopularSearches();
      setItems(list.slice(0, 10));
    })();
  }, []);
  if (items.length === 0) return null as any;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trending Searches</Text>
      <View style={styles.list}>
        {items.map((q) => (
          <TouchableOpacity key={q} onPress={() => onSelect(q)} style={styles.chip}>
            <Text style={styles.chipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { gap: 8 },
    title: { color: theme.colors.text.primary, fontWeight: "800" },
    list: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated },
    chipText: { color: theme.colors.text.primary }
  });
}
