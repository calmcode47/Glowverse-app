import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const actions = [
    { id: 'scan', icon: 'camera-outline', label: 'Scan', route: 'CameraTab', color: '#10B981' }, // Emerald
    { id: 'search', icon: 'magnify', label: 'Search', route: 'Search', color: '#3B82F6' }, // Blue
    { id: 'deals', icon: 'tag-outline', label: 'Deals', route: 'ShopTab', color: '#F59E0B' }, // Gold
    { id: 'profile', icon: 'account-outline', label: 'Profile', route: 'ProfileTab', color: '#B537F2' }, // Purple
];

export default function ActionGrid() {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.container}>
            {actions.map((action, index) => (
                <TouchableOpacity
                    key={action.id}
                    style={[
                        styles.actionButton,
                        { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }
                    ]}
                    onPress={() => navigation.navigate(action.route)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: action.color + '15' }]}>
                        <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={[styles.label, { color: theme.colors.text.primary }]}>{action.label}</Text>
                </TouchableOpacity>
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 24,
        marginTop: 10,
    },
    actionButton: {
        width: '23%',
        aspectRatio: 1,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow handled by container or parent if needed
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
    },
});
