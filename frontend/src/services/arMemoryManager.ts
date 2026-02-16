import { TextureManager } from './ar/TextureManager';

type Texture = { uri: string; width: number; height: number };

class ARMemoryManagerClass {
  private texturePool = new Map<string, Texture>();
  private maxCacheSize = 50 * 1024 * 1024;
  private tm = new TextureManager(50);

  async loadTexture(productId: string, uri?: string): Promise<Texture> {
    const key = uri || productId;
    if (this.texturePool.has(key)) return this.texturePool.get(key)!;
    if (uri) {
      const size = await this.tm.preloadTexture(uri);
      const tex = { uri, width: size.width, height: size.height };
      this.texturePool.set(key, tex);
      this.optimizeMemoryUsage();
      return tex;
    }
    const tex = { uri: 'about:blank', width: 0, height: 0 };
    this.texturePool.set(key, tex);
    this.optimizeMemoryUsage();
    return tex;
  }

  releaseTexture(productId: string): void {
    for (const [k] of this.texturePool) {
      if (k.includes(productId)) {
        this.texturePool.delete(k);
        this.tm.clearTexture(k);
      }
    }
  }

  clearCache(): void {
    this.texturePool.clear();
    this.tm.clearAll();
  }

  onLowMemory(): void {
    this.clearCache();
  }

  optimizeMemoryUsage(): void {
    // Use TextureManager's LRU logic and keep JS pool minimal
    // No additional policy needed here
  }
}

export const ARMemoryManager = new ARMemoryManagerClass();

