import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTheme, IconButton } from "react-native-paper";
import CaptureButton from "./CaptureButton";
import type { CameraMode } from "./ModeSelector";
import ModeSelector from "./ModeSelector";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type FlashMode = "auto" | "on" | "off";

type Props = {
  onCapture: () => void;
  loading?: boolean;
  success?: boolean;
  onFlip: () => void;
  flash: FlashMode;
  onFlashChange: (m: FlashMode) => void;
  galleryUri?: string;
  mode: CameraMode;
  onModeChange: (m: CameraMode) => void;
  onOpenGallery?: () => void;
  onBack?: () => void;
};

export default function CameraControls({
  onCapture,
  loading,
  success,
  onFlip,
  flash,
  onFlashChange,
  galleryUri,
  mode,
  onModeChange,
  onOpenGallery,
  onBack
}: Props) {
  const theme = useTheme();
  const nextFlash = () => {
    onFlashChange(flash === "auto" ? "on" : flash === "on" ? "off" : "auto");
  };
  const flashIcon = flash === "auto" ? "flash-auto" : flash === "on" ? "flash" : "flash-off";

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" onPress={onBack} accessibilityLabel="Go back" />
        <ModeSelector value={mode} onChange={onModeChange} />
        <IconButton icon={flashIcon} onPress={nextFlash} accessibilityLabel="Toggle flash" />
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={onOpenGallery} accessibilityLabel="Open gallery">
          {galleryUri ? <Image source={{ uri: galleryUri }} style={styles.thumb} /> : <MaterialCommunityIcons name="image" size={28} color={theme.colors.onSurface} />}
        </TouchableOpacity>
        <CaptureButton loading={loading} success={success} onPress={onCapture} />
        <IconButton icon="camera-switch" onPress={onFlip} accessibilityLabel="Flip camera" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "space-between" },
  topBar: { paddingTop: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bottomBar: { paddingBottom: 24, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  thumb: { width: 48, height: 48, borderRadius: 8 }
});
