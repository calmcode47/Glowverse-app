/**
 * Camera Screen
 * Advanced camera with face detection and AI features
 */
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { useCameraStore } from '@/stores/camera.store';
import { useAnalysisStore } from '@/stores/analysis.store';
import { useUIStore } from '@/stores/ui.store';
import FaceGuideOverlay from '@/components/camera/FaceGuideOverlay';
import CameraControls from '@/components/camera/CameraControls';
import ModeSelector from '@/components/camera/ModeSelector';
import { ParticleSystem } from '@/components/advanced/animations/ParticleSystem';
import { theme } from '@/design-system/theme';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export const CameraScreen: React.FC = () => {
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation();

  const {
    cameraType,
    flashMode,
    currentMode,
    isPermissionGranted,
    isCameraReady,
    toggleCamera,
    setFlashMode,
    setPermission,
    setCameraReady,
    addCapturedImage
  } = useCameraStore();

  const { createAnalysis, pollAnalysis } = useAnalysisStore();
  const { showLoading, hideLoading, showToast } = useUIStore();

  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermission(status === 'granted');
    if (status !== 'granted') {
      Alert.alert('Camera Permission', 'Camera access is required to use this feature.', [{ text: 'OK' }]);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false
      });
      addCapturedImage({
        id: Date.now().toString(),
        uri: (photo as any).uri,
        mode: currentMode,
        timestamp: Date.now(),
        width: (photo as any).width,
        height: (photo as any).height
      });
      if (currentMode === 'analysis') {
        await handleSkinAnalysis((photo as any).uri);
      } else if (currentMode === 'tryon') {
        // @ts-expect-error navigation route typing handled by app
        navigation.navigate('VirtualTryOn', { imageUri: (photo as any).uri });
      } else {
        showToast({ type: 'success', message: 'Photo captured successfully!' });
      }
    } catch (error) {
      console.error('Capture error:', error);
      showToast({ type: 'error', message: 'Failed to capture photo' });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSkinAnalysis = async (imageUri: string) => {
    try {
      showLoading('Analyzing your skin...');
      const analysis = await createAnalysis(imageUri);
      const completed = await pollAnalysis(analysis.id);
      hideLoading();
      // @ts-expect-error navigation route typing handled by app
      navigation.navigate('AnalysisResults', { analysisId: completed.id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      hideLoading();
      showToast({ type: 'error', message: error.message || 'Analysis failed' });
    }
  };

  if (!isPermissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const camType = cameraType;
  const camFlash = flashMode;

  return (
    <View style={styles.container}>
      <ParticleSystem particleCount={10} />
      {/* Suppress potential prop typing mismatch for onFacesDetected */}
      {/** @ts-ignore */}
      {(null as any)}
      {/** Use 'any' wrapper to satisfy TS JSX typing */}
      {(() => {
        const Cam: any = Camera as any;
        return (
          <Cam
        ref={cameraRef}
        style={styles.camera}
        type={camType}
        flashMode={camFlash}
        onCameraReady={() => setCameraReady(true)}
            onFacesDetected={({ faces }: any) => setIsFaceDetected((faces?.length ?? 0) > 0)}
          >
            {currentMode === 'analysis' && <FaceGuideOverlay faceDetected={isFaceDetected} />}
            <ModeSelector style={styles.modeSelector} />
            <CameraControls
              onCapture={handleCapture}
              onToggleCamera={toggleCamera}
              onToggleFlash={() => {
                const modes: Array<'auto' | 'on' | 'off'> = ['auto', 'on', 'off'];
                const currentIndex = modes.indexOf(flashMode);
                const nextMode = modes[(currentIndex + 1) % modes.length];
                setFlashMode(nextMode);
              }}
              flashMode={flashMode}
              isCapturing={isCapturing}
              style={styles.controls}
            />
          </Cam>
        );
      })()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[1000]
  },
  camera: {
    flex: 1
  },
  modeSelector: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing[6]
  },
  permissionText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.neutral[700],
    textAlign: 'center',
    marginBottom: theme.spacing[6]
  },
  permissionButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing[8],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.lg
  },
  permissionButtonText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold as any
  }
});
