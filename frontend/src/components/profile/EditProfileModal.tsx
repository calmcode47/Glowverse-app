import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';

interface EditProfileModalProps {
    isVisible: boolean;
    onClose: () => void;
    user: {
        name: string;
        email: string;
    };
    onSave: (name: string, email: string) => void;
}

export default function EditProfileModal({
    isVisible,
    onClose,
    user,
    onSave
}: EditProfileModalProps) {
    const { theme, isDark } = useTheme();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSave = () => {
        onSave(name, email);
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}
                    >
                        <View style={[styles.content, {
                            backgroundColor: theme.colors.background.primary,
                            borderColor: theme.colors.border.light
                        }]}>
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: theme.colors.text.primary }]}>Edit Profile</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <MaterialCommunityIcons name="close" size={24} color={theme.colors.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Full Name</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: theme.colors.background.elevated,
                                            color: theme.colors.text.primary,
                                            borderColor: theme.colors.border.light
                                        }]}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Enter your name"
                                        placeholderTextColor={theme.colors.text.tertiary}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Email Address</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            backgroundColor: theme.colors.background.elevated,
                                            color: theme.colors.text.primary,
                                            borderColor: theme.colors.border.light
                                        }]}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholder="Enter your email"
                                        placeholderTextColor={theme.colors.text.tertiary}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: theme.colors.accent.emerald }]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
    },
    content: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        borderWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    input: {
        height: 54,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    saveButton: {
        height: 54,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
