import React from 'react';
import { View, ViewStyle } from 'react-native';

interface Props {
  data: { hydration: number; texture: number; clarity: number };
  style?: ViewStyle;
}

export default function InteractiveChart({ data, style }: Props) {
  return <View style={style} />;
}
