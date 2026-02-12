import { Router } from 'express';
import SearchController from '../controllers/search.controller';

const router = Router();

router.get('/', SearchController.globalSearch);
router.get('/suggestions', SearchController.getSearchSuggestions);
router.get('/popular', SearchController.getPopularSearches);

export default router;
