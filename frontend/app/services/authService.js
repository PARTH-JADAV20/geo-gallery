import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration - Try multiple endpoints
const API_URLS = [
  'http://172.17.24.213:5000/api',
  'http://localhost:5000/api',
  'http://127.0.0.1:5000/api'
];

// Use the first available URL
const API_URL = API_URLS[0];

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
};

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401) {
      try {
        await clearToken();
        // Navigate to login (this will be handled by the auth context)
      } catch (clearError) {
        console.error('Error clearing token:', clearError);
      }
    }
    
    // Return consistent error format
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || null,
    });
  }
);

// Helper functions for token management
const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const clearToken = async () => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error clearing token:', error);
  }
};

// Authentication service functions
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password, confirmPassword }
   * @returns {Promise<Object>} - Response object
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - Response object
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user profile
   * @param {string} token - JWT token (optional, will use stored token)
   * @returns {Promise<Object>} - Response object
   */
  getProfile: async (token = null) => {
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};
      
      const response = await axios.get(`${API_URL}/auth/profile`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile (if needed in future)
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} - Response object
   */
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// Export the API client for use in other services
export default apiClient;
