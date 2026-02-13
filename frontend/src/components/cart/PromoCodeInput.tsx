import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { AppliedPromo } from "../../services/api/cart.api";

type Props = {
  applied?: AppliedPromo | null;
  onApply: (code: string) => Promise<void>;
  onRemove: () => Promise<void>;
};

export default function PromoCodeInput({ applied, onApply, onRemove }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.toggle}>
        <Text style={styles.toggleText}>Have a Promo Code?</Text>
      </TouchableOpacity>
      {open ? (
        applied ? (
          <View style={styles.applied}>
            <Text style={styles.appliedText}>{applied.code} applied</Text>
            <TouchableOpacity
              onPress={async () => {
                setLoading(true);
                setError(null);
                try {
                  await onRemove();
                } catch (e: any) {
                  setError(e?.message || "Failed to remove");
                } finally {
                  setLoading(false);
                }
              }}
              style={styles.removeBtn}
              disabled={loading}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              placeholder="Enter code"
              value={code}
              onChangeText={setCode}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={async () => {
                if (!code) return;
                setLoading(true);
                setError(null);
                try {
                  await onApply(code.trim());
                  setCode("");
                } catch (e: any) {
                  setError(e?.message || "Invalid code");
                } finally {
                  setLoading(false);
                }
              }}
              style={styles.applyBtn}
              disabled={loading || !code}
            >
              {loading ? <ActivityIndicator color={theme.colors.text.inverse} /> : <Text style={styles.applyText}>Apply</Text>}
            </TouchableOpacity>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        )
      ) : null}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { paddingHorizontal: 16, paddingTop: 8 },
    toggle: { alignSelf: "flex-start" },
    toggleText: { color: theme.colors.accent.emerald, fontWeight: "700" },
    form: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.colors.text.primary
    },
    applyBtn: { backgroundColor: theme.colors.accent.emerald, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    applyText: { color: theme.colors.text.inverse, fontWeight: "800" },
    error: { color: theme.colors.error, marginLeft: 8 },
    applied: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
    appliedText: { color: theme.colors.accent.emerald, fontWeight: "700" },
    removeBtn: { borderWidth: 1, borderColor: theme.colors.border.light, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
    removeText: { color: theme.colors.text.primary, fontWeight: "700" }
  });
}
