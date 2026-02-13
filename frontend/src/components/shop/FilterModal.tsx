import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Filters } from "./FilterBar";
import FocusTrap from "../a11y/FocusTrap";
import { focusManagement } from "../../utils/focusManagement";

type Props = {
  visible: boolean;
  value: Filters;
  onChange: (v: Filters) => void;
  onClose: () => void;
  categories?: string[];
  brands?: string[];
};

export default function FilterModal({ visible, value, onChange, onClose, categories = [], brands = [] }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [draft, setDraft] = React.useState<Filters>(value);
  const firstRef = React.useRef<View>(null);
  React.useEffect(() => setDraft(value), [value, visible]);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <FocusTrap active={visible} returnFocus onEscape={onClose}>
        <View style={styles.sheet} accessible accessibilityLabel="Filter options" accessibilityRole="dialog">
          <Text style={styles.title}>Filters</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              ref={firstRef}
              value={draft.category || ""}
              onChangeText={(t) => setDraft({ ...draft, category: t || undefined })}
              placeholder="e.g. makeup"
              style={styles.input}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              value={draft.brand || ""}
              onChangeText={(t) => setDraft({ ...draft, brand: t || undefined })}
              placeholder="e.g. mac"
              style={styles.input}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Min Price</Text>
            <TextInput
              value={draft.minPrice?.toString() || ""}
              onChangeText={(t) => setDraft({ ...draft, minPrice: t ? Number(t) : undefined })}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Max Price</Text>
            <TextInput
              value={draft.maxPrice?.toString() || ""}
              onChangeText={(t) => setDraft({ ...draft, maxPrice: t ? Number(t) : undefined })}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sort By</Text>
            <TextInput
              value={draft.sortBy || ""}
              onChangeText={(t) => setDraft({ ...draft, sortBy: (t || undefined) as any })}
              placeholder="price_asc | price_desc | rating | newest"
              style={styles.input}
            />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.secondary} accessibilityLabel="Cancel filters" accessibilityRole="button">
              <Text style={styles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onChange(draft);
                onClose();
              }}
              style={styles.primary}
              accessibilityLabel="Apply filters"
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
        </FocusTrap>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "#00000088",
      justifyContent: "flex-end"
    },
    sheet: {
      backgroundColor: theme.colors.background.elevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text.primary,
      marginBottom: 12
    },
    row: {
      marginBottom: 10
    },
    label: {
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: 6
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: theme.colors.text.primary
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 8
    },
    secondary: {
      paddingHorizontal: 14,
      paddingVertical: 10
    },
    secondaryText: {
      color: theme.colors.text.primary,
      fontWeight: "600"
    },
    primary: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.colors.accent.emerald,
      borderRadius: 10
    },
    primaryText: {
      color: theme.colors.text.inverse,
      fontWeight: "700"
    }
  });
}
