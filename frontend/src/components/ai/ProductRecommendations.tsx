import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import type { ProductRecommendation } from "../../services/ai/types";
import RecommendationCard from "../../components/analysis/RecommendationCard";

type Props = {
  recommendations: ProductRecommendation[];
};

/**
 * ProductRecommendations renders a list of AI-recommended products
 * sorted by priority with quick "Add" and "View" actions.
 */
export default function ProductRecommendations({ recommendations }: Props) {
  const data = [...recommendations].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <RecommendationCard
            product={{ id: item.productId, name: item.name, image: item.imageUrl as any, price: item.price } as any}
            reason={item.reason}
          />
        )}
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" }
});
