import React from "react";
import { Modal, View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import type { ConflictResolution, SyncConflict } from "../../types/conflicts";

type Props = {
  conflict: SyncConflict;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
};

export default function ValidationErrorModal({ conflict, onResolve, onCancel }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [editedData, setEditedData] = React.useState<any>(conflict.localState || {});
  const errors: Array<{ field: string; message: string }> = conflict?.error?.details?.validationErrors || [];
  const isAddress = conflict.resource === "address";

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityRole="header" accessibilityLabel="Validation error">
          <View style={styles.header}>
            <MaterialCommunityIcons name="alert-circle" size={40} color={theme.colors.warning} />
            <Text style={styles.title}>Validation Error</Text>
          </View>
          <ScrollView style={{ maxHeight: "70%" }} contentContainerStyle={{ paddingBottom: 8 }}>
            <Text style={styles.description}>The following issues were found with your {conflict.resource}:</Text>
            <View style={styles.errorList}>
              {errors.map((e, i) => (
                <View key={`${e.field}-${i}`} style={styles.errorItem}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.error} />
                  <Text style={styles.errorText}>
                    {e.field}: {e.message}
                  </Text>
                </View>
              ))}
            </View>
            {isAddress && (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Street Address"
                  value={editedData.street || ""}
                  onChangeText={(t: string) => setEditedData({ ...editedData, street: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={editedData.city || ""}
                  onChangeText={(t: string) => setEditedData({ ...editedData, city: t })}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="State"
                    maxLength={2}
                    value={editedData.state || ""}
                    onChangeText={(t: string) => setEditedData({ ...editedData, state: t })}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Postal Code"
                    keyboardType="numeric"
                    value={editedData.postalCode || ""}
                    onChangeText={(t: string) => setEditedData({ ...editedData, postalCode: t })}
                  />
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primary}
              onPress={() => onResolve({ action: "retry_local", modifiedData: editedData })}
              accessibilityRole="button"
              accessibilityLabel="Retry with corrections"
            >
              <Text style={styles.primaryText}>Retry with Corrections</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondary}
              onPress={() => onResolve({ action: "discard" })}
              accessibilityRole="button"
              accessibilityLabel="Discard changes"
            >
              <Text style={styles.secondaryText}>Discard Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghost} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel">
              <Text style={styles.ghostText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: theme.colors.background.elevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      maxHeight: "85%"
    },
    header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
    title: { color: theme.colors.text.primary, fontWeight: "800", fontSize: 18 },
    description: { color: theme.colors.text.primary, marginBottom: 8 },
    errorList: { gap: 6, marginBottom: 10 },
    errorItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    errorText: { color: theme.colors.text.primary },
    form: { gap: 10 },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.secondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      color: theme.colors.text.primary
    },
    actions: { gap: 8, marginTop: 8 },
    primary: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.colors.accent.emerald, borderRadius: 10 },
    primaryText: { color: theme.colors.text.inverse, fontWeight: "800", textAlign: "center" },
    secondary: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    secondaryText: { color: theme.colors.text.primary, fontWeight: "700", textAlign: "center" },
    ghost: { paddingHorizontal: 12, paddingVertical: 10, alignItems: "center" },
    ghostText: { color: theme.colors.text.secondary, fontWeight: "700" }
  });
}
