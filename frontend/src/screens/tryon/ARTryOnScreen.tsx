import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    Dimensions,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import * as TryOnAPI from '../../services/api/tryon.api';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import FaceDetectionIndicator from '../../components/ar/FaceDetectionIndicator';
import { useARSDK } from '../../hooks/useARSDK';
import { ARSDKError, ARErrorCode } from '../../services/ar/errors';
import { ARAnalytics } from '../../services/ar/AnalyticsService';
import { useARFrameProcessor } from '../../services/ar/frameProcessor';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { ARAnalyticsProvider, useARAnalyticsContext } from '../../contexts/ARAnalyticsContext';
import { ARPerformanceMonitor } from '../../services/arPerformanceMonitor';
import { ARSDKModule } from '../../modules/ar-sdk';

function ARTryOnScreenInner({ route, navigation }: any) {
    const { productId } = route.params;
    const { theme } = useTheme();

    const camera = useRef<Camera>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [arEnabled, setArEnabled] = useState(false);
    const device = useCameraDevice('front');
    const [sdkInitializing, setSdkInitializing] = useState(false);
    const [applying, setApplying] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [error, setError] = useState<ARSDKError | null>(null);
    const { isInitialized, isTracking, faceLandmarks, initialize, start, stop, applyMakeup, removeMakeup, captureScreenshot, resetError } = useARSDK();
    const frameProcessor = useARFrameProcessor();
    const [fps, setFps] = useState<number>(0);

    useEffect(() => {
        handlePermissions();
        startTryOnSession();
    }, []);

    useEffect(() => {
        let interval: any;
        if (isInitialized) {
            interval = setInterval(async () => {
                try {
                    const m = await ARSDKModule.getPerformanceMetrics();
                    setFps(m.fps || 0);
                } catch {}
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isInitialized]);

    const handlePermissions = async () => {
        if (!hasPermission) {
            const result = await requestPermission();
            if (!result) {
                Alert.alert(
                    'Permission Denied',
                    'Camera access is required for AR Try-On.',
                    [{ text: 'Go Back', onPress: () => navigation.goBack() }]
                );
            }
        }
    };

    const { startSession, endSession, trackProductTryOn, trackScreenshot, trackProductAddedToCart } = useARAnalyticsContext();

    const startTryOnSession = async () => {
        try {
            const session = await TryOnAPI.createSession(productId);
            setSessionId(session.id);
            startSession('product_page');
        } catch (error) {
            console.error('Session error:', error);
            // Fallback or alert
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setSdkInitializing(true);
                await initialize();
                await start();
            } catch (e) {
                const err = e as ARSDKError;
                if (mounted) setError(err);
            } finally {
                if (mounted) setSdkInitializing(false);
            }
        })();
        return () => {
            mounted = false;
            stop().catch(() => undefined);
            endSession();
        };
    }, []);

    const getErrorMessage = (e: ARSDKError): string => {
        switch (e.code) {
            case ARErrorCode.LICENSE_INVALID:
                return 'AR feature is temporarily unavailable';
            case ARErrorCode.CAMERA_PERMISSION_DENIED:
                return 'Camera permission is required';
            case ARErrorCode.FACE_NOT_DETECTED:
                return 'Please position your face in the frame';
            default:
                return 'An AR error occurred';
        }
    };

    const onApplyMakeup = async () => {
        setApplying(true);
        try {
            setArEnabled(true);
            await applyMakeup({
                productId,
                category: 'lipstick',
                color: '#FF6B9D',
                intensity: 80
            });
            if (sessionId) {
                await TryOnAPI.applyProduct(sessionId, productId);
            }
            trackProductTryOn(productId);
        } catch (e) {
            const err = e as ARSDKError;
            setError(err);
            Alert.alert('Error', getErrorMessage(err));
            setArEnabled(false);
        } finally {
            setApplying(false);
        }
    };

    const capturePhoto = async () => {
        if (!camera.current) return;
        setCapturing(true);
        try {
            const screenshot = await captureScreenshot();
            navigation.navigate('Results', {
                imageUri: screenshot.uri,
                productId,
            });
            trackScreenshot([productId], false);
        } catch (e) {
            const err = e as ARSDKError;
            setError(err);
            Alert.alert('Error', getErrorMessage(err));
        } finally {
            setCapturing(false);
        }
    };

    if (!hasPermission || !device) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ProfessionalBackground />
                <MaterialCommunityIcons name="camera-off" size={64} color={theme.colors.text.secondary} />
                <Text style={[styles.message, { color: theme.colors.text.primary }]}>
                    {!hasPermission ? 'Camera access needed' : 'Initializing camera...'}
                </Text>
                <TouchableOpacity style={styles.retryBtn} onPress={handlePermissions}>
                    <Text style={styles.retryText}>Grant Access</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
                frameProcessor={frameProcessor as any}
                testID="ar-camera-view"
            />

            <FaceDetectionIndicator
                detected={!!faceLandmarks}
                quality={(faceLandmarks?.quality as any) ?? null}
            />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Close try-on"
                    testID="tryon-close"
                >
                    <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>AR Try-On</Text>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>

                <View style={{ width: 40 }} />
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomBar}>
                <View style={styles.controlsRow}>
                    {arEnabled ? (
                        <>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                    removeMakeup().catch(() => undefined);
                                    setArEnabled(false);
                                }}
                                accessibilityLabel="Reset makeup"
                                testID="tryon-reset"
                            >
                                <MaterialCommunityIcons name="refresh" size={24} color="#FFFFFF" />
                                <Text style={styles.buttonText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.captureButton}
                                onPress={capturePhoto}
                                accessibilityLabel="Capture screenshot"
                                testID="tryon-capture"
                            >
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                  trackProductAddedToCart(productId);
                                  navigation.navigate('ProductDetail', { productId });
                                }}
                                accessibilityLabel="Open cart"
                                testID="tryon-cart"
                            >
                                <MaterialCommunityIcons name="shopping-outline" size={24} color="#FFFFFF" />
                                <Text style={styles.buttonText}>Cart</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={onApplyMakeup}
                            accessibilityLabel="Apply makeup"
                            testID="tryon-apply"
                        >
                            <MaterialCommunityIcons name="star-four-points" size={24} color="#FFFFFF" />
                            <Text style={styles.applyButtonText}>Apply Makeup</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.fpsBadge} accessibilityLabel="FPS counter">
                <Text style={styles.fpsText}>{fps} FPS</Text>
            </View>

            <LoadingOverlay visible={sdkInitializing} message="Initializing AR..." />
            <LoadingOverlay visible={applying} message="Applying look..." />
            <LoadingOverlay visible={capturing} message="Capturing..." />
        </View>
    );
}

export default function ARTryOnScreen(props: any) {
    return (
        <ErrorBoundary onRetry={() => {}}>
          <ARAnalyticsProvider>
            <ARTryOnScreenInner {...props} />
          </ARAnalyticsProvider>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    retryBtn: {
        backgroundColor: '#FF6B9D',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    circleButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    liveText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 50,
        paddingHorizontal: 30,
        // backgroundGradient: 'linear' as any, // Conceptual
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FF6B9D',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 30,
        shadowColor: '#FF6B9D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    captureButton: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#FF6B9D',
    },
    captureButtonInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FF6B9D',
    },
    secondaryButton: {
        alignItems: 'center',
        gap: 4,
        width: 60,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    fpsBadge: {
        position: 'absolute',
        right: 12,
        bottom: 140,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    fpsText: {
        color: '#fff',
        fontWeight: '800'
    }
});
