import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import BottomSheet from "@components/common/BottomSheet";
import { Share } from "react-native";
import * as MediaLibrary from "expo-media-library";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  imageUri?: string;
};

export default function ShareSheet({ visible, onDismiss, imageUri }: Props) {
  const theme = useTheme();
  const share = async () => {
    if (!imageUri) return;
    await Share.share({ url: imageUri, message: "Check out my analysis" });
  };
  const save = async () => {
    if (!imageUri) return;
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (perm.status !== "granted") return;
    await MediaLibrary.saveToLibraryAsync(imageUri);
  };
  const copy = async () => {
    if (!imageUri) return;
  };
  return (
    <BottomSheet visible={visible} onDismiss={onDismiss} snapPoints={[320, 420]}>
      <View style={styles.container}>
        <Text variant="titleMedium">Share</Text>
        <Button mode="contained" onPress={share}>Share to social</Button>
        <Button mode="contained" onPress={save}>Save to gallery</Button>
        <Button mode="outlined" onPress={copy}>Copy link</Button>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 }
});
