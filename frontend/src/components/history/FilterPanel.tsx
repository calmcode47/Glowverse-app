import React from "react";
import { View, StyleSheet } from "react-native";
import { Chip, Button, useTheme } from "react-native-paper";
import type { HistoryTab } from "../../services/history/types";

type Filters = {
  dateRange?: 'last7days' | 'last30days' | 'last90days' | 'all';
  types?: HistoryTab[];
  sortBy?: 'date_desc' | 'date_asc';
};

type Props = {
  value: Filters;
  onChange: (f: Filters) => void;
};

export default function FilterPanel({ value, onChange }: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const toggleType = (t: HistoryTab) => {
    const set = new Set(value.types || []);
    if (set.has(t)) set.delete(t); else set.add(t);
    onChange({ ...value, types: Array.from(set) });
  };
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {(['last7days', 'last30days', 'last90days', 'all'] as const).map(r => (
          <Chip key={r} selected={value.dateRange === r} onPress={() => onChange({ ...value, dateRange: r })}>{r}</Chip>
        ))}
      </View>
      <View style={styles.row}>
        {(['analysis', 'fitness', 'tryons', 'orders'] as HistoryTab[]).map(t => (
          <Chip key={t} selected={(value.types || []).includes(t)} onPress={() => toggleType(t)}>{t}</Chip>
        ))}
      </View>
      <View style={styles.row}>
        <Chip selected={value.sortBy === 'date_desc'} onPress={() => onChange({ ...value, sortBy: 'date_desc' })}>Newest</Chip>
        <Chip selected={value.sortBy === 'date_asc'} onPress={() => onChange({ ...value, sortBy: 'date_asc' })}>Oldest</Chip>
        <Button mode="text" onPress={() => onChange({ dateRange: 'all', types: [], sortBy: 'date_desc' })}>Reset</Button>
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { gap: 8 },
    row: { flexDirection: "row", gap: 8, flexWrap: "wrap" }
  });
}

