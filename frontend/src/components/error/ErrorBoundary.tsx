import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import { client } from "../../services/api/client";

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    try {
      client.post("/api/v1/logs/errors", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo?.componentStack
      }).catch(() => {});
    } catch {}
    try {
      const g: any = global as any;
      if (g.Sentry && typeof g.Sentry.captureException === "function") {
        g.Sentry.captureException(error);
      }
    } catch {}
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <Fallback onRestart={() => this.reset()} onReport={() => {}} />;
    }
    return this.props.children as any;
  }
}

function Fallback({ onRestart, onReport }: { onRestart: () => void; onReport: () => void }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="alert-circle-outline" size={56} color={theme.colors.accent.rose} />
      <Text style={styles.title}>Something went wrong</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={onRestart} style={[styles.btn, { backgroundColor: theme.colors.accent.emerald }]}>
          <Text style={styles.btnText}>Restart App</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReport} style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: theme.colors.background.primary, padding: 16 },
    title: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 18 },
    row: { flexDirection: "row", gap: 8, marginTop: 8 },
    btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
    btnText: { color: theme.colors.text.inverse, fontWeight: "900" },
    btnOutline: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light },
    btnOutlineText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
