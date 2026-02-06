import { Router } from "express";
import { uploadSingle, handleUploadError } from "@middleware/upload";
import { uploadImage } from "@controllers/upload.controller";
import { authenticate } from "@middleware/auth";
import { uploadLimiter } from "@middleware/rateLimiter";

const router = Router();

router.post("/", authenticate, uploadLimiter, uploadSingle, uploadImage);
router.use(handleUploadError);

export default router;
