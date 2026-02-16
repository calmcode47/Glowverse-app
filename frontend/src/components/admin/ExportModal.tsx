import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "xlsx" | "json") => Promise<void>;
  exporting?: boolean;
};

export default function ExportModal({ visible, onClose, onExport, exporting }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Export Data</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Choose a format</Text>
          <View style={styles.row}>
            <TouchableOpacity disabled={exporting} onPress={() => onExport("csv")} style={[styles.btn, { borderColor: theme.colors.border.light }]}>
              <Text style={[styles.btnText, { color: theme.colors.text.primary }]}>CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={exporting} onPress={() => onExport("xlsx")} style={[styles.btn, { borderColor: theme.colors.border.light }]}>
              <Text style={[styles.btnText, { color: theme.colors.text.primary }]}>Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={exporting} onPress={() => onExport("json")} style={[styles.btn, { borderColor: theme.colors.border.light }]}>
              <Text style={[styles.btnText, { color: theme.colors.text.primary }]}>JSON</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            {exporting ? <ActivityIndicator /> : null}
            <TouchableOpacity onPress={onClose}><Text style={{ color: theme.colors.text.secondary }}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    backdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    card: { width: 300, borderRadius: 16, borderWidth: 1, padding: 16 },
    title: { fontWeight: "900", fontSize: 16 },
    subtitle: { marginTop: 4, marginBottom: 12 },
    row: { flexDirection: "row", gap: 12 },
    btn: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
    btnText: { fontWeight: "800" },
    footer: { alignItems: "center", marginTop: 12 }
  });
}

