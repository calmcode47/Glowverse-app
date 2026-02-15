import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onPress: () => void;
    style?: any;
}

export default function Checkbox({ label, checked, onPress, style }: CheckboxProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[
                styles.box,
                { borderColor: checked ? theme.colors.accent.emerald : theme.colors.border.light },
                checked && { backgroundColor: theme.colors.accent.emerald }
            ]}>
                {checked && (
                    <MaterialCommunityIcons name="check" size={16} color={theme.colors.text.inverse} />
                )}
            </View>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    box: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
    },
});
