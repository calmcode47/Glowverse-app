import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text, Button, ProgressBar } from "react-native-paper";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@navigation/types";
import { useAnalysisPolling } from "@hooks/useAnalysisPolling";
import { useTryOnPolling } from "@hooks/useTryOnPolling";
import { useTheme } from "../../theme/themeContext";
import type { StackNavigationProp } from "@react-navigation/stack";

type RouteProps = RouteProp<RootStackParamList, "Processing">;

export default function ProcessingScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProps>();
  const { analysisId, tryOnId, imageUri } = params || {};

  const {
    loading: aLoading,
    error: aError
  } = useAnalysisPolling(analysisId || null, {
    onComplete: () => navigation.navigate("Results", { imageUri }),
    onError: () => {}
  });

  const {
    loading: tLoading,
    error: tError
  } = useTryOnPolling(tryOnId || null, {
    onComplete: () => navigation.navigate("Results", { imageUri }),
    onError: () => {}
  });

  const loading = aLoading || tLoading;
  const error = aError || tError;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.text}>Processing</Text>
          <ProgressBar indeterminate style={styles.bar} />
        </View>
      )}
      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.text}>{error}</Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>Back</Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  text: { marginTop: 8 },
  bar: { width: "60%", marginTop: 8 }
});
