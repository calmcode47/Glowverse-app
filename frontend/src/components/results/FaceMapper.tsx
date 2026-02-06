import React from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";

export type Marker = {
  x: number;
  y: number;
  label: string;
  severity: "low" | "medium" | "high";
};

type Props = {
  imageUri: string;
  markers: Marker[];
  onSelect?: (m: Marker) => void;
};

export default function FaceMapper({ imageUri, markers, onSelect }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      {markers.map((m, i) => {
        const color = m.severity === "high" ? theme.colors.error : m.severity === "medium" ? theme.colors.secondary : theme.colors.primary;
        return (
          <Pressable
            key={`${m.label}-${i}`}
            style={[styles.marker, { left: `${m.x * 100}%`, top: `${m.y * 100}%`, backgroundColor: color }]}
            onPress={() => onSelect?.(m)}
          >
            <Text style={styles.markerLabel}>{m.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 280, borderRadius: 12, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  marker: { position: "absolute", width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  markerLabel: { color: "#fff", fontSize: 10 }
});
