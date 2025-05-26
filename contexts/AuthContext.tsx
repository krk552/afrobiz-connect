import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, User, LoginCredentials, RegisterData, UserProfile } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirstLaunch: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (userData: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<UserProfile>) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@afrobiz_user',
  TOKEN: '@afrobiz_token',
  FIRST_LAUNCH: '@afrobiz_first_launch',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if this is the first launch
      const hasLaunchedBefore = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      setIsFirstLaunch(hasLaunchedBefore === null);

      // Check for existing user session
      const currentUser = await authService.getCurrentUser();
      const isAuthenticated = await authService.isAuthenticated();

      if (currentUser && isAuthenticated) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setError('Failed to check authentication status');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await authService.signIn(credentials);
      setUser(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await authService.signUp(userData);
      setUser(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<UserProfile>) => {
    try {
      setError(null);
      
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      setError(errorMessage);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setError('Failed to refresh user data');
    }
  };

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      setError('Failed to complete onboarding');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isFirstLaunch,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    markOnboardingComplete,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 