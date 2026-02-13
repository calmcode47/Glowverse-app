import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { useTheme } from "../../theme/themeContext";

type Props = {
  code: string;
  link: string;
};

export default function ShareCard({ code, link }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Share Your Code</Text>
      <Text style={styles.code}>{code}</Text>
      <Text style={styles.link}>{link}</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => Share.share({ message: `Join Glowverse with my code ${code} and get 20% off! ${link}` })} style={styles.btn}>
          <Text style={styles.btnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Share.share({ url: link })} style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>Copy Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12, gap: 6 },
    title: { color: theme.colors.text.primary, fontWeight: "900" },
    code: { color: theme.colors.text.primary, fontWeight: "900", letterSpacing: 1 },
    link: { color: theme.colors.text.secondary },
    row: { flexDirection: "row", gap: 8, marginTop: 8 },
    btn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, backgroundColor: theme.colors.accent.emerald },
    btnText: { color: theme.colors.text.inverse, fontWeight: "900" },
    btnOutline: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light },
    btnOutlineText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
