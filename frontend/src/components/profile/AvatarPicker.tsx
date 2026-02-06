import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Avatar, Button, useTheme, ActivityIndicator } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useApp } from "@context/AppContext";

export default function AvatarPicker() {
  const theme = useTheme();
  const { user, setUser } = useApp();
  const [loading, setLoading] = React.useState(false);

  const chooseFromGallery = async () => {
    setLoading(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Permission required", "Please grant gallery permissions.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: false });
      if (res.canceled || !res.assets?.length) return;
      const img = res.assets[0];
      const crop = await ImageManipulator.manipulateAsync(
        img.uri,
        [{ crop: { originX: 0, originY: 0, width: img.width!, height: img.height! } }, { resize: { width: 256, height: 256 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setUser({ avatarUri: crop.uri });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to set avatar");
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    setLoading(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Permission required", "Please grant camera permissions.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ quality: 1 });
      if (res.canceled || !res.assets?.length) return;
      const img = res.assets[0];
      const crop = await ImageManipulator.manipulateAsync(
        img.uri,
        [{ resize: { width: 256, height: 256 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setUser({ avatarUri: crop.uri });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to capture avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {user.avatarUri ? (
        <Avatar.Image size={64} source={{ uri: user.avatarUri }} />
      ) : (
        <Avatar.Text size={64} label={(user.name || "G")[0].toUpperCase()} />
      )}
      <View style={styles.row}>
        <Button onPress={takePhoto}>Take Photo</Button>
        <Button onPress={chooseFromGallery}>Choose</Button>
      </View>
      {loading ? <ActivityIndicator /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  row: { flexDirection: "row", marginTop: 8, gap: 8 }
});
