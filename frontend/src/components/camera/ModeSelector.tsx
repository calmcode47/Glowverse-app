import React from "react";
import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type CameraMode = "skin" | "makeup" | "hair" | "shape";

type Props = {
  value: CameraMode;
  onChange: (m: CameraMode) => void;
};

const items: { key: CameraMode; label: string; icon: string }[] = [
  { key: "skin", label: "Skin Analysis", icon: "face-man-shimmer" },
  { key: "makeup", label: "Makeup Try-On", icon: "lipstick" },
  { key: "hair", label: "Hair Color", icon: "hair-dryer" },
  { key: "shape", label: "Face Shape", icon: "account-circle-outline" }
];

export default function ModeSelector({ value, onChange }: Props) {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {items.map((it) => {
        const active = it.key === value;
        return (
          <TouchableOpacity
            key={it.key}
            style={[
              styles.item,
              {
                backgroundColor: active ? theme.colors.primary : "transparent",
                borderColor: active ? theme.colors.primary : theme.colors.outline
              }
            ]}
            onPress={() => onChange(it.key)}
            accessibilityLabel={it.label}
            accessibilityState={active ? { selected: true } : {}}
          >
            <MaterialCommunityIcons
              name={it.icon as any}
              size={18}
              color={active ? theme.colors.onPrimary : theme.colors.outline}
            />
            <Text style={{ marginLeft: 6, color: active ? theme.colors.onPrimary : theme.colors.outline }}>
              {it.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12 },
  item: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: 6 }
});
