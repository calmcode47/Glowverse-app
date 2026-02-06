import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Chip, Searchbar, useTheme } from "react-native-paper";
import BottomSheet from "@components/common/BottomSheet";
import ProductItem, { ARProduct } from "./ProductItem";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
  products: ARProduct[];
  onTryOn: (p: ARProduct) => void;
  onSelectColor: (c: string) => void;
};

export default function MakeupDrawer({
  visible,
  onDismiss,
  categories,
  selectedCategory,
  onSelectCategory,
  products,
  onTryOn,
  onSelectColor
}: Props) {
  const theme = useTheme();
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      const inCat = selectedCategory ? (p.name.toLowerCase().includes(selectedCategory.toLowerCase()) || (p.brand || "").toLowerCase().includes(selectedCategory.toLowerCase())) : true;
      const matches = query ? (p.name.toLowerCase().includes(query.toLowerCase()) || (p.brand || "").toLowerCase().includes(query.toLowerCase())) : true;
      return inCat && matches;
    });
  }, [products, selectedCategory, query]);

  if (!visible) return null;
  return (
    <BottomSheet visible={visible} onDismiss={onDismiss} snapPoints={[360, 480]}>
      <View style={styles.container}>
        <View style={styles.row}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((c) => (
              <Chip key={c} selected={selectedCategory === c} onPress={() => onSelectCategory(c)} style={{ marginRight: 6 }}>
                {c}
              </Chip>
            ))}
          </ScrollView>
        </View>
        <Searchbar placeholder="Search products" value={query} onChangeText={setQuery} style={{ marginVertical: 8 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {filtered.map((p) => (
            <ProductItem key={p.id} product={p} onTryOn={onTryOn} onSelectColor={onSelectColor} />
          ))}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  row: { flexDirection: "row", alignItems: "center" }
});
