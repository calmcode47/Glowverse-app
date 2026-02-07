import React from 'react';
import { TouchableOpacity } from 'react-native';
type Props = { onPress?: () => void };
export default function PulseButton({ onPress }: Props) {
  return <TouchableOpacity onPress={onPress} />;
}
