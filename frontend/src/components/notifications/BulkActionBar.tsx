import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = {
  selectedCount: number;
  totalCount: number;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
  onCancelSelection: () => void;
};

export default function BulkActionBar({ selectedCount, totalCount, onMarkAllRead, onDeleteAll, onCancelSelection }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
      <Text style={[styles.count, { color: theme.colors.text.primary }]}>{selectedCount}/{totalCount} selected</Text>
      <TouchableOpacity onPress={onMarkAllRead} style={styles.btn}><Text style={[styles.btnText, { color: theme.colors.accent.emerald }]}>Mark read</Text></TouchableOpacity>
      <TouchableOpacity onPress={onDeleteAll} style={styles.btn}><Text style={[styles.btnText, { color: theme.colors.error }]}>Delete</Text></TouchableOpacity>
      <TouchableOpacity onPress={onCancelSelection} style={styles.btn}><Text style={[styles.btnText, { color: theme.colors.text.secondary }]}>Cancel</Text></TouchableOpacity>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1 },
    count: { fontWeight: "800" },
    btn: { padding: 8 },
    btnText: { fontWeight: "800" }
  });
}

