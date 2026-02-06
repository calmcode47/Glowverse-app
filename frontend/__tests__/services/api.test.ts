import { uploadImage, analyzeSkin, applyMakeup, getRecommendations } from "../../src/services/api/perfectcorp";
import { client } from "../../src/services/api/client";
import * as img from "../../src/utils/imageProcessor";

test("uploadImage calls client.post with form data", async () => {
  (img.validateImage as any).mockResolvedValue(true);
  const res = await uploadImage({ uri: "mock://image.jpg", filename: "image.jpg", mimeType: "image/jpeg" });
  expect(res.imageId).toBeDefined();
});

test("analyzeSkin posts analysis request", async () => {
  const r = await analyzeSkin("img1");
  expect(r).toBeDefined();
});

test("applyMakeup posts try-on request", async () => {
  const r = await applyMakeup("img1", "lip-rose");
  expect(r).toBeDefined();
});

test("getRecommendations gets product list", async () => {
  const items = await getRecommendations("analysis1");
  expect(Array.isArray(items)).toBe(true);
});
