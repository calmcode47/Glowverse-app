import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/themeContext';

import DashboardScreen from '../screens/admin/DashboardScreen';
import ProductsManagementScreen from '../screens/admin/ProductsManagementScreen';
import OrdersManagementScreen from '../screens/admin/OrdersManagementScreen';
import UsersManagementScreen from '../screens/admin/UsersManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: theme.colors.background.elevated,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border.light,
                },
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: theme.colors.text.primary,
                },
                tabBarActiveTintColor: theme.colors.accent.blue,
                tabBarInactiveTintColor: theme.colors.text.tertiary,
                tabBarStyle: {
                    backgroundColor: theme.colors.background.elevated,
                    borderTopColor: theme.colors.border.light,
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 5,
                }
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Products"
                component={ProductsManagementScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="package-variant-closed" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Orders"
                component={OrdersManagementScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="clipboard-list-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Users"
                component={UsersManagementScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="chart-bell-curve-cumulative" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
