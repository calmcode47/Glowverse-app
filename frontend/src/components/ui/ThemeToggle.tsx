import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/themeContext';

export default function ThemeToggle() {
    const { isDark, toggleTheme, theme } = useTheme();
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        // Scale animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        toggleTheme();
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <Animated.View style={[
                styles.iconContainer,
                {
                    backgroundColor: isDark
                        ? theme.colors.accent.emerald + '20'
                        : theme.colors.accent.emerald + '15',
                    transform: [{ scale: scaleAnim }],
                }
            ]}>
                <MaterialCommunityIcons
                    name={isDark ? 'weather-night' : 'white-balance-sunny'}
                    size={24}
                    color={theme.colors.accent.emerald}
                />
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 4,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
