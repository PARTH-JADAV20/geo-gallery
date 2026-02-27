import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { 
  isBiometricSupported, 
  isBiometricEnabled, 
  authenticateWithBiometrics,
  getAuthenticationTypes,
  getAuthTypeName
} from '../utils/biometricAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DIMENSIONS } from '../utils/constants';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricIcon: {
    marginBottom: DIMENSIONS.PADDING.XL,
  },
  overlayTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.XXL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.MD,
    textAlign: 'center',
  },
  overlayMessage: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: DIMENSIONS.PADDING.XL,
    paddingHorizontal: DIMENSIONS.PADDING.LG,
    lineHeight: 24,
  },
  loader: {
    marginTop: DIMENSIONS.PADDING.LG,
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [authType, setAuthType] = useState('');
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const router = useRouter();

  // Check for existing token on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Initialize biometric and authenticate if needed
  useEffect(() => {
    if (isAuthenticated) {
      initializeBiometric();
    }
  }, [isAuthenticated]);

  // Initialize biometric authentication
  const initializeBiometric = async () => {
    try {
      const supported = await isBiometricSupported();
      setBiometricSupported(supported);
      
      if (supported) {
        const enabled = await isBiometricEnabled();
        setBiometricEnabled(enabled);
        
        if (enabled) {
          const types = await getAuthenticationTypes();
          const typeName = getAuthTypeName(types);
          setAuthType(typeName);
          
          // Now authenticate with biometrics
          await authenticateWithBiometricIfEnabled(typeName);
        }
      }
    } catch (error) {
      console.error('Biometric initialization failed:', error);
    }
  };

  // Authenticate with biometrics when app starts if enabled
  const authenticateWithBiometricIfEnabled = async (authTypeName) => {
    try {
      setIsBiometricAuthenticating(true);
      console.log('Starting biometric authentication...');
      
      const authenticated = await authenticateWithBiometrics(
        `Unlock ${authTypeName} to access GeoTag Photo Logger`
      );
      
      if (!authenticated) {
        // Biometric failed, logout user
        console.log('Biometric authentication failed, logging out...');
        await logout();
      } else {
        console.log('Biometric authentication successful');
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      await logout();
    } finally {
      setIsBiometricAuthenticating(false);
    }
  };

  // Refresh user data when app comes to foreground (optional)
  useEffect(() => {
    if (isAuthenticated && token) {
      // Try to refresh user data, but don't force logout on failure
      refreshUserData();
    }
  }, [isAuthenticated, token]);

  const refreshUserData = async () => {
    try {
      const response = await authService.getProfile(token);
      if (response.success) {
        setUser(response.data.user);
        await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
      }
    } catch (error) {
      // Don't logout on network errors, only on actual auth errors
      console.log('Failed to refresh user data, but keeping user logged in');
    }
  };

  const loadStoredAuth = async () => {
    try {
      console.log('Loading stored auth...');
      const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

      console.log('Stored data found:', { hasToken: !!storedToken, hasUser: !!storedUser });

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Don't verify token on app start to prevent logout when server is down
        // Token will be verified when making actual API calls
        console.log('✅ Authentication loaded successfully');
      } else {
        console.log('❌ No stored authentication found');
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);

      if (response.success) {
        const { user: newUser, token: newToken } = response.data;
        
        // Store auth data
        await SecureStore.setItemAsync('authToken', newToken);
        await SecureStore.setItemAsync('userData', JSON.stringify(newUser));
        
        // Update state
        setUser(newUser);
        setToken(newToken);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      if (response.success) {
        const { user: loggedInUser, token: newToken } = response.data;
        
        console.log('Login successful, storing auth data...');
        
        // Store auth data
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, newToken);
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(loggedInUser));
        
        console.log('Auth data stored successfully');
        
        // Update state
        setUser(loggedInUser);
        setToken(newToken);
        setIsAuthenticated(true);
        
        console.log('✅ Login completed, isAuthenticated set to true');
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      
      // Clear secure storage
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      
      console.log('Secure storage cleared');
      
      // Clear state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout completed');
      
      // Navigate to login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (newUserData) => {
    try {
      setUser(newUserData);
      await SecureStore.setItemAsync('userData', JSON.stringify(newUserData));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    biometricSupported,
    biometricEnabled,
    authType,
    isBiometricAuthenticating,
    register,
    login,
    logout,
    updateUser,
  };

  // Biometric Authentication Overlay Component
const BiometricOverlay = () => {
  const { isBiometricAuthenticating, authType } = useAuth();

  if (!isBiometricAuthenticating) return null;

  const getBiometricIcon = () => {
    if (authType === 'Face ID') return 'face-id';
    if (authType === 'Fingerprint') return 'finger-print';
    if (authType === 'Iris Scanner') return 'eye';
    if (authType === 'Secure Enclave') return 'shield-checkmark';
    return 'lock-closed'; // For Device Lock/PIN
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={COLORS.BACKGROUND_GRADIENT}
        style={styles.overlayContent}
      >
        <View style={styles.overlayContent}>
          <View style={styles.biometricIcon}>
            <Ionicons 
              name={getBiometricIcon()} 
              size={80} 
              color={COLORS.PRIMARY_GRADIENT[0]} 
            />
          </View>
          
          <Text style={styles.overlayTitle}>
            {authType} Required
          </Text>
          
          <Text style={styles.overlayMessage}>
            Use your {authType} to unlock GeoTag Photo Logger
          </Text>
          
          <ActivityIndicator 
            size="large" 
            color={COLORS.PRIMARY_GRADIENT[0]} 
            style={styles.loader}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

  return (
    <AuthContext.Provider value={value}>
      {children}
      <BiometricOverlay />
    </AuthContext.Provider>
  );
};
