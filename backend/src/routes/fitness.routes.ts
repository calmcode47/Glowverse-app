import { Router } from 'express';
import { FitnessController } from '../controllers/fitness.controller';
import { authenticate } from '../middleware/auth';
import {
    validateLogActivity,
    validateSetGoal
} from '../middleware/validation/fitness.validation';

const router = Router();

router.use(authenticate);

// Activities
router.post('/activities', validateLogActivity, FitnessController.logActivity);
router.get('/activities', FitnessController.getActivities);
router.get('/activities/:id', FitnessController.getActivity);
router.patch('/activities/:id', FitnessController.updateActivity);
router.delete('/activities/:id', FitnessController.deleteActivity);

// Statistics
router.get('/stats', FitnessController.getStatistics);

// Goals
router.post('/goals', validateSetGoal, FitnessController.setGoal);
router.get('/goals', FitnessController.getGoals);
router.get('/goals/history', FitnessController.getGoalHistory);
router.delete('/goals/:id', FitnessController.deleteGoal);

export default router;
