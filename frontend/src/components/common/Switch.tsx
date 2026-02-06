import React from "react";
import { View, StyleSheet } from "react-native";
import { Switch as PaperSwitch, Text } from "react-native-paper";

type Props = {
  label?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
};

export default function Switch({ label, value, onValueChange, disabled }: Props) {
  return (
    <View style={styles.row}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <PaperSwitch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { marginRight: 8 }
});
