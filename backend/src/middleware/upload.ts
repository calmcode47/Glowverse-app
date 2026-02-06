import multer from "multer";
import { Request } from "express";
import { AppError } from "@utils/errors";
import env from "@config/env";

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  void req;
  if (env.upload.allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Allowed types: ${env.upload.allowedFileTypes.join(", ")}`, 400));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.upload.maxFileSize },
  fileFilter
});

export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 5);

export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  void req;
  void res;
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(`File too large. Maximum size is ${env.upload.maxFileSize / 1024 / 1024}MB`, 400));
    }
    return next(new AppError(error.message, 400));
  }
  return next(error);
};

export default {
  uploadSingle,
  uploadMultiple,
  handleUploadError
};
