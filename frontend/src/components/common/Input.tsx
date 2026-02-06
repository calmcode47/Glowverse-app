import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, HelperText, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  errorText?: string;
  leftIconName?: string;
  rightIconName?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "url";
  secureTextEntry?: boolean;
  maxLength?: number;
  helperText?: string;
};

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  errorText,
  leftIconName,
  rightIconName,
  keyboardType,
  secureTextEntry,
  maxLength,
  helperText
}: Props) {
  const theme = useTheme();
  const showError = Boolean(errorText);
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        error={showError}
        left={
          leftIconName
            ? ((props: { size: number; color: string }) => (
                <MaterialCommunityIcons name={leftIconName as any} size={props.size} color={props.color} />
              )) as any
            : undefined
        }
        right={
          rightIconName
            ? ((props: { size: number; color: string }) => (
                <MaterialCommunityIcons name={rightIconName as any} size={props.size} color={props.color} />
              )) as any
            : undefined
        }
      />
      {(helperText || showError || maxLength) && (
        <View style={styles.footer}>
          {showError ? <HelperText type="error" visible>{errorText}</HelperText> : helperText ? <HelperText type="info" visible>{helperText}</HelperText> : null}
          {maxLength ? <HelperText type="info" visible>{value.length}/{maxLength}</HelperText> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  footer: { flexDirection: "row", justifyContent: "space-between" }
});
