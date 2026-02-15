import React from "react";
import { FlatList, ViewStyle } from "react-native";
import type { ActivityItem } from "../../services/history/types";
import ActivityCard from "./ActivityCard";

type Props = {
  items: ActivityItem[];
  columns?: number;
  contentContainerStyle?: ViewStyle | ViewStyle[];
};

export default function GridView({ items, columns = 2, contentContainerStyle }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i: ActivityItem) => i.id}
      numColumns={columns}
      renderItem={({ item }: { item: ActivityItem }) => <ActivityCard item={item} />}
      contentContainerStyle={contentContainerStyle as any}
      columnWrapperStyle={{ gap: 10 }}
    />
  );
}
