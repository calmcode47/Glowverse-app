import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@navigation/types";

type Props = {
  route: RouteProp<RootStackParamList, "Results">;
};

export default function ResultsScreen({ route }: Props) {
  const { imageUri } = route.params || {};
  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Results</Text>
      {imageUri && <Text>Image: {imageUri}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" }
});
