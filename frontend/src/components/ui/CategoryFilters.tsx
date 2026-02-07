import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import PillButton from "./PillButton";
import { shopCategories } from "@constants/mockData";

type CategoryFiltersProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function CategoryFilters({ selectedId, onSelect }: CategoryFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {shopCategories.map((cat) => (
        <PillButton
          key={cat.id}
          label={cat.label}
          selected={selectedId === cat.id}
          onPress={() => onSelect(cat.id)}
          style={styles.pill}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  pill: {
    marginRight: 12,
  },
});
