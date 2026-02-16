import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../theme/themeContext";

export type DateRange = { start: Date; end: Date };
type Props = { value: DateRange; onChange: (range: DateRange) => void };

export default function DateRangePicker({ value, onChange }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 86400000);
    onChange({ start, end });
  };

  return (
    <View style={[styles.wrap, { borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated }]}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setOpenStart(true)}><Text style={{ color: theme.colors.text.primary }}>Start: {value.start.toISOString().slice(0,10)}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setOpenEnd(true)}><Text style={{ color: theme.colors.text.primary }}>End: {value.end.toISOString().slice(0,10)}</Text></TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setPreset(1)}><Text style={styles.preset}>Today</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setPreset(7)}><Text style={styles.preset}>Last 7 Days</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setPreset(30)}><Text style={styles.preset}>Last 30 Days</Text></TouchableOpacity>
      </View>
      {openStart ? (
        <DateTimePicker value={value.start} mode="date" display="default" onChange={(_, d) => { setOpenStart(false); if (d) onChange({ start: d, end: value.end }); }} />
      ) : null}
      {openEnd ? (
        <DateTimePicker value={value.end} mode="date" display="default" onChange={(_, d) => { setOpenEnd(false); if (d) onChange({ start: value.start, end: d }); }} />
      ) : null}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    wrap: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
    row: { flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "space-between" },
    preset: { color: "#93C5FD", fontWeight: "800" }
  });
}

