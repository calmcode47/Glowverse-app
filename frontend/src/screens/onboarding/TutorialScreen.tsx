import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function TutorialScreen() {
  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Tutorial</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" }
});
