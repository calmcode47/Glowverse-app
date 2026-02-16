import { ARQualityManager, ARQualityPreset } from "../arQualityManager";

describe("ARQualityManager", () => {
  it("selects a preset and applies settings", () => {
    const preset = ARQualityManager.selectOptimalPreset();
    const settings = ARQualityManager.applyQualitySettings({ preset });
    expect(settings.frameRate).toBeGreaterThan(0);
    expect(settings.resolution.width).toBeGreaterThan(0);
  });

  it("downgrades and upgrades presets based on fps", () => {
    ARQualityManager.applyQualitySettings({ preset: ARQualityPreset.HIGH });
    ARQualityManager.adjustQualityDynamically({ fps: 10, avgFps: 10, droppedFrames: 0, memoryUsageMb: 100, timestamp: Date.now() });
    const s1 = ARQualityManager.getCurrentSettings()!;
    expect(s1.preset === ARQualityPreset.MEDIUM || s1.preset === ARQualityPreset.LOW).toBeTruthy();
    ARQualityManager.applyQualitySettings({ preset: ARQualityPreset.LOW });
    ARQualityManager.adjustQualityDynamically({ fps: 40, avgFps: 40, droppedFrames: 0, memoryUsageMb: 100, timestamp: Date.now() });
    const s2 = ARQualityManager.getCurrentSettings()!;
    expect(s2.preset === ARQualityPreset.MEDIUM || s2.preset === ARQualityPreset.HIGH).toBeTruthy();
  });
});

