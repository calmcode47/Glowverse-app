import { Router } from "express";
import GuideController from "@controllers/guide.controller";
import { authenticate, optionalAuthenticate } from "@middleware/auth";

const router = Router();

// Public routes
router.get("/", GuideController.getGuides);
router.get("/trending", GuideController.getTrendingGuides);
router.get("/featured", GuideController.getFeaturedGuides);
router.get("/search", GuideController.searchGuides);
router.get("/category/:category", GuideController.getGuidesByCategory);

// Optional auth (for personalized data like isLiked, isBookmarked)
router.get("/:idOrSlug", optionalAuthenticate, GuideController.getGuide);

// Public stats and related
router.get("/:id/related", GuideController.getRelatedGuides);
router.get("/:id/stats", GuideController.getGuideStats);

// Authenticated routes - engagement actions
router.post("/:id/like", authenticate, GuideController.likeGuide);
router.delete("/:id/like", authenticate, GuideController.unlikeGuide);
router.post("/:id/bookmark", authenticate, GuideController.bookmarkGuide);
router.delete("/:id/bookmark", authenticate, GuideController.removeBookmark);

// User bookmarks (must be before /:idOrSlug to avoid conflict)
router.get("/user/bookmarks", authenticate, GuideController.getUserBookmarks);

export default router;
