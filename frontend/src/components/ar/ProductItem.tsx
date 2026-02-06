import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button, IconButton, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ARProduct = {
  id: string;
  image: string;
  name: string;
  brand?: string;
  price?: string;
  colors?: string[];
};

type Props = {
  product: ARProduct;
  onTryOn?: (p: ARProduct) => void;
  onSelectColor?: (color: string) => void;
};

export default function ProductItem({ product, onTryOn, onSelectColor }: Props) {
  const theme = useTheme();
  const [fav, setFav] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      const f = await AsyncStorage.getItem("favoriteProducts");
      const arr = f ? (JSON.parse(f) as string[]) : [];
      setFav(arr.includes(product.id));
    })();
  }, [product.id]);

  const toggleFav = async () => {
    const f = await AsyncStorage.getItem("favoriteProducts");
    const arr = f ? (JSON.parse(f) as string[]) : [];
    const next = fav ? arr.filter((x) => x !== product.id) : [...arr, product.id];
    await AsyncStorage.setItem("favoriteProducts", JSON.stringify(next));
    setFav(!fav);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.info}>
        <Text variant="labelLarge">{product.name}</Text>
        {product.brand ? <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{product.brand}</Text> : null}
        {product.price ? <Text variant="bodyMedium">{product.price}</Text> : null}
      </View>
      <View style={styles.colors}>
        {(product.colors || []).slice(0, 6).map((c) => (
          <TouchableOpacity key={c} onPress={() => onSelectColor?.(c)} accessibilityLabel={c}>
            <View style={[styles.swatch, { backgroundColor: c }]} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.actions}>
        <Button mode="contained" onPress={() => onTryOn?.(product)}>Try On</Button>
        <IconButton icon={fav ? "heart" : "heart-outline"} onPress={toggleFav} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 240, borderRadius: 12, padding: 10, marginRight: 12 },
  image: { width: "100%", height: 120, borderRadius: 8 },
  info: { marginTop: 8 },
  colors: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  swatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: "#eee" },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }
});
