import sharp from "sharp";
import { AppError } from "@utils/errors";

export class ImageService {
  static async validateImage(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      if (!metadata.format) {
        throw new AppError("Invalid image file", 400);
      }
      if (metadata.width && metadata.height) {
        if (metadata.width < 100 || metadata.height < 100) {
          throw new AppError("Image too small. Minimum size is 100x100px", 400);
        }
      }
      return true;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError("Invalid image file", 400);
    }
  }

  static async compressImage(buffer: Buffer, quality: number = 80): Promise<Buffer> {
    try {
      return await sharp(buffer).jpeg({ quality, progressive: true }).toBuffer();
    } catch {
      throw new AppError("Failed to compress image", 500);
    }
  }

  static async resizeImage(buffer: Buffer, width: number, height?: number): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(width, height, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
    } catch {
      throw new AppError("Failed to resize image", 500);
    }
  }

  static async getMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    try {
      return await sharp(buffer).metadata();
    } catch {
      throw new AppError("Failed to read image metadata", 500);
    }
  }

  static async toBase64(buffer: Buffer): Promise<string> {
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  }

  static async detectFace(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      return !!(metadata.width && metadata.height);
    } catch {
      return false;
    }
  }
}

export default ImageService;
