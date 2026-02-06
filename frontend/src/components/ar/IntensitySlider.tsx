import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import Slider from "@components/common/Slider";

type Props = {
  value: number;
  onChange: (v: number) => void;
  onReset?: () => void;
};

export default function IntensitySlider({ value, onChange, onReset }: Props) {
  return (
    <View style={styles.container}>
      <Text>Intensity</Text>
      <Slider value={value} onChange={onChange} min={0} max={100} step={1} showValue />
      <Button onPress={onReset}>Reset</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 }
});
