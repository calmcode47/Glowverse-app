import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { adminApi, AdminUser } from '../../services/api/admin.api';
import { useTheme } from '../../theme/themeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function UsersManagementScreen() {
    const { theme } = useTheme();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleUserRole = async (user: AdminUser) => {
        const newRole = user.role === 'admin' ? 'customer' : 'admin';
        Alert.alert(
            'Change Role',
            `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Update',
                    onPress: async () => {
                        try {
                            await adminApi.updateUserRole(user.id, newRole);
                            setUsers(users.map(u => (u.id === user.id ? { ...u, role: newRole } : u)));
                            Alert.alert('Success', 'User role updated');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update user role');
                        }
                    },
                },
            ]
        );
    };

    const renderUser = ({ item }: { item: AdminUser }) => (
        <View style={[styles.userCard, { backgroundColor: theme.colors.background.elevated, borderColor: theme.colors.border.light }]}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.background.secondary }]}>
                <MaterialCommunityIcons name="account" size={24} color={theme.colors.accent.blue} />
            </View>

            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.colors.text.primary }]}>{item.name}</Text>
                <Text style={[styles.userEmail, { color: theme.colors.text.tertiary }]}>{item.email}</Text>
                <View style={styles.roleRow}>
                    <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? theme.colors.accent.emerald + '20' : theme.colors.border.light }]}>
                        <Text style={[styles.roleText, { color: item.role === 'admin' ? theme.colors.accent.emerald : theme.colors.text.secondary }]}>
                            {item.role.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.colors.text.tertiary }]}>
                        Joined {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.background.secondary }]}
                onPress={() => toggleUserRole(item)}
            >
                <MaterialCommunityIcons name="shield-edit-outline" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.accent.blue} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUser}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    onRefresh={loadUsers}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="account-off-outline" size={64} color={theme.colors.border.main} />
                            <Text style={[styles.emptyText, { color: theme.colors.text.tertiary }]}>No users found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
    },
    userEmail: {
        fontSize: 12,
        marginBottom: 4,
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '800',
    },
    dateText: {
        fontSize: 10,
    },
    actionButton: {
        padding: 10,
        borderRadius: 12,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
    },
});
