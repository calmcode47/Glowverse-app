import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button, IconButton, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  image: string;
  name: string;
  brand?: string;
  price?: string;
  rating?: number;
  onTryOn?: () => void;
  onDetails?: () => void;
  onFavorite?: () => void;
};

export default function ProductCard({ image, name, brand, price, rating, onTryOn, onDetails, onFavorite }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text variant="labelLarge">{name}</Text>
        {brand ? <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{brand}</Text> : null}
        {price ? <Text variant="bodyMedium">{price}</Text> : null}
        {typeof rating === "number" ? (
          <View style={styles.rating}>
            {Array.from({ length: 5 }).map((_, i) => (
              <MaterialCommunityIcons key={i} name={i < Math.round(rating) ? "star" : "star-outline"} color={theme.colors.secondary} size={16} />
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Button onPress={onTryOn} mode="contained">Try On</Button>
        <Button onPress={onDetails} mode="outlined">View Details</Button>
        <IconButton icon="heart-outline" onPress={onFavorite} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 220, borderRadius: 12, padding: 10, marginRight: 12 },
  image: { width: "100%", height: 120, borderRadius: 8 },
  info: { marginTop: 8 },
  rating: { flexDirection: "row", marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }
});
