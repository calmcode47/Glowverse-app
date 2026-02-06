import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";

type Props = {
  children: React.ReactNode;
  onRetry?: () => void;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} accessibilityLabel="Error screen">
          <Text variant="titleLarge">Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message || "Unexpected error"}</Text>
          <Button mode="contained" onPress={this.reset}>Retry</Button>
        </View>
      );
    }
    return this.props.children as any;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  message: { marginVertical: 12 }
});
