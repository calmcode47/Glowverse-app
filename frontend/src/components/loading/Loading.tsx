import React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";

export default function Loading({ message }: { message?: string }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator />
        {message ? <Text style={styles.msg}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "#00000055" },
  box: { padding: 16, backgroundColor: "#111827", borderRadius: 12, alignItems: "center", gap: 8 },
  msg: { color: "#fff" }
});
