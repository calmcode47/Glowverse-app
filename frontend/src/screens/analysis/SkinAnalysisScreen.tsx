import React from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import { Camera, CameraView } from "expo-camera";
import { useTheme } from "../../theme/themeContext";
import FaceGuideOverlay from "../../components/camera/FaceGuideOverlay";
import { useNavigation } from "@react-navigation/native";
import * as ImageManipulator from "expo-image-manipulator";
import * as Cloudinary from "../../services/cloudinary.service";
import * as AnalysisAPI from "../../services/api/analysis.api";
import CaptureButton from "../../components/ar/CaptureButton";

export default function SkinAnalysisScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const [perm, setPerm] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(false);
  const cameraRef = React.useRef<CameraView>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPerm(status === "granted");
    })();
  }, []);

  const compressUnder2MB = async (uri: string): Promise<{ uri: string; type: string; name: string }> => {
    let quality = 0.9;
    let currentUri = uri;
    for (let i = 0; i < 5; i++) {
      const result = await ImageManipulator.manipulateAsync(currentUri, [], { compress: quality, format: ImageManipulator.SaveFormat.JPEG });
      // We do not have direct file size here; attempt descending qualities and trust compression
      currentUri = result.uri;
      quality -= 0.2;
    }
    return { uri: currentUri, type: "image/jpeg", name: "analysis.jpg" };
  };

  const onCapture = async () => {
    if (!cameraRef.current) return;
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: false });
      if (!photo?.uri) throw new Error("Capture failed");
      const file = await compressUnder2MB(photo.uri);
      try {
        const uploaded = await Cloudinary.uploadImage(file);
        const res = await AnalysisAPI.createSkinAnalysisByUrl(uploaded.url);
        navigation.navigate("AnalysisProcessing", { analysisId: res.analysis.id, imageUri: uploaded.url } as any);
      } catch {
        // Fallback: direct upload to backend
        const res = await AnalysisAPI.createSkinAnalysis(file);
        navigation.navigate("AnalysisProcessing", { analysisId: res.analysis.id, imageUri: photo.uri } as any);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to start analysis");
    } finally {
      setLoading(false);
    }
  };

  if (perm === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (perm === false) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.text.primary }}>Camera permission needed</Text>
        <Button onPress={async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setPerm(status === "granted");
        }}>Grant Access</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
      <FaceGuideOverlay status="no_face" />
      <View style={styles.tips}>
        <Text style={styles.tip}>• Good lighting</Text>
        <Text style={styles.tip}>• Remove makeup</Text>
        <Text style={styles.tip}>• Face fully visible</Text>
        <Text style={styles.tip}>• Neutral expression</Text>
      </View>
      <View style={styles.captureBar}>
        <CaptureButton onPress={onCapture} disabled={loading} />
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    tips: { position: "absolute", bottom: 120, left: 16, right: 16, alignItems: "center" },
    tip: { color: theme.colors.text.inverse, textShadowColor: "#000", textShadowRadius: 4 },
    captureBar: { position: "absolute", bottom: 32, left: 0, right: 0, alignItems: "center" }
  });
}
