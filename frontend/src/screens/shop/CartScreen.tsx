import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../theme/themeContext';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <ProfessionalBackground variant="subtle" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text.primary }]}>Your Cart</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.emptyState}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.background.elevated }]}>
                    <MaterialCommunityIcons name="cart-outline" size={64} color={theme.colors.text.secondary} />
                </View>
                <Text style={[styles.emptyText, { color: theme.colors.text.primary }]}>Your cart is empty</Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.text.secondary }]}>Looks like you haven't added anything yet.</Text>

                <TouchableOpacity
                    style={[styles.shopButton, { backgroundColor: theme.colors.accent.emerald }]}
                    onPress={() => navigation.navigate('ShopTab' as any)}
                >
                    <Text style={[styles.shopButtonText, { color: theme.colors.text.inverse }]}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
    },
    shopButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    shopButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
