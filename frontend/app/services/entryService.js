import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const API_URL = 'http://172.17.24.213:5000/api';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
};

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
  } catch (error) {
    console.error('Error clearing token:', error);
  }
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
    return Promise.reject(error.response?.data || error);
  }
);

/**
 * Entry service for managing photo entries
 */
export const entryService = {
  /**
   * Create a new entry with image upload
   * @param {Object} entryData - { title, description, latitude, longitude }
   * @param {Object} imageFile - Image file object
   * @returns {Promise<Object>} - Response object
   */
  createEntry: async (entryData, imageFile) => {
    try {
      const formData = new FormData();
      
      // Add entry data
      formData.append('title', entryData.title);
      formData.append('description', entryData.description || '');
      formData.append('latitude', entryData.latitude.toString());
      formData.append('longitude', entryData.longitude.toString());
      
      // Add image file
      if (imageFile) {
        const uri = imageFile.uri;
        const fileType = uri.split('.').pop();
        const fileName = `photo_${Date.now()}.${fileType}`;
        
        formData.append('image', {
          uri,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      const response = await apiClient.post('/entries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all entries for the logged-in user
   * @param {Object} params - Query parameters { page, limit, startDate, endDate }
   * @returns {Promise<Object>} - Response object with entries and pagination
   */
  getEntries: async (params = {}) => {
    try {
      const response = await apiClient.get('/entries', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get a single entry by ID
   * @param {string} entryId - Entry ID
   * @returns {Promise<Object>} - Response object with entry
   */
  getEntry: async (entryId) => {
    try {
      const response = await apiClient.get(`/entries/${entryId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing entry
   * @param {string} entryId - Entry ID
   * @param {Object} updateData - { title, description, latitude, longitude }
   * @returns {Promise<Object>} - Response object with updated entry
   */
  updateEntry: async (entryId, updateData) => {
    try {
      const response = await apiClient.put(`/entries/${entryId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete an entry
   * @param {string} entryId - Entry ID
   * @returns {Promise<Object>} - Response object
   */
  deleteEntry: async (entryId) => {
    try {
      const response = await apiClient.delete(`/entries/${entryId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get entries filtered by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} - Response object with filtered entries
   */
  getEntriesByDateRange: async (startDate, endDate) => {
    try {
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      
      const response = await apiClient.get('/entries', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get entries with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<Object>} - Response object with paginated entries
   */
  getEntriesPaginated: async (page = 1, limit = 20) => {
    try {
      const params = { page, limit };
      const response = await apiClient.get('/entries', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
