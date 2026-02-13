import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  children: React.ReactNode;
  onRetry?: () => void;
};

type State = { hasError: boolean };

export default class LazyLoadErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Lazy load error:", error, errorInfo);
  }
  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Failed to Load Screen</Text>
          <Text style={styles.message}>Something went wrong while loading this screen.</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  message: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#666" },
  button: { backgroundColor: "#007AFF", paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" }
});
