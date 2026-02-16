import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ViewStyle, Platform, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { ARSDKService } from '../../services/ar/ARSDKService';
import { ARSDKModule } from '../../modules/ar-sdk';

type Props = {
  onFaceDetected?: (data: any) => void;
  onProductApplied?: (productId: string) => void;
  onError?: (error: any) => void;
  onCapture?: (imageUri: string) => void;
  style?: ViewStyle;
};

export default function ARCameraView({ onFaceDetected, onProductApplied, onError, onCapture, style }: Props) {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        const r = await requestPermission();
        if (!r) {
          onError?.({ code: 'camera_permission_denied' });
          return;
        }
      }
      try {
        await ARSDKService.initialize();
        await ARSDKService.startSession();
        setReady(true);
      } catch (e) {
        onError?.(e);
      }
    })();
    const unsub = ARSDKModule.addEventListener((ev) => {
      if (ev.type === 'faceDetected') onFaceDetected?.(ev.result);
      if (ev.type === 'productApplied') onProductApplied?.(ev.product?.id || '');
      if (ev.type === 'error') onError?.(ev.error);
    });
    return () => {
      unsub?.();
      ARSDKService.stopSession().catch(() => {});
    };
  }, []);

  const onCapturePress = async () => {
    try {
      const res = await ARSDKService.captureScreenshot();
      onCapture?.(res.uri);
    } catch (e) {
      onError?.(e);
    }
  };

  if (!device) {
    return <View style={[styles.container, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={ready}
        photo={false}
      />
      {/* Consumers can overlay capture/controls and call onCapturePress via ref/higher-level control */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' }
});

