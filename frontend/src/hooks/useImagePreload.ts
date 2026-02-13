import { useEffect } from "react";
import { Image as RNImage } from "react-native";
import { getCloudinaryUrl } from "../utils/cloudinaryTransform";

type PreloadOptions = {
  priority?: "low" | "normal" | "high";
  cache?: "immutable" | "web" | "cacheOnly";
  width?: number;
  height?: number;
};

export function useImagePreload(imageUrls: string[], options: PreloadOptions = {}) {
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;
    let FastImage: any = null;
    try {
      FastImage = require("react-native-fast-image");
    } catch {}
    if (FastImage && FastImage.preload) {
      const preloadImages = imageUrls.map((url) => ({
        uri: getCloudinaryUrl(url, { width: options.width || 400, height: options.height || 400, quality: "auto" }),
        priority: (FastImage.priority as any)[options.priority || "normal"],
        cache: (FastImage.cacheControl as any)[options.cache || "immutable"]
      }));
      FastImage.preload(preloadImages);
    } else {
      imageUrls.forEach((url) => {
        const u = getCloudinaryUrl(url, { width: options.width || 400, height: options.height || 400, quality: "auto" });
        (RNImage as any).prefetch?.(u);
      });
    }
  }, [JSON.stringify(imageUrls), options.width, options.height, options.priority, options.cache]);
}
