import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = {
  label: string;
  onClear?: () => void;
};

export default function FilterChip({ label, onClear }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity onPress={onClear} style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      marginRight: 8
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: 12,
      fontWeight: "600"
    }
  });
}
