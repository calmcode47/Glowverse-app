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

// Note: PerfectCorp SDK might need to be linked separately if npm installation is not available
// We are following the suggested implementation structure.
let PerfectCorpAR: any;
try {
    PerfectCorpAR = require('@perfectcorp/react-native-ar').PerfectCorpAR;
} catch (e) {
    console.warn('PerfectCorp SDK not found, using mock implementation');
    PerfectCorpAR = {
        initialize: async () => console.log('Mock AR Init'),
        applyProduct: async () => console.log('Mock AR Apply'),
        clearAll: () => console.log('Mock AR Clear'),
        View: ({ style }: any) => <View style={[style, { backgroundColor: 'rgba(255, 107, 157, 0.2)', alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#fff' }}>AR Overlay Mock</Text></View>
    };
}

export default function ARTryOnScreen({ route, navigation }: any) {
    const { productId } = route.params;
    const { theme } = useTheme();

    const camera = useRef<Camera>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [arEnabled, setArEnabled] = useState(false);
    const device = useCameraDevice('front');

    useEffect(() => {
        handlePermissions();
        startTryOnSession();
    }, []);

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

    const startTryOnSession = async () => {
        try {
            const session = await TryOnAPI.createSession(productId);
            setSessionId(session.id);
        } catch (error) {
            console.error('Session error:', error);
            // Fallback or alert
        }
    };

    const applyMakeup = async () => {
        setArEnabled(true);
        try {
            if (PerfectCorpAR.initialize) {
                await PerfectCorpAR.initialize({
                    apiKey: 'PROD_VTRYON_KEY_2026_X8', // Placeholder for actual key
                });

                await PerfectCorpAR.applyProduct({
                    productId: productId,
                    type: 'lipstick', // Defaulting to lipstick for this demo
                });
            }

            if (sessionId) {
                await TryOnAPI.applyProduct(sessionId, productId);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to apply makeup effects.');
            setArEnabled(false);
        }
    };

    const capturePhoto = async () => {
        if (!camera.current) return;

        try {
            const photo = await camera.current.takePhoto({
                flash: 'off',
                enableShutterSound: true,
            });

            navigation.navigate('Results', {
                imageUri: `file://${photo.path}`,
                productId,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to capture photo');
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
            />

            {arEnabled && PerfectCorpAR.View && (
                <PerfectCorpAR.View style={StyleSheet.absoluteFill} />
            )}

            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => navigation.goBack()}
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
                                    PerfectCorpAR.clearAll && PerfectCorpAR.clearAll();
                                    setArEnabled(false);
                                }}
                            >
                                <MaterialCommunityIcons name="refresh" size={24} color="#FFFFFF" />
                                <Text style={styles.buttonText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.captureButton}
                                onPress={capturePhoto}
                            >
                                <View style={styles.captureButtonInner} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => navigation.navigate('ProductDetail', { productId })}
                            >
                                <MaterialCommunityIcons name="shopping-outline" size={24} color="#FFFFFF" />
                                <Text style={styles.buttonText}>Cart</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={applyMakeup}
                        >
                            <MaterialCommunityIcons name="sparkles" size={24} color="#FFFFFF" />
                            <Text style={styles.applyButtonText}>Apply Makeup</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
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
});
