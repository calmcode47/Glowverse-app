import React from "react";
import { View, Text, StyleSheet, SectionList } from "react-native";
import type { ActivityItem } from "../../services/history/types";
import ActivityCard from "./ActivityCard";
import { useTheme } from "../../theme/themeContext";

type Props = {
  items: ActivityItem[];
  onPress?: (item: ActivityItem) => void;
  groupBy?: 'date' | 'week' | 'month';
};

function groupItems(items: ActivityItem[], mode: 'date' | 'week' | 'month') {
  const map = new Map<string, ActivityItem[]>();
  items.forEach(i => {
    const d = new Date(i.timestamp);
    let key = d.toDateString();
    if (mode === 'week') {
      const first = new Date(d);
      first.setDate(d.getDate() - d.getDay());
      key = `${first.toDateString()} week`;
    }
    if (mode === 'month') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    const arr = map.get(key) || [];
    arr.push(i);
    map.set(key, arr);
  });
  const sections = Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  sections.sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime());
  return sections;
}

export default function Timeline({ items, onPress, groupBy = 'date' }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const sections = React.useMemo(() => groupItems(items, groupBy), [items, groupBy]);
  return (
    <SectionList
      sections={sections}
      keyExtractor={(item: ActivityItem) => item.id}
      renderSectionHeader={({ section }: { section: { title: string } }) => <Text style={styles.header}>{section.title}</Text>}
      renderItem={({ item }: { item: ActivityItem }) => <ActivityCard item={item} onPress={onPress} />}
      contentContainerStyle={{ gap: 8 }}
      stickySectionHeadersEnabled={false}
    />
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    header: { color: theme.colors.text.secondary, marginTop: 12, marginBottom: 4, fontWeight: "800" }
  });
}
