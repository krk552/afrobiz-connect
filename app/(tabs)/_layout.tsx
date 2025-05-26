import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../contexts/AuthContext';

const TabBarIcon = ({ name, color, focused, size = 26 }: { name: any; color: string; focused: boolean; size?: number }) => {
  return (
    <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
      <Ionicons name={name} size={size} color={color} />
      {focused && <View style={[styles.focusIndicator, { backgroundColor: color }]} />}
    </View>
  );
};

export default function TabLayout() {
  const { user } = useAuth();
  const activeColor = '#FF6B35';
  const inactiveColor = '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
        },
        tabBarBackground: () => (
          <BlurView intensity={95} style={StyleSheet.absoluteFill} />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="search" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          href: user && user.userType === 'business' ? '/dashboard' : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
              <MaterialCommunityIcons name="chart-line" size={26} color={color} />
              {focused && <View style={[styles.focusIndicator, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  focusedIconContainer: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  focusIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
