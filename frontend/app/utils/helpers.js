import { COLORS, DIMENSIONS } from './constants';

/**
 * Format date for display
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

/**
 * Format time for display
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format full date and time
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format coordinates for display
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} precision - Decimal precision (default: 6)
 * @returns {string} - Formatted coordinates string
 */
export const formatCoordinates = (latitude, longitude, precision = 6) => {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human readable file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with strength and suggestions
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 'weak',
    suggestions: [],
  };

  if (password.length < 6) {
    result.suggestions.push('Password must be at least 6 characters');
  }

  if (!/[a-z]/.test(password)) {
    result.suggestions.push('Include lowercase letters');
  }

  if (!/[A-Z]/.test(password)) {
    result.suggestions.push('Include uppercase letters');
  }

  if (!/\d/.test(password)) {
    result.suggestions.push('Include numbers');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.suggestions.push('Include special characters');
  }

  const score = result.suggestions.length;
  if (score === 0) {
    result.strength = 'strong';
    result.isValid = true;
  } else if (score <= 2) {
    result.strength = 'medium';
    result.isValid = password.length >= 6;
  } else {
    result.strength = 'weak';
  }

  return result;
};

/**
 * Generate a unique ID
 * @param {number} length - Length of ID (default: 8)
 * @returns {string} - Unique ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func.apply(null, args);
  };
};

/**
 * Calculate distance between two coordinates in kilometers
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} - Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Get color based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {string} - Color code
 */
export const getDistanceColor = (distance) => {
  if (distance < 1) return COLORS.SUCCESS;
  if (distance < 5) return COLORS.INFO;
  if (distance < 10) return COLORS.WARNING;
  return COLORS.ERROR;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase();
};

/**
 * Check if image URL is valid
 * @param {string} url - Image URL to check
 * @returns {boolean} - True if valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('image/') ||
         lowerUrl.includes('imgur.com') ||
         lowerUrl.includes('cloudinary.com');
};

/**
 * Create a safe filename
 * @param {string} filename - Original filename
 * @returns {string} - Safe filename
 */
export const createSafeFilename = (filename) => {
  if (!filename) return `image_${Date.now()}`;
  
  // Remove special characters and spaces
  const safe = filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  return safe || `image_${Date.now()}`;
};
