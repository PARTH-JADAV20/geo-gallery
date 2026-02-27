import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { 
  setupBiometricAuth, 
  enableBiometric, 
  disableBiometric,
  isBiometricSupported,
  getAuthenticationTypes,
  getAuthTypeName
} from '../utils/biometricAuth';
import { COLORS, DIMENSIONS } from '../utils/constants';

const SettingsScreen = () => {
  const router = useRouter();
  const { user, logout, biometricSupported, biometricEnabled, authType } = useAuth();
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [localBiometricSupported, setLocalBiometricSupported] = useState(biometricSupported);
  const [localBiometricEnabled, setLocalBiometricEnabled] = useState(biometricEnabled);
  const [localAuthType, setLocalAuthType] = useState(authType);

  // Sync local state with context state when it changes
  useEffect(() => {
    console.log('Syncing biometric state:', { biometricSupported, biometricEnabled, authType });
    setLocalBiometricSupported(biometricSupported);
    setLocalBiometricEnabled(biometricEnabled);
    setLocalAuthType(authType);
  }, [biometricSupported, biometricEnabled, authType]);

  const handleBiometricToggle = async (value) => {
    console.log('Simple toggle pressed');
    setBiometricLoading(true);
    
    try {
      // Update local state immediately for visual feedback
      setLocalBiometricEnabled(value);
      
      if (value) {
        // Enable biometric authentication
        console.log('Enabling biometric...');
        const result = await setupBiometricAuth();
        
        if (result.success) {
          Alert.alert('Success', result.message);
          // Force a small delay to ensure storage is updated
          setTimeout(() => {
            console.log('Biometric enabled, forcing refresh...');
            // This will trigger the useEffect to sync state
          }, 100);
        } else {
          Alert.alert('Error', result.message);
          // Revert if failed
          setLocalBiometricEnabled(false);
        }
      } else {
        // Disable biometric authentication
        console.log('Disabling biometric...');
        await disableBiometric();
        Alert.alert('Success', 'Biometric authentication disabled');
        // Force a small delay to ensure storage is updated
        setTimeout(() => {
          console.log('Biometric disabled, forcing refresh...');
          // This will trigger the useEffect to sync state
        }, 100);
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert('Error', 'Failed to update biometric settings');
      // Revert if failed
      setLocalBiometricEnabled(!value);
    } finally {
      setBiometricLoading(false);
    }
  };

  const refreshBiometricState = async () => {
    try {
      const supported = await isBiometricSupported();
      const enabled = await isBiometricEnabled();
      const types = await getAuthenticationTypes();
      const typeName = getAuthTypeName(types);
      
      // Update local state (this will trigger re-render)
      setLocalBiometricSupported(supported);
      setLocalBiometricEnabled(enabled);
      setLocalAuthType(typeName);
    } catch (error) {
      console.error('Refresh biometric state failed:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const getBiometricIcon = () => {
    if (localAuthType === 'Face ID') return 'face-id';
    if (localAuthType === 'Fingerprint') return 'finger-print';
    if (localAuthType === 'Iris Scanner') return 'eye';
    return 'lock-closed';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.BACKGROUND_GRADIENT}
        style={styles.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.backButtonBlur}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.sectionCard}
          >
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={COLORS.PRIMARY_GRADIENT[0]} />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.sectionCard}
          >
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons 
                  name={getBiometricIcon()} 
                  size={24} 
                  color={localBiometricEnabled ? COLORS.PRIMARY_GRADIENT[0] : COLORS.TEXT_SECONDARY} 
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>
                    {localAuthType || 'Biometric Authentication'}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {localBiometricEnabled 
                      ? `${localAuthType} is enabled for quick access`
                      : 'Enable biometric authentication for enhanced security'
                    }
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={() => {
                  console.log('Simple toggle pressed');
                  handleBiometricToggle(!localBiometricEnabled);
                }}
                style={{
                  width: 50,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: localBiometricEnabled ? '#4CAF50' : '#ccc',
                  justifyContent: 'center',
                  alignItems: localBiometricEnabled ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 2,
                }}
              >
                <View style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: 'white',
                }} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.sectionCard}
          >
            <View style={styles.infoItem}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.PRIMARY_GRADIENT[0]} />
              <Text style={styles.infoText}>GeoTag Photo Logger</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="code-outline" size={20} color={COLORS.PRIMARY_GRADIENT[0]} />
              <Text style={styles.infoText}>Version 1.0.0</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="camera-outline" size={20} color={COLORS.PRIMARY_GRADIENT[0]} />
              <Text style={styles.infoText}>Capture, Tag, Track Your Memories</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={[COLORS.ERROR, '#D32F2F']}
              style={styles.logoutButtonGradient}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.TEXT_PRIMARY} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.select({
      ios: 60, // Increased from 50
      android: 40, // Increased from 30
    }),
    paddingHorizontal: DIMENSIONS.PADDING.LG,
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  headerTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: DIMENSIONS.PADDING.LG,
  },
  section: {
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  sectionTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.MD,
  },
  sectionCard: {
    padding: DIMENSIONS.PADDING.LG,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.GLASS_WHITE,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DIMENSIONS.PADDING.MD,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: DIMENSIONS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.XS,
  },
  userEmail: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: DIMENSIONS.PADDING.MD,
    flex: 1,
  },
  settingTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.XS,
  },
  settingDescription: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.MD,
  },
  infoText: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: DIMENSIONS.PADDING.MD,
  },
  logoutButton: {
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DIMENSIONS.PADDING.MD,
    paddingHorizontal: DIMENSIONS.PADDING.LG,
  },
  logoutButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    fontWeight: '500',
    marginLeft: DIMENSIONS.PADDING.SM,
  },
  toggleButton: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: COLORS.GLASS_BORDER,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.PRIMARY_GRADIENT[0],
    borderColor: COLORS.PRIMARY_GRADIENT[0],
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  toggleThumbActive: {
    backgroundColor: COLORS.TEXT_PRIMARY,
    borderColor: 'transparent',
  },
});

export default SettingsScreen;
