declare module "@expo/vector-icons" {
  import * as React from "react";
  import { TextProps } from "react-native";
  export type IconProps = {
    name: string;
    size?: number;
    color?: string;
  } & TextProps;
  export const MaterialCommunityIcons: React.ComponentType<IconProps>;
  export const Ionicons: React.ComponentType<IconProps>;
  export const Feather: React.ComponentType<IconProps>;
  export const MaterialIcons: React.ComponentType<IconProps>;
}
