/**
 * Privacy Consent Modal
 * 
 * Modal for obtaining user consent before AI skin analysis.
 */

import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyConsentModalProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export default function PrivacyConsentModal({
    visible,
    onAccept,
    onDecline,
}: PrivacyConsentModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onDecline}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Ionicons name="shield-checkmark" size={48} color="#8B5CF6" />
                        <Text style={styles.title}>AI Skin Analysis</Text>
                        <Text style={styles.subtitle}>Privacy & Data Usage</Text>
                    </View>

                    <ScrollView style={styles.content}>
                        <Section title="What We Analyze">
                            <BulletPoint text="Skin type (oily, dry, combination, normal, sensitive)" />
                            <BulletPoint text="Skin tone and undertones" />
                            <BulletPoint text="Common skin concerns (acne, wrinkles, dark spots, etc.)" />
                            <BulletPoint text="Personalized product recommendations" />
                        </Section>

                        <Section title="How We Use Your Data">
                            <BulletPoint text="Your facial image is analyzed using AI/ML models" />
                            <BulletPoint text="Analysis results are stored in your account" />
                            <BulletPoint text="Images and results help improve our recommendations" />
                            <BulletPoint text="No data is shared with third parties without consent" />
                        </Section>

                        <Section title="Your Privacy Rights">
                            <BulletPoint text="View your analysis history anytime" />
                            <BulletPoint text="Delete individual analyses or all data" />
                            <BulletPoint text="Images auto-delete after 90 days" />
                            <BulletPoint text="Revoke consent anytime in Settings" />
                        </Section>

                        <Section title="Data Security">
                            <BulletPoint text="Images encrypted in transit and at rest" />
                            <BulletPoint text="Secure cloud storage (AWS/Google Cloud)" />
                            <BulletPoint text="GDPR and CCPA compliant" />
                            <BulletPoint text="Access restricted to authorized systems" />
                        </Section>

                        <View style={styles.disclaimer}>
                            <Ionicons name="information-circle" size={20} color="#F59E0B" />
                            <Text style={styles.disclaimerText}>
                                This analysis is for informational purposes only and is not a
                                substitute for professional dermatological advice.
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://glowverse.app/privacy')}
                            style={styles.linkButton}
                        >
                            <Text style={styles.linkText}>Read Full Privacy Policy</Text>
                            <Ionicons name="open-outline" size={16} color="#8B5CF6" />
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
                            <Text style={styles.declineText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                            <Text style={styles.acceptText}>Accept & Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

function BulletPoint({ text }: { text: string }) {
    return (
        <View style={styles.bulletPoint}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    header: {
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    content: {
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#8B5CF6',
        marginTop: 7,
        marginRight: 12,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: '#444444',
        lineHeight: 20,
    },
    disclaimer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        marginTop: 8,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        marginLeft: 12,
        lineHeight: 18,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        padding: 12,
    },
    linkText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 6,
    },
    actions: {
        flexDirection: 'row',
        padding: 24,
        paddingTop: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    declineButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    declineText: {
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
    },
    acceptText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
