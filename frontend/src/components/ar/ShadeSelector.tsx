import React from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = {
  shades: string[];
  value?: string;
  onChange: (hex: string) => void;
};

export default function ShadeSelector({ shades, value, onChange }: Props) {
  const { theme } = useTheme();
  const styles = createStyles();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {shades.map((c) => {
        const selected = value?.toLowerCase() === c.toLowerCase();
        return (
          <TouchableOpacity
            key={c}
            onPress={() => onChange(c)}
            style={[
              styles.swatch,
              { backgroundColor: c },
              selected && { borderWidth: 2, borderColor: theme.colors.accent.emerald }
            ]}
            accessibilityLabel={`Shade ${c}`}
          />
        );
      })}
    </ScrollView>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: { paddingHorizontal: 8, gap: 10, alignItems: "center" },
    swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "#ffffff55" }
  });
}
