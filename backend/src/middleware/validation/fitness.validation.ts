import { body, query } from "express-validator";
import { validate } from "@middleware/validation";

/**
 * Validate log activity request
 */
export const validateLogActivity = [
    body('type').isIn(['CARDIO', 'STRENGTH', 'YOGA', 'STRETCHING', 'SPORTS', 'WALKING', 'RUNNING', 'CYCLING', 'SWIMMING', 'OTHER'])
        .withMessage('Invalid activity type'),
    body('durationMinutes').isInt({ min: 1, max: 1440 })
        .withMessage('Duration must be between 1 and 1440 minutes'),
    body('intensity').isIn(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'])
        .withMessage('Invalid intensity level'),
    body('title').optional().isString().isLength({ max: 200 }),
    body('description').optional().isString().isLength({ max: 1000 }),
    body('caloriesBurned').optional().isInt({ min: 0 }),
    body('distance').optional().isFloat({ min: 0 }),
    body('steps').optional().isInt({ min: 0 }),
    body('heartRate').optional().isInt({ min: 30, max: 250 }),
    body('activityDate').optional().isISO8601(),
    validate
];

/**
 * Validate set goal request
 */
export const validateSetGoal = [
    body('type').isIn(['WEEKLY_MINUTES', 'WEEKLY_SESSIONS', 'MONTHLY_CALORIES', 'DAILY_STEPS', 'CUSTOM'])
        .withMessage('Invalid goal type'),
    body('target').isFloat({ min: 1 })
        .withMessage('Target must be at least 1'),
    body('unit').isString().isLength({ min: 1, max: 50 })
        .withMessage('Unit is required and must be less than 50 characters'),
    body('period').isIn(['DAILY', 'WEEKLY', 'MONTHLY'])
        .withMessage('Invalid period'),
    body('startDate').optional().isISO8601(),
    validate
];

/**
 * Validate activity filters
 */
export const validateActivityFilters = [
    query('type').optional().isIn(['CARDIO', 'STRENGTH', 'YOGA', 'STRETCHING', 'SPORTS', 'WALKING', 'RUNNING', 'CYCLING', 'SWIMMING', 'OTHER']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
];

/**
 * Validate statistics period
 */
export const validateStatsPeriod = [
    query('period').optional().isIn(['week', 'month', 'year']),
    validate
];
