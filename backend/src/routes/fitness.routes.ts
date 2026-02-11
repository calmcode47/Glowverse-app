import { Router } from "express";
import FitnessController from "@controllers/fitness.controller";
import { authenticate } from "@middleware/auth";
import {
    validateLogActivity,
    validateSetGoal,
    validateActivityFilters,
    validateStatsPeriod
} from "@middleware/validation/fitness.validation";

const router = Router();

// All fitness routes require authentication
router.use(authenticate);

/**
 * Activity Routes
 */

// POST /api/v1/fitness/activities - Log new activity
router.post("/activities", validateLogActivity, FitnessController.logActivity);

// GET /api/v1/fitness/activities - Get activity history
router.get("/activities", validateActivityFilters, FitnessController.getActivities);

// GET /api/v1/fitness/activities/:id - Get single activity
router.get("/activities/:id", FitnessController.getActivity);

// PATCH /api/v1/fitness/activities/:id - Update activity
router.patch("/activities/:id", FitnessController.updateActivity);

// DELETE /api/v1/fitness/activities/:id - Delete activity
router.delete("/activities/:id", FitnessController.deleteActivity);

/**
 * Statistics Routes
 */

// GET /api/v1/fitness/stats - Get fitness statistics
router.get("/stats", validateStatsPeriod, FitnessController.getStatistics);

/**
 * Goal Routes
 */

// POST /api/v1/fitness/goals - Set new goal
router.post("/goals", validateSetGoal, FitnessController.setGoal);

// GET /api/v1/fitness/goals - Get active goals
router.get("/goals", FitnessController.getGoals);

// GET /api/v1/fitness/goals/history - Get goal history
router.get("/goals/history", FitnessController.getGoalHistory);

// DELETE /api/v1/fitness/goals/:id - Delete goal
router.delete("/goals/:id", FitnessController.deleteGoal);

export default router;
