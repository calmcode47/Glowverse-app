import React from "react";
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Analysis } from "../../services/api/analysis.api";

type Props = {
  visible: boolean;
  left?: Analysis | null;
  right?: Analysis | null;
  onClose: () => void;
};

export default function ComparisonView({ visible, left, right, onClose }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Compare Analyses</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, alignItems: "center" }}>
              {left?.processedImageUrl || left?.originalImageUrl ? <Image source={{ uri: left?.processedImageUrl || left?.originalImageUrl }} style={styles.image} /> : null}
              <Text style={styles.caption}>#{left?.id.slice(0, 6)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              {right?.processedImageUrl || right?.originalImageUrl ? <Image source={{ uri: right?.processedImageUrl || right?.originalImageUrl }} style={styles.image} /> : null}
              <Text style={styles.caption}>#{right?.id.slice(0, 6)}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.btn}><Text style={styles.btnText}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
    sheet: { backgroundColor: theme.colors.background.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border.light, maxHeight: "90%" },
    title: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 16, marginBottom: 8 },
    row: { flexDirection: "row", gap: 8 },
    image: { width: 140, height: 140, borderRadius: 10 },
    caption: { color: theme.colors.text.secondary, marginTop: 4 },
    btn: { alignSelf: "center", marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light },
    btnText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
