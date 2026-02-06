import { Router } from "express";
import { query } from "express-validator";
import AnalysisController from "@controllers/analysis.controller";
import { validate } from "@middleware/validation";
import { authenticate } from "@middleware/auth";
import { uploadSingle, handleUploadError } from "@middleware/upload";
import { perfectCorpLimiter } from "@middleware/rateLimiter";

const router = Router();

router.use(authenticate);

router.post("/skin", perfectCorpLimiter, uploadSingle, handleUploadError, AnalysisController.createSkinAnalysis);

router.get(
  "/",
  validate([
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("type").optional().isIn(["SKIN_ANALYSIS", "FACE_SHAPE", "SKIN_TONE", "HAIR_ANALYSIS"]),
    query("status").optional().isIn(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
  ]),
  AnalysisController.getAllAnalyses
);

router.get("/:id", AnalysisController.getAnalysis);
router.get("/:id/recommendations", AnalysisController.getRecommendations);
router.delete("/:id", AnalysisController.deleteAnalysis);

export default router;
