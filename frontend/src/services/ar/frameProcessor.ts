import { useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { ARSDKService } from './ARSDKService';

export function useARFrameProcessor() {
  const frameProcessor = useFrameProcessor((frame: any) => {
    'worklet';
    try {
      // Fallback approach: forward minimal metadata to JS for processing orchestration.
      // For production-grade performance, replace with a VisionCamera Frame Processor Plugin (JSI).
      const meta = {
        width: frame.width,
        height: frame.height,
        bytesPerRow: frame.bytesPerRow ?? 0,
        format: frame.pixelFormat ?? 'unknown',
        timestamp: frame.timestamp,
      };
      runOnJS(processFrameOnJS)(meta);
    } catch {
      // no-op
    }
  }, []);
  return frameProcessor;
}

async function processFrameOnJS(_meta: {
  width: number;
  height: number;
  bytesPerRow: number;
  format: string;
  timestamp: number;
}) {
  try {
    // Hook for scheduling native-side processing when available
    if (!ARSDKService.isInitialized) return;
    // Intentionally left as a no-op placeholder. Native layer should pull camera texture directly.
  } catch {
    // swallow to avoid frame drops
  }
}
