/**
 * Landmark Processor
 * 
 * Processes and transforms facial landmarks from AR SDK into usable coordinates.
 * Applies smoothing, normalization, and calculates makeup application regions.
 * 
 * @module LandmarkProcessor
 */

import type {
    FaceLandmark,
    FaceLandmarkGroups,
    FaceBounds,
    FaceOrientation,
} from '../../modules/ar-sdk/types';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Kalman filter for landmark smoothing
 */
class KalmanFilter {
    private x: number = 0;
    private p: number = 1;
    private readonly q: number = 0.001; // Process noise
    private readonly r: number = 0.01;   // Measurement noise

    update(measurement: number): number {
        // Prediction
        const predictedP = this.p + this.q;

        // Update
        const k = predictedP / (predictedP + this.r);
        this.x = this.x + k * (measurement - this.x);
        this.p = (1 - k) * predictedP;

        return this.x;
    }

    reset(): void {
        this.x = 0;
        this.p = 1;
    }
}

/**
 * Landmark Processor class
 */
export class LandmarkProcessor {
    private smoothingFilters: Map<string, KalmanFilter> = new Map();
    private useSmoothening: boolean;

    constructor(useSmoothening: boolean = true) {
        this.useSmoothening = useSmoothening;
    }

    /**
     * Normalize landmark coordinates to screen space
     * @param landmarks Raw landmarks (0-1 normalized or pixel coordinates)
     * @param fromNormalized Whether input is normalized 0-1
     * @returns Pixel coordinates
     */
    normalizeToScreen(landmarks: FaceLandmark[], fromNormalized: boolean = true): FaceLandmark[] {
        return landmarks.map(landmark => {
            let x = landmark.x;
            let y = landmark.y;

            if (fromNormalized) {
                x = x * SCREEN_WIDTH;
                y = y * SCREEN_HEIGHT;
            }

            return {
                x,
                y,
                z: landmark.z,
                confidence: landmark.confidence,
            };
        });
    }

    /**
     * Apply smoothing to landmarks using Kalman filter
     * @param landmarks Input landmarks
     * @param landmarkId Unique identifier for this landmark set
     * @returns Smoothed landmarks
     */
    smoothLandmarks(landmarks: FaceLandmark[], landmarkId: string = 'default'): FaceLandmark[] {
        if (!this.useSmoothening) {
            return landmarks;
        }

        return landmarks.map((landmark, index) => {
            const keyX = `${landmarkId}_${index}_x`;
            const keyY = `${landmarkId}_${index}_y`;

            if (!this.smoothingFilters.has(keyX)) {
                this.smoothingFilters.set(keyX, new KalmanFilter());
                this.smoothingFilters.set(keyY, new KalmanFilter());
            }

            const filterX = this.smoothingFilters.get(keyX)!;
            const filterY = this.smoothingFilters.get(keyY)!;

            return {
                x: filterX.update(landmark.x),
                y: filterY.update(landmark.y),
                z: landmark.z,
                confidence: landmark.confidence,
            };
        });
    }

    /**
     * Calculate face bounds from landmarks
     * @param landmarks Face landmarks
     * @returns Face bounding box
     */
    calculateFaceBounds(landmarks: FaceLandmark[]): FaceBounds {
        if (landmarks.length === 0) {
            return {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                centerX: 0,
                centerY: 0,
            };
        }

        const xs = landmarks.map(l => l.x);
        const ys = landmarks.map(l => l.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const width = maxX - minX;
        const height = maxY - minY;

        return {
            left: minX,
            top: minY,
            width,
            height,
            centerX: minX + width / 2,
            centerY: minY + height / 2,
        };
    }

    /**
     * Group landmarks by facial features
     * @param landmarks All 68+ facial landmarks
     * @returns Grouped landmarks
     */
    groupLandmarks(landmarks: FaceLandmark[]): FaceLandmarkGroups {
        // Standard 68-point landmark model indices
        // https://ibug.doc.ic.ac.uk/resources/facial-point-annotations/

        return {
            faceContour: landmarks.slice(0, 17),
            leftEyebrow: landmarks.slice(17, 22),
            rightEyebrow: landmarks.slice(22, 27),
            nose: landmarks.slice(27, 36),
            leftEye: landmarks.slice(36, 42),
            rightEye: landmarks.slice(42, 48),
            lipsOuter: landmarks.slice(48, 60),
            lipsInner: landmarks.slice(60, 68),
            leftCheek: landmarks[1] || landmarks[0],  // Approximate
            rightCheek: landmarks[15] || landmarks[0], // Approximate
        };
    }

    /**
     * Calculate face orientation from landmarks
     * @param landmarks Face landmarks
     * @returns Euler angles (pitch, yaw, roll)
     */
    calculateOrientation(landmarks: FaceLandmark[]): FaceOrientation {
        // Simplified orientation estimation
        // For production, use proper pose estimation algorithms

        if (landmarks.length < 68) {
            return { pitch: 0, yaw: 0, roll: 0 };
        }

        // Use nose tip, chin, and eye positions
        const noseTip = landmarks[30];
        const chin = landmarks[8];
        const leftEye = landmarks[36];
        const rightEye = landmarks[45];

        // Calculate yaw (left-right rotation)
        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const faceWidth = Math.abs(rightEye.x - leftEye.x);
        const noseOffset = noseTip.x - eyeCenterX;
        const yaw = (noseOffset / faceWidth) * 30; // Approximate angle

        // Calculate pitch (up-down rotation)
        const eyeCenterY = (leftEye.y + rightEye.y) / 2;
        const faceHeight = Math.abs(chin.y - eyeCenterY);
        const noseOffsetY = noseTip.y - eyeCenterY;
        const pitch = (noseOffsetY / faceHeight) * 30; // Approximate angle

        // Calculate roll (tilt)
        const eyeDeltaY = rightEye.y - leftEye.y;
        const eyeDeltaX = rightEye.x - leftEye.x;
        const roll = Math.atan2(eyeDeltaY, eyeDeltaX) * (180 / Math.PI);

        return {
            pitch: Math.max(-45, Math.min(45, pitch)),
            yaw: Math.max(-45, Math.min(45, yaw)),
            roll: Math.max(-45, Math.min(45, roll)),
        };
    }

    /**
     * Get makeup application region for category
     * @param landmarks Grouped landmarks
     * @param category Makeup category
     * @returns Landmarks array for specific region
     */
    getMakeupRegion(landmarkGroups: FaceLandmarkGroups, category: string): FaceLandmark[] {
        switch (category) {
            case 'lipstick':
                return [...landmarkGroups.lipsOuter, ...landmarkGroups.lipsInner];

            case 'eyeshadow':
                return [...landmarkGroups.leftEye, ...landmarkGroups.rightEye];

            case 'eyeliner':
                return [...landmarkGroups.leftEye, ...landmarkGroups.rightEye];

            case 'blush':
                return [landmarkGroups.leftCheek, landmarkGroups.rightCheek];

            case 'foundation':
                return landmarkGroups.faceContour;

            default:
                return [];
        }
    }

    /**
     * Reset smoothing filters
     */
    resetSmoothing(): void {
        this.smoothingFilters.clear();
    }

    /**
     * Enable/disable smoothing
     */
    setSmoothing(enabled: boolean): void {
        this.useSmoothening = enabled;
        if (!enabled) {
            this.resetSmoothing();
        }
    }
}
