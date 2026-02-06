import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { Text, Chip, useTheme, Button } from "react-native-paper";
import EmptyState from "@components/common/EmptyState";

export type HistoryItemData = {
  uri: string;
  timestamp: string;
  type?: string;
};

type Props = {
  items: HistoryItemData[];
  onPress: (uri: string) => void;
  onDelete: (uri: string) => void;
};

export default function HistoryGrid({ items, onPress, onDelete }: Props) {
  const theme = useTheme();
  const [filter, setFilter] = React.useState<"all" | "analysis">("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const filtered = items.filter((i) => (filter === "all" ? true : (i.type || "analysis") === "analysis"));
  const paginated = filtered.slice(0, page * pageSize);

  const left: HistoryItemData[] = [];
  const right: HistoryItemData[] = [];
  paginated.forEach((it, idx) => ((idx % 2 === 0 ? left : right)).push(it));

  const confirmDelete = (uri: string) => {
    Alert.alert("Delete analysis", "Are you sure you want to delete this analysis?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(uri) }
    ]);
  };

  if (items.length === 0) {
    return <EmptyState iconName="image-off-outline" title="No history yet" description="Run an analysis to build your history." />;
  }

  return (
    <View>
      <View style={styles.filters}>
        <Chip selected={filter === "all"} onPress={() => setFilter("all")}>All</Chip>
        <Chip selected={filter === "analysis"} onPress={() => setFilter("analysis")}>Analysis</Chip>
      </View>
      <View style={styles.grid}>
        <View style={styles.col}>
          {left.map((it) => (
            <TouchableOpacity key={it.uri} onPress={() => onPress(it.uri)} onLongPress={() => confirmDelete(it.uri)}>
              <Image source={{ uri: it.uri }} style={styles.thumb} />
              <Text variant="bodySmall" style={styles.date}>{new Date(it.timestamp).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.col}>
          {right.map((it) => (
            <TouchableOpacity key={it.uri} onPress={() => onPress(it.uri)} onLongPress={() => confirmDelete(it.uri)}>
              <Image source={{ uri: it.uri }} style={styles.thumb} />
              <Text variant="bodySmall" style={styles.date}>{new Date(it.timestamp).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {paginated.length < filtered.length ? (
        <Button onPress={() => setPage((p) => p + 1)} style={{ marginTop: 8 }}>Load more</Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", marginBottom: 8 },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  col: { flex: 1, marginHorizontal: 4 },
  thumb: { width: "100%", height: 120, borderRadius: 8, marginBottom: 6 },
  date: { color: "#888", marginBottom: 8 }
});
