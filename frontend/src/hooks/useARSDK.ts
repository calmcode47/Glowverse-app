import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { ARSDKService, type ApplyMakeupParams } from '../services/ar/ARSDKService';
import { ARSDKError, ARErrorCode, toARSDKError } from '../services/ar/errors';
import type { FaceDetectionResult, ScreenshotResult } from '../modules/ar-sdk/types';
import { ARAnalytics } from '../services/ar/AnalyticsService';

type UseARSDKResult = {
  isInitialized: boolean;
  isTracking: boolean;
  faceLandmarks: FaceDetectionResult | null;
  error: ARSDKError | null;
  initialize: () => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  applyMakeup: (params: ApplyMakeupParams) => Promise<void>;
  updateMakeupIntensity: (category: ApplyMakeupParams['category'], intensity: number) => Promise<void>;
  removeMakeup: (category?: ApplyMakeupParams['category']) => Promise<void>;
  captureScreenshot: () => Promise<ScreenshotResult>;
  resetError: () => void;
};

export function useARSDK(): UseARSDKResult {
  const [isInitialized, setInitialized] = useState(false);
  const [isTracking, setTracking] = useState(false);
  const [faceLandmarks, setFaceLandmarks] = useState<FaceDetectionResult | null>(null);
  const [error, setError] = useState<ARSDKError | null>(null);
  const faceDetectedAt = useRef<number | null>(null);

  useEffect(() => {
    ARSDKService.onFaceDetected(result => {
      if (!faceDetectedAt.current) {
        faceDetectedAt.current = Date.now();
        ARAnalytics.trackFaceDetected(0, result.quality);
      } else {
        const delta = Date.now() - faceDetectedAt.current;
        ARAnalytics.trackFaceDetected(delta, result.quality);
      }
      setFaceLandmarks(result);
    });
    ARSDKService.onFaceLost(() => {
      setFaceLandmarks(null);
    });
    return () => {};
  }, []);

  const initialize = useCallback(async () => {
    try {
      await ARSDKService.initialize();
      setInitialized(true);
      ARAnalytics.trackSessionStart(Platform.OS);
    } catch (e) {
      const err = toARSDKError(e);
      setError(err);
      throw err;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      await ARSDKService.startSession();
      setTracking(true);
    } catch (e) {
      const err = toARSDKError(e);
      setError(err);
      throw err;
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await ARSDKService.stopSession();
      setTracking(false);
      ARAnalytics.trackSessionEnd();
    } catch (e) {
      const err = toARSDKError(e);
      setError(err);
      throw err;
    }
  }, []);

  const applyMakeup = useCallback(async (params: ApplyMakeupParams) => {
    try {
      await ARSDKService.applyMakeup(params);
      ARAnalytics.trackProductApplied(
        {
          id: params.productId,
          name: params.productId,
          category: params.category,
          color: params.color,
          finish: params.texture === 'glossy' ? 'glossy' : params.texture === 'shimmer' ? 'shimmer' : 'matte',
          opacity: Math.max(0, Math.min(1, params.intensity / 100))
        },
        params.intensity / 100
      );
    } catch (e) {
      const err = toARSDKError(e);
      setError(err);
      throw err;
    }
  }, []);

  const updateMakeupIntensity = useCallback(async (category: ApplyMakeupParams['category'], intensity: number) => {
    try {
      await ARSDKService.updateMakeupIntensity(category, intensity);
    } catch (e) {
      const err = toARSDKError(e);
      setError(err);
      throw err;
    }
  }, []);

  const removeMakeup = useCallback(async (category?: ApplyMakeupParams['category']) => {
    try {
      await ARSDKService.removeMakeup(category);
    } catch (e) {
      const err = toARSDKError(e);
      setError(err);
      throw err;
    }
  }, []);

  const captureScreenshot = useCallback(async (): Promise<ScreenshotResult> => {
    try {
      const result = await ARSDKService.captureScreenshot();
      return result;
    } catch (e) {
      const err = toARSDKError(e);
      setError(err);
      throw err;
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  useEffect(() => {
    return () => {
      ARSDKService.dispose().catch(() => undefined);
    };
  }, []);

  return {
    isInitialized,
    isTracking,
    faceLandmarks,
    error,
    initialize,
    start,
    stop,
    applyMakeup,
    updateMakeupIntensity,
    removeMakeup,
    captureScreenshot,
    resetError
  };
}

