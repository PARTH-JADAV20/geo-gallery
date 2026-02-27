/**
 * App constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

// Color Palette - Glassmorphism Theme
export const COLORS = {
  // Primary Gradients
  PRIMARY_GRADIENT: ['#6C63FF', '#4D9FFF'],
  ACCENT_GRADIENT: ['#FF6FD8', '#3813C2'],
  BACKGROUND_GRADIENT: ['#0F2027', '#203A43', '#2C5364'],
  
  // Glass Colors
  GLASS_WHITE: 'rgba(255, 255, 255, 0.1)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.2)',
  GLASS_BACKGROUND: 'rgba(255, 255, 255, 0.05)',
  
  // Text Colors
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)',
  TEXT_MUTED: 'rgba(255, 255, 255, 0.5)',
  
  // Status Colors
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
  
  // UI Colors
  OVERLAY: 'rgba(0, 0, 0, 0.8)',
  SHADOW: 'rgba(0, 0, 0, 0.3)',
};

// Dimensions and Spacing
export const DIMENSIONS = {
  PADDING: {
    XS: 8,
    SM: 12,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  BORDER_RADIUS: {
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    XXL: 24,
    ROUND: 999,
  },
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 24,
    XXL: 32,
  },
};

// Animation Durations
export const ANIMATIONS = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'easeIn',
    EASE_OUT: 'easeOut',
    EASE_IN_OUT: 'easeInOut',
  },
};

// Screen Names
export const SCREENS = {
  AUTH: {
    LOGIN: 'login',
    REGISTER: 'register',
  },
  MAIN: {
    HOME: 'index',
    CREATE: 'create',
    MAP: 'map',
  },
};

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  LOCATION_PERMISSION: 'locationPermission',
  CAMERA_PERMISSION: 'cameraPermission',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  PERMISSION_DENIED: 'Permission denied. Please enable permissions in settings.',
  LOCATION_ERROR: 'Unable to get location. Please enable location services.',
  CAMERA_ERROR: 'Unable to access camera. Please enable camera permissions.',
  UPLOAD_ERROR: 'Failed to upload image. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: 'Registration successful! Welcome to GeoTag Photo Logger.',
  LOGIN_SUCCESS: 'Login successful! Welcome back.',
  ENTRY_CREATED: 'Photo entry created successfully!',
  ENTRY_UPDATED: 'Entry updated successfully!',
  ENTRY_DELETED: 'Entry deleted successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
};

// Location Configuration
export const LOCATION_CONFIG = {
  ACCURACY: 'high',
  TIME_INTERVAL: 10000,
  DISTANCE_INTERVAL: 10,
  TIMEOUT: 15000,
};

// Camera Configuration
export const CAMERA_CONFIG = {
  QUALITY: 0.8,
  FLASH_MODE: 'auto',
  WHITE_BALANCE: 'auto',
  FOCUS_DEPTH: 1,
};

// Map Configuration
export const MAP_CONFIG = {
  INITIAL_REGION: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  MARKER_SIZE: 30,
  ZOOM_LEVEL: 15,
};

// Glassmorphism Styles
export const GLASS_STYLES = {
  CONTAINER: {
    backgroundColor: COLORS.GLASS_BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
  },
  CARD: {
    backgroundColor: COLORS.GLASS_WHITE,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  BUTTON: {
    backgroundColor: COLORS.GLASS_WHITE,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
  },
  INPUT: {
    backgroundColor: COLORS.GLASS_BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    borderRadius: DIMENSIONS.BORDER_RADIUS.MD,
  },
};
