import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { CameraView } from "expo-camera";
import { useCamera } from "@hooks/useCamera";
import { useImagePicker } from "@hooks/useImagePicker";
import { useCameraContext } from "@context/CameraContext";
import FaceGuideOverlay, { FaceStatus } from "@components/camera/FaceGuideOverlay";
import CameraControls from "@components/camera/CameraControls";
import type { CameraMode } from "@components/camera/ModeSelector";
import LoadingOverlay from "@components/common/LoadingOverlay";

export default function CameraScreen() {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const cameraRef = React.useRef<any>(null);
  const { permissions, requestPermissions, capturePhoto, toggleCameraType, cameraType } = useCamera();
  const { capturedImages } = useCameraContext();
  const { requestPermission: requestGalleryPerm, pickImage } = useImagePicker();

  const [flash, setFlash] = React.useState<"auto" | "on" | "off">("off");
  const [mode, setMode] = React.useState<CameraMode>("skin");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [faceStatus, setFaceStatus] = React.useState<FaceStatus>("no_face");

  React.useEffect(() => {
    (async () => {
      await requestPermissions();
    })();
    return () => {
      setLoading(false);
    };
  }, []);

  const onCapture = async () => {
    setLoading(true);
    setSuccess(false);
    const result = await capturePhoto((cameraRef.current as unknown) as {
      takePictureAsync: (opts: { quality?: number; skipProcessing?: boolean }) => Promise<{
        uri: string;
        width?: number;
        height?: number;
      }>;
    });
    if (result?.uri) {
      setSuccess(true);
      navigation.navigate("Results", { imageUri: result.uri });
    }
    setLoading(false);
  };

  const openGallery = async () => {
    const ok = await requestGalleryPerm();
    if (!ok) return;
    const img = await pickImage(0.85);
    if (img?.uri) {
      navigation.navigate("Results", { imageUri: img.uri });
    }
  };

  if (!permissions.camera) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <LoadingOverlay visible={false} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={(r: any) => (cameraRef.current = r)}
        style={styles.camera}
        facing={cameraType as any}
        flash={flash as any}
      />
      <FaceGuideOverlay status={faceStatus} />
      <CameraControls
        onCapture={onCapture}
        loading={loading}
        success={success}
        onFlip={toggleCameraType}
        flash={flash}
        onFlashChange={setFlash}
        galleryUri={capturedImages[0]?.uri}
        mode={mode}
        onModeChange={setMode}
        onOpenGallery={openGallery}
        onBack={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" }
});
