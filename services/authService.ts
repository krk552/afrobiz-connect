import apiService, { ApiResponse, ApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'customer' | 'business';
  businessName?: string;
  businessCategory?: string;
  location?: {
    address: string;
    city: string;
    region: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'customer' | 'business';
  avatar?: string;
  verified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
  business?: BusinessProfile;
}

export interface UserProfile {
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  location?: {
    address?: string;
    city: string;
    region: string;
    country: string;
  };
}

export interface BusinessProfile {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  location: {
    address: string;
    city: string;
    region: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  businessHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  rating?: number;
  reviewCount?: number;
  verified: boolean;
  features?: string[];
  gallery?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Storage keys
const STORAGE_KEYS = {
  USER: '@afrobiz_user',
  ACCESS_TOKEN: '@afrobiz_access_token',
  REFRESH_TOKEN: '@afrobiz_refresh_token',
  BIOMETRIC_ENABLED: '@afrobiz_biometric_enabled',
};

class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials, false);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Store tokens
        await this.storeTokens(tokens);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        // Set access token in API service
        apiService.setAccessToken(tokens.accessToken);
        
        return user;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async signUp(data: RegisterData): Promise<User> {
    try {
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await apiService.post<AuthResponse>('/auth/register', data, false);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Store tokens
        await this.storeTokens(tokens);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        // Set access token in API service
        apiService.setAccessToken(tokens.accessToken);
        
        return user;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Registration failed');
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await apiService.post('/auth/logout', {});
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    }
    
    // Clear local storage
    await this.clearAuthData();
    await apiService.logout();
  }

  /**
   * Get current user from storage
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<User> {
    try {
      const response = await apiService.patch<User>('/auth/profile', updates);
      
      if (response.success && response.data) {
        const updatedUser = response.data;
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error(response.message || 'Profile update failed');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Profile update failed');
    }
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(updates: Partial<BusinessProfile>): Promise<User> {
    try {
      const response = await apiService.patch<User>('/auth/business-profile', updates);
      
      if (response.success && response.data) {
        const updatedUser = response.data;
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error(response.message || 'Business profile update failed');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Business profile update failed');
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Password change failed');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/forgot-password', { email }, false);
      
      if (!response.success) {
        throw new Error(response.message || 'Password reset request failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Password reset request failed');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        newPassword,
      }, false);
      
      if (!response.success) {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Password reset failed');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/verify-email', { token }, false);
      
      if (response.success && response.data) {
        const updatedUser = response.data;
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      } else {
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Email verification failed');
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    try {
      const response = await apiService.post('/auth/resend-verification');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to resend verification email');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to resend verification email');
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(imageUri: string, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await apiService.upload<{ avatarUrl: string }>(
        '/auth/upload-avatar',
        formData,
        onProgress
      );

      if (response.success && response.data) {
        // Update user data with new avatar URL
        const currentUser = await this.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: response.data.avatarUrl };
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }
        
        return response.data.avatarUrl;
      }

      throw new Error(response.message || 'Avatar upload failed');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Avatar upload failed');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const [accessToken, user] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      return !!(accessToken && user);
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Enable/disable biometric authentication
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Failed to set biometric preference:', error);
      throw new Error('Failed to update biometric settings');
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Failed to get biometric preference:', error);
      return false;
    }
  }

  /**
   * Store authentication tokens
   */
  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken],
      ]);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService; 