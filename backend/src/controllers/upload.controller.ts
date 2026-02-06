import { Request, Response } from "express";
import ImageService from "@services/image.service";
import StorageService from "@services/storage.service";

export async function uploadImage(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file" });
  }
  await ImageService.validateImage(file.buffer);
  const compressed = await ImageService.compressImage(file.buffer, 80);
  (file as any).buffer = compressed;
  const result = await StorageService.uploadImage(file, "perfect-corp");
  return res.status(200).json({ image: result });
}
