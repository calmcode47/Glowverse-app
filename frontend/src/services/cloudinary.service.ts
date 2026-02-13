import Constants from "expo-constants";

export type UploadResult = { url: string; publicId?: string };

export async function uploadImage(file: { uri: string; name?: string; type?: string }): Promise<UploadResult> {
  const cloudName = (Constants.expoConfig?.extra as any)?.cloudinary?.cloudName as string | undefined;
  const uploadPreset = (Constants.expoConfig?.extra as any)?.cloudinary?.uploadPreset as string | undefined;
  if (!cloudName || !uploadPreset) {
    // Fallback: return local uri for development if Cloudinary not configured
    return { url: file.uri };
  }
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const form = new FormData();
  form.append("file", { uri: file.uri, name: file.name || "analysis.jpg", type: file.type || "image/jpeg" } as any);
  form.append("upload_preset", uploadPreset);
  const res = await fetch(endpoint, { method: "POST", body: form as any });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Cloudinary upload failed");
  }
  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}
