import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export default function IndexScreen() {
  const { user, isLoading, isFirstLaunch } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    if (isFirstLaunch) {
      // First time opening the app, show onboarding
      router.replace('/(auth)/welcome');
    } else if (user) {
      // User is authenticated, go to main app
      router.replace('/(tabs)/');
    } else {
      // User is not authenticated, go to sign in
      router.replace('/(auth)/signin');
    }
  }, [user, isLoading, isFirstLaunch]);

  // Show loading screen while determining auth state
  return <LoadingScreen />;
} 