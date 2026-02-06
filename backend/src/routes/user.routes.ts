import { Router } from "express";
import { body } from "express-validator";
import UserController from "@controllers/user.controller";
import { validate } from "@middleware/validation";
import { authenticate } from "@middleware/auth";
import { uploadSingle, handleUploadError } from "@middleware/upload";

const router = Router();

router.use(authenticate);

router.patch(
  "/profile",
  validate([
    body("name").optional().trim().isLength({ min: 2, max: 50 }),
    body("phoneNumber").optional().isMobilePhone("any"),
    body("dateOfBirth").optional().isISO8601(),
    body("gender").optional().isIn(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
  ]),
  UserController.updateProfile
);

router.patch(
  "/preferences",
  validate([body("skinType").optional().isString(), body("skinTone").optional().isString()]),
  UserController.updatePreferences
);

router.post("/avatar", uploadSingle, handleUploadError, UserController.uploadAvatar);
router.get("/stats", UserController.getStats);
router.get("/history", UserController.getHistory);
router.delete("/history/:id", UserController.deleteHistoryItem);

export default router;
