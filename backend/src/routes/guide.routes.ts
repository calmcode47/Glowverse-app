import { Router } from 'express';
import { GuideController } from '../controllers/guide.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', GuideController.getGuides);
router.get('/featured', GuideController.getFeaturedGuides);
router.get('/trending', GuideController.getTrendingGuides);
router.get('/new', GuideController.getNewGuides);
router.get('/search', GuideController.searchGuides);
router.get('/category/:category', GuideController.getGuidesByCategory);
router.get('/my/bookmarks', authenticate, GuideController.getMyBookmarks); // Auth required for "my" routes, placed before :idOrSlug to avoid conflict
router.get('/:idOrSlug', optionalAuthenticate, GuideController.getGuide);
router.get('/:id/related', GuideController.getRelatedGuides);

// Authenticated routes
router.post('/:id/like', authenticate, GuideController.likeGuide);
router.delete('/:id/like', authenticate, GuideController.unlikeGuide);
router.post('/:id/bookmark', authenticate, GuideController.bookmarkGuide);
router.delete('/:id/bookmark', authenticate, GuideController.removeBookmark);
router.post('/:id/comment', authenticate, GuideController.addComment);
router.post('/:id/share', GuideController.trackShare); // Can be public or auth

export default router;
