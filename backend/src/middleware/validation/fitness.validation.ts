import { body } from 'express-validator';
import { validate } from '../validation';
// User prompt said: import { validate } from '@/middleware/validation';
// I will assume the structure is src/middleware/validation.ts based on typical patterns.

export const validateLogActivity = [
    body('type').isIn([
        'CARDIO', 'STRENGTH', 'YOGA', 'STRETCHING', 'PILATES',
        'SPORTS', 'WALKING', 'RUNNING', 'CYCLING', 'SWIMMING',
        'HIKING', 'DANCING', 'MEDITATION', 'OTHER'
    ]).withMessage('Invalid activity type'),
    body('durationMinutes').isInt({ min: 1, max: 1440 }).withMessage('Duration must be between 1 and 1440 minutes'),
    body('intensity').isIn(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']).withMessage('Invalid intensity level'),
    body('caloriesBurned').optional().isInt({ min: 0 }).withMessage('Calories must be non-negative'),
    body('distance').optional().isFloat({ min: 0 }).withMessage('Distance must be non-negative'), // Changed to isFloat to match Decimal/number input handling
    body('steps').optional().isInt({ min: 0 }).withMessage('Steps must be non-negative'),
    body('heartRate').optional().isInt({ min: 30, max: 250 }).withMessage('Heart rate must be valid'),
    validate,
];

export const validateSetGoal = [
    body('type').isIn([
        'WEEKLY_MINUTES', 'WEEKLY_SESSIONS', 'MONTHLY_CALORIES',
        'DAILY_STEPS', 'WEEKLY_DISTANCE', 'CUSTOM'
    ]).withMessage('Invalid goal type'),
    body('title').notEmpty().withMessage('Title is required'),
    body('target').isFloat({ gt: 0 }).withMessage('Target must be greater than 0'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('period').isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).withMessage('Invalid period'),
    validate,
];
