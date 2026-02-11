import * as React from "react";
import { View, Text } from "react-native";
import { Button } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { Camera, CameraView } from "expo-camera";
import FaceGuideOverlay from "../../components/camera/FaceGuideOverlay";
import CameraControls from "../../components/camera/CameraControls";
import type { CameraMode } from "../../components/camera/ModeSelector";
import * as AnalysisAPI from "../../services/api/analysis.api";
import * as TryOnAPI from "../../services/api/tryon.api";

type FlashMode = "auto" | "on" | "off";

export default function CameraScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [hasPerm, setHasPerm] = React.useState<boolean | null>(null);
  const [facing, setFacing] = React.useState<"front" | "back">("front");
  const [flash, setFlash] = React.useState<FlashMode>("off");
  const [mode, setMode] = React.useState<CameraMode>("skin");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [galleryUri, setGalleryUri] = React.useState<string | undefined>(undefined);
  const cameraRef = React.useRef<CameraView>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPerm(status === "granted");
    })();
  }, []);

  const onCapture = async () => {
    try {
      setLoading(true);
      const photo = await cameraRef.current?.takePictureAsync();
      if (!photo?.uri) throw new Error("Capture failed");
      setGalleryUri(photo.uri);
      if (mode === "skin") {
        const res = await AnalysisAPI.createSkinAnalysis({ uri: photo.uri, name: "capture.jpg", type: "image/jpeg" });
        navigation.navigate("Processing", { analysisId: res.analysis.id, imageUri: photo.uri } as any);
      } else {
        const res = await TryOnAPI.createTryOn({ uri: photo.uri, name: "capture.jpg", type: "image/jpeg" }, { type: "FULL_MAKEUP" });
        navigation.navigate("Processing", { tryOnId: res.tryOn.id, imageUri: photo.uri } as any);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1200);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (hasPerm === null) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background.primary }} />;
  }
  if (hasPerm === false) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text>No camera access</Text>
        <Button onPress={async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPerm(status === "granted");
        }}>Grant Access</Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        enableTorch={flash === "on"}
      />
      <FaceGuideOverlay status="no_face" />
      <CameraControls
        onCapture={onCapture}
        loading={loading}
        success={success}
        onFlip={() => setFacing(facing === "front" ? "back" : "front")}
        flash={flash}
        onFlashChange={setFlash}
        galleryUri={galleryUri}
        mode={mode}
        onModeChange={setMode}
        onOpenGallery={() => galleryUri && navigation.navigate("Results", { imageUri: galleryUri })}
        onBack={() => navigation.goBack()}
      />
    </View>
  );
}
