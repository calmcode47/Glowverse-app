import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    Alert,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const sunglassesFrames = [
    { id: '1', name: 'Aviator', style: 'classic', color: '#F59E0B' },
    { id: '2', name: 'Wayfarer', style: 'sporty', color: '#3B82F6' },
    { id: '3', name: 'Round', style: 'vintage', color: '#8B5CF6' },
    { id: '4', name: 'Square', style: 'modern', color: '#10B981' },
    { id: '5', name: 'Cat Eye', style: 'retro', color: '#F43F5E' },
];

export default function ARCameraScreen() {
    const { theme, isDark } = useTheme();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [selectedFrame, setSelectedFrame] = useState(sunglassesFrames[0]);
    const [isRecording, setIsRecording] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        try {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        } catch (error) {
            console.error('Camera permission error:', error);
            setHasPermission(false);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                Alert.alert('Success', 'Photo captured!');
                console.log('Photo taken:', photo.uri);
            } catch (error) {
                console.error('Photo capture error:', error);
                Alert.alert('Error', 'Failed to capture photo');
            }
        }
    };

    const styles = createStyles(theme, isDark);

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <ProfessionalBackground />
                <View style={styles.permissionContainer}>
                    <MaterialCommunityIcons
                        name="camera-account"
                        size={80}
                        color={theme.colors.text.tertiary}
                    />
                    <Text style={styles.permissionText}>Requesting camera permission...</Text>
                </View>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <ProfessionalBackground />
                <View style={styles.permissionContainer}>
                    <MaterialCommunityIcons
                        name="camera-off"
                        size={80}
                        color={theme.colors.text.tertiary}
                    />
                    <Text style={styles.permissionText}>No access to camera</Text>
                    <Text style={styles.permissionSubtext}>
                        Please grant camera permissions to use AR try-on
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={requestCameraPermission}
                    >
                        <LinearGradient
                            colors={theme.colors.gradients.primary}
                            style={styles.retryButtonGradient}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera View */}
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
            >
                {/* AR Overlay */}
                <View style={styles.arOverlay}>
                    {/* Face detection guide */}
                    <View style={styles.faceGuide}>
                        <View style={[styles.faceCorner, styles.topLeft]} />
                        <View style={[styles.faceCorner, styles.topRight]} />
                        <View style={[styles.faceCorner, styles.bottomLeft]} />
                        <View style={[styles.faceCorner, styles.bottomRight]} />
                    </View>

                    {/* Virtual sunglasses overlay (placeholder) */}
                    <View style={styles.glassesOverlay}>
                        <View style={[styles.virtualGlasses, { borderColor: selectedFrame.color }]}>
                            <Text style={styles.glassesText}>{selectedFrame.name}</Text>
                        </View>
                    </View>
                </View>

                {/* Top Controls */}
                <LinearGradient
                    colors={[
                        isDark ? 'rgba(13, 17, 23, 0.8)' : 'rgba(249, 250, 251, 0.8)',
                        'transparent',
                    ]}
                    style={styles.topGradient}
                >
                    <View style={styles.topControls}>
                        <TouchableOpacity style={styles.controlButton}>
                            <MaterialCommunityIcons
                                name="close"
                                size={24}
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>
                        <Text style={styles.title}>AR Try-On</Text>
                        <TouchableOpacity style={styles.controlButton}>
                            <MaterialCommunityIcons
                                name="information-outline"
                                size={24}
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Frame Selector */}
                <View style={styles.frameSelector}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.framesContainer}
                    >
                        {sunglassesFrames.map((frame) => (
                            <TouchableOpacity
                                key={frame.id}
                                style={[
                                    styles.frameCard,
                                    selectedFrame.id === frame.id && styles.frameCardActive,
                                ]}
                                onPress={() => setSelectedFrame(frame)}
                            >
                                <LinearGradient
                                    colors={[frame.color + '40', frame.color + '20']}
                                    style={styles.frameGradient}
                                >
                                    <MaterialCommunityIcons
                                        name="sunglasses"
                                        size={24}
                                        color={frame.color}
                                    />
                                    <Text style={[styles.frameName, { color: frame.color }]}>
                                        {frame.name}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Bottom Controls */}
                <LinearGradient
                    colors={[
                        'transparent',
                        isDark ? 'rgba(13, 17, 23, 0.9)' : 'rgba(249, 250, 251, 0.9)',
                    ]}
                    style={styles.bottomGradient}
                >
                    <View style={styles.bottomControls}>
                        <TouchableOpacity style={styles.sideButton}>
                            <MaterialCommunityIcons
                                name="image-outline"
                                size={28}
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.captureButton}
                            onPress={takePicture}
                        >
                            <View style={styles.captureButtonInner}>
                                <LinearGradient
                                    colors={theme.colors.gradients.primary}
                                    style={styles.captureGradient}
                                >
                                    <MaterialCommunityIcons
                                        name="camera"
                                        size={32}
                                        color={theme.colors.text.inverse}
                                    />
                                </LinearGradient>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sideButton}>
                            <MaterialCommunityIcons
                                name="rotate-3d-variant"
                                size={28}
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.features}>
                        <FeatureTag icon="face-recognition" label="Face Detection" theme={theme} />
                        <FeatureTag icon="ruler" label="Best Fit" theme={theme} />
                        <FeatureTag icon="palette" label="Color Match" theme={theme} />
                    </View>
                </LinearGradient>
            </CameraView>
        </View>
    );
}

function FeatureTag({ icon, label, theme }: { icon: string; label: string; theme: any }) {
    return (
        <View style={[styles.featureTag, {
            backgroundColor: theme.colors.accent.emerald + '10',
            borderColor: theme.colors.accent.emerald + '30',
        }]}>
            <MaterialCommunityIcons
                name={icon as any}
                size={14}
                color={theme.colors.accent.emerald}
            />
            <Text style={[styles.featureText, { color: theme.colors.accent.emerald }]}>
                {label}
            </Text>
        </View>
    );
}

const createStyles = (theme: any, isDark: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background.primary,
        },
        camera: {
            flex: 1,
        },
        permissionContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: theme.spacing['3xl'],
        },
        permissionText: {
            fontSize: theme.typography.sizes.xl,
            color: theme.colors.text.primary,
            fontWeight: theme.typography.weights.semibold,
            marginTop: theme.spacing.lg,
            textAlign: 'center',
        },
        permissionSubtext: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.md,
            textAlign: 'center',
            lineHeight: 22,
        },
        retryButton: {
            marginTop: theme.spacing.xl,
            borderRadius: theme.radius.md,
            overflow: 'hidden',
        },
        retryButtonGradient: {
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.base,
        },
        retryButtonText: {
            color: theme.colors.text.inverse,
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
        },
        arOverlay: {
            ...StyleSheet.absoluteFillObject,
            alignItems: 'center',
            justifyContent: 'center',
        },
        faceGuide: {
            width: 250,
            height: 300,
            position: 'relative',
        },
        faceCorner: {
            position: 'absolute',
            width: 40,
            height: 40,
            borderWidth: 3,
            borderColor: theme.colors.accent.emerald,
        },
        topLeft: {
            top: 0,
            left: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0,
        },
        topRight: {
            top: 0,
            right: 0,
            borderLeftWidth: 0,
            borderBottomWidth: 0,
        },
        bottomLeft: {
            bottom: 0,
            left: 0,
            borderRightWidth: 0,
            borderTopWidth: 0,
        },
        bottomRight: {
            bottom: 0,
            right: 0,
            borderLeftWidth: 0,
            borderTopWidth: 0,
        },
        glassesOverlay: {
            position: 'absolute',
            top: '40%',
            alignItems: 'center',
        },
        virtualGlasses: {
            width: 180,
            height: 60,
            borderWidth: 3,
            borderRadius: theme.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        glassesText: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.primary,
            fontWeight: theme.typography.weights.bold,
        },
        topGradient: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingTop: Platform.OS === 'ios' ? 60 : 50,
        },
        topControls: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.base,
            paddingBottom: theme.spacing.base,
        },
        controlButton: {
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.glass.light.backgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontSize: theme.typography.sizes.lg,
            color: theme.colors.text.primary,
            fontWeight: theme.typography.weights.bold,
        },
        frameSelector: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 200,
        },
        framesContainer: {
            paddingHorizontal: theme.spacing.base,
            gap: theme.spacing.md,
        },
        frameCard: {
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
        },
        frameCardActive: {
            transform: [{ scale: 1.05 }],
        },
        frameGradient: {
            width: 100,
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: theme.radius.lg,
        },
        frameName: {
            fontSize: theme.typography.sizes.xs,
            marginTop: theme.spacing.xs,
            fontWeight: theme.typography.weights.medium,
        },
        bottomGradient: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        },
        bottomControls: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: theme.spacing['3xl'],
            marginBottom: theme.spacing.lg,
        },
        sideButton: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.glass.light.backgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
        },
        captureButton: {
            width: 80,
            height: 80,
            borderRadius: 40,
            padding: 4,
            backgroundColor: theme.colors.background.elevated,
            ...theme.shadows.lg,
        },
        captureButtonInner: {
            flex: 1,
            borderRadius: 38,
            overflow: 'hidden',
        },
        captureGradient: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        features: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing.md,
            paddingHorizontal: theme.spacing.base,
        },
        featureTag: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radius.full,
            borderWidth: 1,
            gap: 4,
        },
        featureText: {
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.medium,
        },
    });
