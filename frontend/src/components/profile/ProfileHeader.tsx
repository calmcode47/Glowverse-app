import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    FadeInUp,
    interpolate,
    useAnimatedStyle
} from 'react-native-reanimated';
import { useTheme } from '../../theme/themeContext';

interface ProfileHeaderProps {
    user: {
        name: string;
        email: string;
        avatar: string | null;
        level: string;
        points: number;
    };
    onEditAvatar: () => void;
}

export default function ProfileHeader({ user, onEditAvatar }: ProfileHeaderProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.background.primary, theme.colors.background.elevated]}
                style={StyleSheet.absoluteFill}
            />

            <Animated.View
                entering={FadeInDown.duration(800).springify()}
                style={styles.content}
            >
                <View style={styles.avatarWrapper}>
                    <LinearGradient
                        colors={theme.colors.gradients.primary}
                        style={styles.avatarBackground}
                    >
                        {user.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        ) : (
                            <MaterialCommunityIcons
                                name="account"
                                size={60}
                                color={theme.colors.text.inverse}
                            />
                        )}
                    </LinearGradient>

                    <TouchableOpacity
                        style={[styles.editButton, {
                            backgroundColor: theme.colors.accent.blue,
                            borderColor: theme.colors.background.primary
                        }]}
                        onPress={onEditAvatar}
                    >
                        <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.userInfo}>
                    <Text style={[styles.name, { color: theme.colors.text.primary }]}>{user.name}</Text>
                    <Text style={[styles.email, { color: theme.colors.text.secondary }]}>{user.email}</Text>

                    <View style={[styles.badgeContainer, {
                        backgroundColor: theme.colors.background.elevated,
                        borderColor: theme.colors.accent.gold + '40'
                    }]}>
                        <MaterialCommunityIcons name="crown" size={14} color={theme.colors.accent.gold} />
                        <Text style={[styles.badgeText, { color: theme.colors.accent.gold }]}>{user.level}</Text>
                        <View style={styles.separator} />
                        <Text style={[styles.pointsText, { color: theme.colors.accent.emerald }]}>{user.points} pts</Text>
                    </View>
                </Animated.View>
            </Animated.View>

            <View style={[styles.statsDivider, { backgroundColor: theme.colors.border.light }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarBackground: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    editButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    email: {
        fontSize: 14,
        marginTop: 2,
        opacity: 0.7,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    separator: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 8,
    },
    pointsText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statsDivider: {
        width: '90%',
        height: 1,
        marginTop: 24,
        opacity: 0.3,
    },
});
