import cloudinary from "@config/cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { AppError } from "@utils/errors";

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
}

export class StorageService {
  static async uploadImage(file: Express.Multer.File, folder: string = "perfect-corp"): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }, { width: 2048, height: 2048, crop: "limit" }]
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            return reject(new AppError("Failed to upload image", 500));
          }
          if (!result) {
            return reject(new AppError("Upload result is undefined", 500));
          }
          return resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            resourceType: result.resource_type
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  static async uploadBase64(base64Data: string, folder: string = "perfect-corp"): Promise<UploadResult> {
    try {
      const result = await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }, { width: 2048, height: 2048, crop: "limit" }]
      });
      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resource_type
      };
    } catch {
      throw new AppError("Failed to upload base64 image", 500);
    }
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      throw new AppError("Failed to delete image", 500);
    }
  }

  static getOptimizedUrl(
    publicId: string,
    options?: { width?: number; height?: number; crop?: string; quality?: string | number }
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width: options?.width,
          height: options?.height,
          crop: options?.crop || "fill",
          quality: options?.quality || "auto",
          fetch_format: "auto"
        }
      ]
    });
  }

  static getThumbnailUrl(publicId: string, size: number = 200): string {
    return this.getOptimizedUrl(publicId, { width: size, height: size, crop: "fill" });
  }
}

export default StorageService;
