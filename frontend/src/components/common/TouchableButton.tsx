import React from "react";
import { TouchableOpacity, Platform, TouchableOpacityProps, StyleProp, ViewStyle } from "react-native";

const MIN_TOUCH_TARGET = Platform.select({ ios: 44, android: 48, default: 44 }) as number;

type Props = TouchableOpacityProps & { style?: StyleProp<ViewStyle> };

export default function TouchableButton({ style, ...props }: Props) {
  return (
    <TouchableOpacity
      {...props}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" }, style]}
    />
  );
}

