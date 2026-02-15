/**
 * Enhanced Skin Analysis Screen
 * 
 * Integrates with AI analysis service and privacy consent flow.
 */

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
import PrivacyConsentModal from "../../components/ai/PrivacyConsentModal";
import { skinAnalysisAPI } from "../../services/ai/skinAnalysisAPI.service";
import { imageValidationService } from "../../services/ai/imageValidation.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CONSENT_KEY = '@glowverse:ai_consent';

export default function SkinAnalysisScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const [perm, setPerm] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showConsent, setShowConsent] = React.useState(false);
  const [hasConsent, setHasConsent] = React.useState(false);
  const [pendingCapture, setPendingCapture] = React.useState<string | null>(null);
  const cameraRef = React.useRef<CameraView>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPerm(status === "granted");

      // Check if user has already given consent
      const consentStatus = await AsyncStorage.getItem(CONSENT_KEY);
      setHasConsent(consentStatus === 'true');
    })();
  }, []);

  const compressUnder2MB = async (uri: string): Promise<{ uri: string; type: string; name: string }> => {
    let quality = 0.9;
    let currentUri = uri;
    for (let i = 0; i < 5; i++) {
      const result = await ImageManipulator.manipulateAsync(currentUri, [], {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG
      });
      currentUri = result.uri;
      quality -= 0.2;
    }
    return { uri: currentUri, type: "image/jpeg", name: "analysis.jpg" };
  };

  const handleConsentAccept = async () => {
    try {
      // Record consent locally
      await AsyncStorage.setItem(CONSENT_KEY, 'true');

      // Record consent on backend
      await skinAnalysisAPI.recordConsent();

      setHasConsent(true);
      setShowConsent(false);

      // If there's a pending capture, process it
      if (pendingCapture) {
        await processCapture(pendingCapture);
        setPendingCapture(null);
      }
    } catch (error: any) {
      console.error('[Consent] Failed to record:', error);
      Alert.alert('Error', 'Failed to record consent. Please try again.');
    }
  };

  const handleConsentDecline = () => {
    setShowConsent(false);
    setPendingCapture(null);
    Alert.alert(
      'Consent Required',
      'AI skin analysis requires your consent to process facial images. You can access this feature after providing consent.',
      [{ text: 'OK' }]
    );
  };

  const processCapture = async (photoUri: string) => {
    try {
      setLoading(true);

      // Validate image
      const validation = await imageValidationService.validateImage(photoUri);

      if (!validation.valid) {
        Alert.alert(
          'Image Quality Issue',
          validation.errors.join('\n'),
          [{ text: 'Retry', onPress: () => setLoading(false) }]
        );
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('[SkinAnalysis] Warnings:', validation.warnings);
      }

      // Compress image
      const file = await compressUnder2MB(photoUri);

      try {
        // Upload to Cloudinary
        const uploaded = await Cloudinary.uploadImage(file);

        // Start analysis via existing API
        const res = await AnalysisAPI.createSkinAnalysisByUrl(uploaded.url);

        navigation.navigate("AnalysisProcessing", {
          analysisId: res.analysis.id,
          imageUri: uploaded.url
        } as any);
      } catch (uploadError) {
        // Fallback: direct upload to backend
        const res = await AnalysisAPI.createSkinAnalysis(file);
        navigation.navigate("AnalysisProcessing", {
          analysisId: res.analysis.id,
          imageUri: photoUri
        } as any);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to start analysis");
    } finally {
      setLoading(false);
    }
  };

  const onCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false
      });

      if (!photo?.uri) throw new Error("Capture failed");

      // Check consent before processing
      if (!hasConsent) {
        setPendingCapture(photo.uri);
        setShowConsent(true);
        return;
      }

      await processCapture(photo.uri);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to capture image");
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
    <>
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
        <FaceGuideOverlay status="no_face" />

        <View style={styles.tips}>
          <Text style={styles.tip}>• Good lighting</Text>
          <Text style={styles.tip}>• Remove makeup for best results</Text>
          <Text style={styles.tip}>• Face fully visible</Text>
          <Text style={styles.tip}>• Neutral expression</Text>
        </View>

        <View style={styles.captureBar}>
          <CaptureButton onPress={onCapture} disabled={loading} />
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}
      </View>

      <PrivacyConsentModal
        visible={showConsent}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    tips: {
      position: "absolute",
      bottom: 120,
      left: 16,
      right: 16,
      alignItems: "center"
    },
    tip: {
      color: theme.colors.text.inverse,
      textShadowColor: "#000",
      textShadowRadius: 4,
      marginBottom: 4,
    },
    captureBar: {
      position: "absolute",
      bottom: 32,
      left: 0,
      right: 0,
      alignItems: "center"
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: '#FFFFFF',
      fontSize: 16,
      marginTop: 16,
      fontWeight: '500',
    },
  });
}
