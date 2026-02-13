import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ActivityIndicator, ProgressBar } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as AnalysisAPI from "../../services/api/analysis.api";

const STEPS = [
  "Analyzing your skin...",
  "Detecting skin tone...",
  "Measuring hydration levels...",
  "Calculating texture score...",
  "Almost there..."
];

export default function AnalysisProcessingScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const analysisId = route.params?.analysisId as string;
  const [progress, setProgress] = React.useState(0.1);
  const [messageIndex, setMessageIndex] = React.useState(0);
  const startedAtRef = React.useRef(Date.now());
  const backoff = React.useRef([2000, 4000, 8000, 15000, 30000]);
  const attemptRef = React.useRef(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = async () => {
    try {
      const resp = await AnalysisAPI.getAnalysis(analysisId);
      if (resp.analysis.status === "COMPLETED") {
        navigation.replace("AnalysisResults", { analysisId });
        return;
      }
      if (resp.analysis.status === "FAILED") {
        navigation.goBack();
        return;
      }
      // update progress/message
      setMessageIndex((i) => (i + 1) % STEPS.length);
      setProgress((p) => Math.min(0.95, p + 0.1));
      const idx = Math.min(attemptRef.current, backoff.current.length - 1);
      const delay = backoff.current[idx];
      attemptRef.current += 1;
      if (Date.now() - startedAtRef.current > 120000) {
        navigation.goBack();
        return;
      }
      timerRef.current = setTimeout(poll, delay);
    } catch {
      navigation.goBack();
    }
  };

  React.useEffect(() => {
    timerRef.current = setTimeout(poll, backoff.current[0]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text style={styles.message}>{STEPS[messageIndex]}</Text>
      <ProgressBar progress={progress} style={{ width: "80%", height: 8, borderRadius: 4 }} />
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: theme.colors.background.primary },
    message: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}
