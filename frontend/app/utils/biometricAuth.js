import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';

/**
 * Check if device supports biometric authentication
 */
export const isBiometricSupported = async () => {
  try {
    const compatible = await LocalAuthentication.isEnrolledAsync();
    return compatible;
  } catch (error) {
    console.error('Biometric support check failed:', error);
    return false;
  }
};

/**
 * Get available authentication types
 */
export const getAuthenticationTypes = async () => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types;
  } catch (error) {
    console.error('Get auth types failed:', error);
    return [];
  }
};

/**
 * Get user-friendly name for authentication type
 */
export const getAuthTypeName = (types) => {
  console.log('Available auth types:', types);
  
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris Scanner';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.SECURE_ENCLAVE)) {
    return 'Secure Enclave';
  }
  return 'Device Lock'; // For PIN, Pattern, Password
};

/**
 * Authenticate user with biometrics
 */
export const authenticateWithBiometrics = async (promptMessage = 'Authenticate to access GeoTag Photo Logger') => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use passcode',
      cancelLabel: 'Cancel',
    });
    
    return result.success;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};

/**
 * Check if biometric authentication is enabled
 */
export const isBiometricEnabled = async () => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Check biometric enabled failed:', error);
    return false;
  }
};

/**
 * Enable biometric authentication
 */
export const enableBiometric = async () => {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Enable biometric failed:', error);
    return false;
  }
};

/**
 * Disable biometric authentication
 */
export const disableBiometric = async () => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    return true;
  } catch (error) {
    console.error('Disable biometric failed:', error);
    return false;
  }
};

/**
 * Setup biometric authentication (first time setup)
 */
export const setupBiometricAuth = async () => {
  try {
    // Check if device supports biometrics
    const supported = await isBiometricSupported();
    if (!supported) {
      return {
        success: false,
        message: 'This device does not support biometric authentication'
      };
    }

    // Get available authentication types
    const types = await getAuthenticationTypes();
    const authType = getAuthTypeName(types);

    // Try to authenticate to confirm user wants to enable it
    const authenticated = await authenticateWithBiometrics(
      `Enable ${authType} authentication for GeoTag Photo Logger`
    );

    if (authenticated) {
      await enableBiometric();
      return {
        success: true,
        message: `${authType} authentication enabled successfully`
      };
    } else {
      return {
        success: false,
        message: 'Authentication cancelled'
      };
    }
  } catch (error) {
    console.error('Setup biometric failed:', error);
    return {
      success: false,
      message: 'Failed to setup biometric authentication'
    };
  }
};
