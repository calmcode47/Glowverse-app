import { client } from "./client";
import { endpoints, UploadImageRequest, UploadImageResponse, AnalyzeSkinRequest, AnalyzeSkinResponse, ApplyMakeupRequest, ApplyMakeupResponse, RecommendationsRequest, RecommendationsResponse } from "./endpoints";
import { validateImage, compressImage } from "@utils/imageProcessor";
import { formatResponse } from "@utils/apiHelper";

/**
 * Uploads an image using multipart/form-data
 */
export async function uploadImage(image: { uri: string; filename?: string; mimeType?: "image/jpeg" | "image/png" }): Promise<UploadImageResponse> {
  const ok = await validateImage(image.uri);
  const uriToSend = ok ? image.uri : await compressImage(image.uri, 0.85);
  const form = new FormData();
  const name = image.filename || "upload.jpg";
  const type = image.mimeType || "image/jpeg";
  form.append("file", { uri: uriToSend, name, type } as any);
  const res = await client.post<UploadImageResponse>(endpoints.uploadImage, form, { retry: 2 });
  return formatResponse(res.data);
}

/**
 * Runs skin analysis for an uploaded image
 */
export async function analyzeSkin(imageId: string): Promise<AnalyzeSkinResponse> {
  const payload: AnalyzeSkinRequest = { imageId };
  const res = await client.post<AnalyzeSkinResponse>(endpoints.analyzeSkin, payload, { retry: 2 });
  return formatResponse(res.data);
}

/**
 * Applies virtual makeup on the provided image
 */
export async function applyMakeup(imageId: string, makeupId: string): Promise<ApplyMakeupResponse> {
  const payload: ApplyMakeupRequest = { imageId, makeupId };
  const res = await client.post<ApplyMakeupResponse>(endpoints.applyMakeup, payload, { retry: 2 });
  return formatResponse(res.data);
}

/**
 * Gets product recommendations based on an analysis
 */
export async function getRecommendations(analysisId: string): Promise<RecommendationsResponse["items"]> {
  const payload: RecommendationsRequest = { analysisId };
  const res = await client.get<RecommendationsResponse>(endpoints.recommendations, { params: payload, retry: 2 });
  return formatResponse(res.data.items);
}
