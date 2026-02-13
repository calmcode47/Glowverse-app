import React from "react";
import { View, StyleSheet } from "react-native";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.item}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: { width: "48%" }
});
