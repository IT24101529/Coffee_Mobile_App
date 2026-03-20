import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '@/src/config/colors';
import HomeScreen from './home';
import MenuScreen from './menu/index';
import OrdersScreen from './orders/index';
import ProfileScreen from './profile/index';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const screenOptions = (name: string): BottomTabNavigationOptions => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: COLORS.surface,
      borderTopColor: COLORS.border,
      borderTopWidth: 1,
    },
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: '#666666',
    tabBarLabelStyle: {
      fontSize: 11,
    },
  });

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
          ...screenOptions('home'),
        }}
      />
      <Tab.Screen
        name="menu"
        component={MenuScreen}
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="coffee-outline" size={size} color={color} />
          ),
          ...screenOptions('menu'),
        }}
      />
      <Tab.Screen
        name="orders"
        component={OrdersScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="receipt" size={size} color={color} />
          ),
          ...screenOptions('orders'),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
          ...screenOptions('profile'),
        }}
      />
    </Tab.Navigator>
  );
}
