import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.afrobizconnect.com';
const API_VERSION = 'v1';
const TIMEOUT = 10000; // 10 seconds

// Storage Keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@afrobiz_access_token',
  REFRESH_TOKEN: '@afrobiz_refresh_token',
  USER_DATA: '@afrobiz_user_data',
};

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Request configuration
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
  timeout?: number;
}

class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}`;
    this.initializeTokens();
  }

  private async initializeTokens() {
    try {
      this.accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to initialize tokens:', error);
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = this.accessToken || await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || 'Request failed',
          status: response.status,
          code: data.code,
          details: data.errors || data.details,
        } as ApiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error; // Re-throw API errors
      }
      
      throw {
        message: 'Network error or invalid response',
        status: response.status || 0,
        details: error,
      } as ApiError;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await this.handleResponse<{
        accessToken: string;
        refreshToken: string;
      }>(response);

      if (result.success && result.data) {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, result.data.accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, result.data.refreshToken],
        ]);
        
        this.accessToken = result.data.accessToken;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      await this.clearTokens();
      return false;
    }
  }

  private async clearTokens() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      this.accessToken = null;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      requiresAuth = true,
      timeout = TIMEOUT,
    } = config;

    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = requiresAuth 
        ? await this.getAuthHeaders()
        : { 'Content-Type': 'application/json', 'Accept': 'application/json' };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const requestConfig: RequestInit = {
        method,
        headers,
        signal: controller.signal,
        ...(body ? { body: JSON.stringify(body) } : {}),
      };

      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);

      // Handle 401 (Unauthorized) with token refresh
      if (response.status === 401 && requiresAuth) {
        const refreshed = await this.refreshAccessToken();
        
        if (refreshed) {
          // Retry request with new token
          const newHeaders = await this.getAuthHeaders();
          const retryResponse = await fetch(url, {
            ...requestConfig,
            headers: newHeaders,
          });
          
          return this.handleResponse<T>(retryResponse);
        } else {
          // Refresh failed, redirect to login
          throw {
            message: 'Authentication failed',
            status: 401,
            code: 'AUTH_FAILED',
          } as ApiError;
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          status: 408,
          code: 'TIMEOUT',
        } as ApiError;
      }

      if (error && typeof error === 'object' && 'status' in error) {
        throw error; // Re-throw API errors
      }

      throw {
        message: 'Network error',
        status: 0,
        details: error,
      } as ApiError;
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T>(endpoint: string, data?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: data, requiresAuth });
  }

  async put<T>(endpoint: string, data?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: data, requiresAuth });
  }

  async patch<T>(endpoint: string, data?: any, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data, requiresAuth });
  }

  async delete<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }

  // Upload method for file uploads
  async upload<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.accessToken || await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', async () => {
          try {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(response);
            } else {
              reject({
                message: response.message || 'Upload failed',
                status: xhr.status,
                details: response,
              } as ApiError);
            }
          } catch (error) {
            reject({
              message: 'Invalid response format',
              status: xhr.status,
              details: error,
            } as ApiError);
          }
        });

        xhr.addEventListener('error', () => {
          reject({
            message: 'Upload failed',
            status: xhr.status || 0,
          } as ApiError);
        });

        xhr.open('POST', `${this.baseURL}${endpoint}`);
        
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.send(formData);
      });
    } catch (error) {
      throw {
        message: 'Upload initialization failed',
        status: 0,
        details: error,
      } as ApiError;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', false);
      return response.success;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Set access token (for login)
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Clear tokens (for logout)
  async logout() {
    await this.clearTokens();
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 