import { Image } from "react-native";
import { getCloudinaryUrl } from "@utils/cloudinaryTransform";

type PreloadOptions = {
  width?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
  priority?: "low" | "normal" | "high";
};

class ImagePreloaderService {
  private preloadQueue: Map<string, Promise<void>> = new Map();

  async preload(url?: string, options: PreloadOptions = {}): Promise<void> {
    if (!url) return;
    if (this.preloadQueue.has(url)) {
      const existing = this.preloadQueue.get(url)!;
      return existing;
    }
    const transformedUrl = getCloudinaryUrl(url, {
      width: options.width || 400,
      quality: options.quality ?? "auto",
      format: options.format ?? "auto"
    });
    const promise = (Image as any).prefetch?.(transformedUrl)
      .then(() => this.preloadQueue.delete(url))
      .catch(() => this.preloadQueue.delete(url));
    this.preloadQueue.set(url, promise);
    return promise;
  }

  preloadForList(
    items: Array<{ image?: string; images?: string[] }>,
    visibleRange: { start: number; end: number },
    lookahead: number = 2
  ): void {
    const startIndex = Math.max(0, visibleRange.start);
    const endIndex = Math.min(items.length, visibleRange.end + lookahead);
    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];
      const url = item?.image || (Array.isArray(item?.images) ? item.images[0] : undefined);
      this.preload(url, { priority: "normal" });
    }
  }
}

export const imagePreloader = new ImagePreloaderService();
