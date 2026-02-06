import React from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export type PickedImage = {
  uri: string;
  width?: number;
  height?: number;
};

export function useImagePicker() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);

  const requestPermission = async () => {
    setError(null);
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const ok = res.status === "granted";
    setHasPermission(ok);
    return ok;
  };

  const pickImage = async (compressQuality = 0.85): Promise<PickedImage | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 1
      });
      if (result.canceled || !result.assets?.length) return null;
      const asset = result.assets[0];
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [],
        { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
      );
      return { uri: manipulated.uri, width: manipulated.width, height: manipulated.height };
    } catch (e: any) {
      setError(e?.message || "Image pick failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { requestPermission, pickImage, loading, error, hasPermission };
}
