import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, ProgressBar, IconButton, Portal, Modal } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";

type Props = {
  title: string;
  score: number; // 0..100
  description?: string;
  tips?: string[];
};

export default function MetricCard({ title, score, description, tips }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [open, setOpen] = React.useState(false);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <IconButton icon="information-outline" onPress={() => setOpen(true)} />
      </View>
      <View style={styles.row}>
        <Text style={styles.score}>{Math.round(score)}</Text>
        <ProgressBar progress={Math.max(0, Math.min(1, score / 100))} style={{ flex: 1, height: 8, borderRadius: 4 }} />
      </View>
      <Portal>
        <Modal visible={open} onDismiss={() => setOpen(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>{title}</Text>
          {description ? <Text style={styles.desc}>{description}</Text> : null}
          {tips?.length ? (
            <View style={{ marginTop: 8 }}>
              {tips.map((t, i) => (
                <Text key={i} style={styles.tip}>• {t}</Text>
              ))}
            </View>
          ) : null}
          <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12, gap: 6 },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { color: theme.colors.text.primary, fontWeight: "800", flex: 1 },
    score: { color: theme.colors.text.primary, fontWeight: "900", width: 42, textAlign: "right" },
    modal: { margin: 16, padding: 16, backgroundColor: theme.colors.background.elevated, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border.light },
    modalTitle: { color: theme.colors.text.primary, fontWeight: "800", marginBottom: 8 },
    desc: { color: theme.colors.text.secondary, marginBottom: 8 },
    tip: { color: theme.colors.text.secondary, marginTop: 2 },
    closeBtn: { alignSelf: "flex-end", marginTop: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light },
    closeText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
