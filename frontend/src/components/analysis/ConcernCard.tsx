import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import type { SkinConcern } from "../../services/ai/types";

type Props = {
  item: SkinConcern;
  onLongPressShare?: (item: SkinConcern) => void;
};

function severityColor(sev: SkinConcern["severity"]) {
  switch (sev) {
    case "severe":
      return "#EF4444";
    case "moderate":
      return "#F59E0B";
    default:
      return "#10B981";
  }
}

function iconForType(t: SkinConcern["type"]) {
  const map: Record<string, string> = {
    acne: "blur",
    wrinkles: "gesture",
    fine_lines: "gesture-tap",
    dark_spots: "brightness-5",
    hyperpigmentation: "palette-swatch",
    redness: "brightness-2",
    irritation: "alert-circle-outline",
    large_pores: "blur-linear",
    texture: "texture",
    dryness: "water-off-outline",
    dehydration: "water-percent",
    dullness: "white-balance-sunny",
    uneven_tone: "invert-colors"
  };
  return (map[t] || "information-outline") as any;
}

export default function ConcernCard({ item, onLongPressShare }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [open, setOpen] = React.useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v: boolean) => !v);
  };
  return (
    <TouchableOpacity
      onPress={toggle}
      onLongPress={() => onLongPressShare?.(item)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${item.type} ${item.severity}`}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons name={iconForType(item.type)} color={theme.colors.text.primary} size={22} />
        <Text style={styles.title}>{formatConcernType(item.type)}</Text>
        <View style={[styles.badge, { backgroundColor: severityColor(item.severity) }]}>
          <Text style={styles.badgeText}>{item.severity.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>Confidence: {(item.confidence * 100).toFixed(0)}%</Text>
        <Text style={styles.metaText}>Areas: {item.affectedAreas.join(", ")}</Text>
      </View>
      {open && item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
    </TouchableOpacity>
  );
}

function formatConcernType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 14,
      padding: 12,
      gap: 8
    },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { color: theme.colors.text.primary, fontWeight: "900", flex: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    badgeText: { color: "#fff", fontWeight: "900", fontSize: 10, letterSpacing: 0.5 },
    meta: { flexDirection: "row", justifyContent: "space-between" },
    metaText: { color: theme.colors.text.secondary, fontSize: 12 },
    desc: { color: theme.colors.text.secondary, lineHeight: 18 }
  });
}
