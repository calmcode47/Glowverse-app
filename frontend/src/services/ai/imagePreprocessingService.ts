import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { imageValidationService } from "./imageValidation.service";

export type PreparedImage = {
  base64: string;
  uri: string;
  width: number;
  height: number;
  quality: number;
};

class ImagePreprocessingService {
  private maxSize = 1024;
  private targetBytes = 500 * 1024; // 500KB

  async prepareForAnalysis(imageUri: string): Promise<PreparedImage> {
    const optimized = await imageValidationService.optimizeForAnalysis(imageUri);
    const compressedUri = await this.compressToTarget(optimized.uri, this.targetBytes);
    const base64 = await imageValidationService.convertToBase64(compressedUri);
    const qualityInfo = await imageValidationService.checkImageQuality(compressedUri);
    return {
      base64,
      uri: compressedUri,
      width: optimized.width,
      height: optimized.height,
      quality: qualityInfo.quality === "good" ? 1 : qualityInfo.quality === "acceptable" ? 0.7 : 0.4
    };
  }

  private async compressToTarget(uri: string, targetBytes: number): Promise<string> {
    let currentUri = uri;
    for (let attempt = 0; attempt < 5; attempt++) {
      const info = await FileSystem.getInfoAsync(currentUri);
      const size = (info as any).size || 0;
      if (size <= targetBytes) return currentUri;
      const quality = Math.max(0.3, 0.9 - attempt * 0.15);
      const res = await ImageManipulator.manipulateAsync(currentUri, [], { compress: quality, format: ImageManipulator.SaveFormat.JPEG });
      currentUri = res.uri;
    }
    return currentUri;
  }
}

export const imagePreprocessingService = new ImagePreprocessingService();

