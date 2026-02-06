import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Text, useTheme } from "react-native-paper";

type Props = {
  value: string;
  onChange: (c: string) => void;
  presets?: string[];
};

const defaultPresets = ["#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#009688", "#4CAF50", "#FF9800", "#795548", "#000000", "#FFFFFF"];

export default function ColorPicker({ value, onChange, presets = defaultPresets }: Props) {
  const theme = useTheme();
  return (
    <View>
      <View style={styles.row}>
        {presets.map((c) => (
          <TouchableOpacity key={c} onPress={() => onChange(c)} accessibilityLabel={c}>
            <View style={[styles.swatch, { backgroundColor: c }, value.toLowerCase() === c.toLowerCase() ? styles.selected : null]} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.inputRow}>
        <View style={[styles.preview, { backgroundColor: value }]} />
        <TextInput value={value} onChangeText={onChange} placeholder="#RRGGBB" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  swatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "#eee" },
  selected: { borderColor: "#6C5CE7", borderWidth: 2 },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  preview: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: "#eee" }
});
