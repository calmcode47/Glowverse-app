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
      const g: any = globalThis as any;
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
  let themeColors: any = {
    background: "#0D1117",
    textPrimary: "#E6EDF3",
    textInverse: "#0D1117",
    accent: "#10B981",
    borderLight: "#30363D"
  };
  try {
    const { theme } = useTheme();
    themeColors = {
      background: theme.colors.background?.primary || themeColors.background,
      textPrimary: theme.colors.text?.primary || themeColors.textPrimary,
      textInverse: theme.colors.text?.inverse || themeColors.textInverse,
      accent: theme.colors.accent?.emerald || themeColors.accent,
      borderLight: theme.colors.border?.light || themeColors.borderLight
    };
  } catch {}
  const styles = createStyles(themeColors);
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="alert-circle-outline" size={56} color="#FB7185" />
      <Text style={styles.title}>Something went wrong</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={onRestart} style={[styles.btn, { backgroundColor: themeColors.accent }]}>
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
    container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: theme.background, padding: 16 },
    title: { color: theme.textPrimary, fontWeight: "900", fontSize: 18 },
    row: { flexDirection: "row", gap: 8, marginTop: 8 },
    btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
    btnText: { color: theme.textInverse, fontWeight: "900" },
    btnOutline: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.borderLight },
    btnOutlineText: { color: theme.textPrimary, fontWeight: "800" }
  });
}
