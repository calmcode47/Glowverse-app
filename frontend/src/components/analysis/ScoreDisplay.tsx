import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import CircularScore from "../common/CircularScore";

type Props = {
  score: number; // 0..100
  label?: string;
};

function colorForScore(score: number) {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

export default function ScoreDisplay({ score, label }: Props) {
  const { theme } = useTheme();
  const color = colorForScore(score);
  return (
    <View style={styles.container}>
      <CircularScore value={score} max={100} size={160} strokeWidth={14} color={color} trackColor="#1F2937" />
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label || contextForScore(score)}</Text>
    </View>
  );
}

function contextForScore(score: number) {
  if (score >= 80) return "Great overall skin health";
  if (score >= 60) return "Good, some improvements possible";
  return "Consider targeted care";
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  label: { marginTop: 8, fontWeight: "600" }
});
