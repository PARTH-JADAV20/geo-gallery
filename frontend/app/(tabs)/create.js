import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { entryService } from '../services/entryService';
import { COLORS, DIMENSIONS, VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES, LOCATION_CONFIG, CAMERA_CONFIG } from '../utils/constants';

const CreateEntryScreen = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [flash, setFlash] = useState('off');
  const [facing, setFacing] = useState('back');
  
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable location permissions to tag your photos.');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      };

      setLocation(coords);

      // Get location name using reverse geocoding
      try {
        const geocoded = await Location.reverseGeocodeAsync(coords);
        if (geocoded && geocoded.length > 0) {
          const address = geocoded[0];
          const locationParts = [
            address.street,
            address.district,
            address.city,
            address.region,
            address.country
          ].filter(Boolean);
          
          setLocationName(locationParts.slice(0, 2).join(', ') || 'Unknown Location');
        } else {
          setLocationName('Location detected');
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        setLocationName('Location detected');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', ERROR_MESSAGES.LOCATION_ERROR);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > VALIDATION.TITLE_MAX_LENGTH) {
      newErrors.title = `Title cannot exceed ${VALIDATION.TITLE_MAX_LENGTH} characters`;
    }

    if (formData.description && formData.description.length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Description cannot exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`;
    }

    if (!photo) {
      newErrors.photo = 'Please take a photo';
    }

    if (!location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photoData = await cameraRef.current.takePictureAsync({
        quality: CAMERA_CONFIG.QUALITY,
      });
      setPhoto(photoData);
      setShowCamera(false);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', ERROR_MESSAGES.CAMERA_ERROR);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const entryData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const response = await entryService.createEntry(entryData, photo);
      
      if (response.success) {
        Alert.alert('Success', SUCCESS_MESSAGES.ENTRY_CREATED);
        // Clear form for next entry
        setFormData({ title: '', description: '' });
        setPhoto(null);
        setErrors({});
        // Get fresh location for next entry
        getCurrentLocation();
        // Show success message and stay on create screen
        Alert.alert(
          'Success!', 
          'Entry created successfully. Photo uploaded to server!',
          [
            {
              text: 'Create Another',
              style: 'default',
            },
            {
              text: 'View Entries',
              onPress: () => router.replace('/(tabs)/'),
              style: 'default',
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || ERROR_MESSAGES.UPLOAD_ERROR);
      }
    } catch (error) {
      console.error('Create entry error:', error);
      Alert.alert('Error', ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setShowCamera(true);
  };

  const toggleFlash = () => {
    setFlash(current => current === 'off' ? 'on' : 'off');
  };

  const toggleCamera = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  if (!cameraPermission) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={COLORS.BACKGROUND_GRADIENT}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_GRADIENT[0]} />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={COLORS.BACKGROUND_GRADIENT}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.permissionContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.permissionCard}
          >
            <Ionicons name="camera-outline" size={64} color={COLORS.PRIMARY_GRADIENT[0]} />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need camera permission to capture photos for your geotagged entries.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestCameraPermission}
            >
              <LinearGradient
                colors={COLORS.PRIMARY_GRADIENT}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Grant Permission</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          facing={facing}
          flash={flash}
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeCameraButton}
              onPress={() => setShowCamera(false)}
            >
              <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.closeButton}
          >
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.cameraControls}>
              {/* Flash Button */}
              <TouchableOpacity
                style={styles.cameraControlButton}
                onPress={toggleFlash}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.cameraControlButtonGradient}
                >
                  <Ionicons 
                    name={flash === 'on' ? 'flash' : 'flash-off'} 
                    size={24} 
                    color={flash === 'on' ? COLORS.WARNING : COLORS.TEXT_SECONDARY} 
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Capture Button */}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={COLORS.PRIMARY_GRADIENT}
                  style={styles.captureButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="camera" size={32} color={COLORS.TEXT_PRIMARY} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Camera Switch Button */}
              <TouchableOpacity
                style={styles.cameraControlButton}
                onPress={toggleCamera}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.cameraControlButtonGradient}
                >
                  <Ionicons 
                    name={facing === 'back' ? 'camera-reverse' : 'camera'} 
                    size={24} 
                    color={COLORS.TEXT_PRIMARY} 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={COLORS.BACKGROUND_GRADIENT}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Content */}
      <View style={styles.content}>
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
          <Text style={styles.title}>Create Entry</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Photo Section */}
        <View style={styles.photoSection}>
          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={retakePhoto}
              >
                <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.retakeButtonBlur}
              >
                  <Ionicons name="camera-reverse-outline" size={20} color={COLORS.TEXT_PRIMARY} />
                  <Text style={styles.retakeText}>Retake</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoPlaceholder}
              onPress={() => setShowCamera(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.photoPlaceholderBlur}
            >
                <Ionicons name="camera-outline" size={48} color={COLORS.PRIMARY_GRADIENT[0]} />
                <Text style={styles.photoPlaceholderText}>Take Photo</Text>
                {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Form */}
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.formCard}
        >
          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Enter a title for your photo"
              placeholderTextColor={COLORS.TEXT_MUTED}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              maxLength={VALIDATION.TITLE_MAX_LENGTH}
              editable={!isLoading}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Add a description (optional)"
              placeholderTextColor={COLORS.TEXT_MUTED}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={3}
              maxLength={VALIDATION.DESCRIPTION_MAX_LENGTH}
              editable={!isLoading}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Location Info */}
          <View style={styles.locationContainer}>
            <Ionicons 
              name="location-outline" 
              size={20} 
              color={location ? COLORS.SUCCESS : COLORS.ERROR} 
            />
            <Text style={[styles.locationText, !location && styles.locationError]}>
              {isGettingLocation ? 'Getting location...' : 
               location ? locationName || 'Location detected' :
               'Location unavailable'}
            </Text>
            {!location && !isGettingLocation && (
              <TouchableOpacity
                style={styles.retryLocationButton}
                onPress={getCurrentLocation}
              >
                <Ionicons name="refresh-outline" size={16} color={COLORS.PRIMARY_GRADIENT[0]} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.PRIMARY_GRADIENT}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.TEXT_PRIMARY} size="small" />
            ) : (
              <Text style={styles.buttonText}>Create Entry</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.PADDING.XL,
  },
  permissionCard: {
    alignItems: 'center',
    padding: DIMENSIONS.PADDING.XL,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XXL,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    backgroundColor: COLORS.GLASS_BACKGROUND,
  },
  permissionTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: DIMENSIONS.PADDING.MD,
    marginBottom: DIMENSIONS.PADDING.SM,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  permissionButton: {
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: DIMENSIONS.PADDING.LG,
  },
  closeCameraButton: {
    alignSelf: 'flex-start',
  },
  closeButton: {
    padding: DIMENSIONS.PADDING.SM,
    borderRadius: DIMENSIONS.BORDER_RADIUS.ROUND,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DIMENSIONS.PADDING.XL,
  },
  cameraControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  cameraControlButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  captureButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: DIMENSIONS.PADDING.LG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.select({
      ios: 50, // Account for status bar and notch on iOS
      android: 30, // Account for status bar on Android
    }),
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
  title: {
    fontSize: DIMENSIONS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  placeholder: {
    width: 40,
  },
  photoSection: {
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    overflow: 'hidden',
    height: 200,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    position: 'absolute',
    bottom: DIMENSIONS.PADDING.MD,
    right: DIMENSIONS.PADDING.MD,
  },
  retakeButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.PADDING.SM,
    paddingVertical: DIMENSIONS.PADDING.XS,
    borderRadius: DIMENSIONS.BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  retakeText: {
    color: COLORS.TEXT_PRIMARY,
    marginLeft: DIMENSIONS.PADDING.XS,
    fontSize: DIMENSIONS.FONT_SIZES.SM,
  },
  photoPlaceholder: {
    height: 200,
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  photoPlaceholderBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.GLASS_BORDER,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: DIMENSIONS.PADDING.SM,
    fontSize: DIMENSIONS.FONT_SIZES.MD,
  },
  formCard: {
    padding: DIMENSIONS.PADDING.LG,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    backgroundColor: COLORS.GLASS_BACKGROUND,
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  inputContainer: {
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  label: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.SM,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.GLASS_WHITE,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    borderRadius: DIMENSIONS.BORDER_RADIUS.MD,
    paddingHorizontal: DIMENSIONS.PADDING.MD,
    paddingVertical: DIMENSIONS.PADDING.SM,
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: DIMENSIONS.FONT_SIZES.XS,
    marginTop: DIMENSIONS.PADDING.XS,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GLASS_WHITE,
    paddingHorizontal: DIMENSIONS.PADDING.SM,
    paddingVertical: DIMENSIONS.PADDING.SM,
    borderRadius: DIMENSIONS.BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  locationText: {
    flex: 1,
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: DIMENSIONS.PADDING.SM,
    fontFamily: 'monospace',
  },
  locationError: {
    color: COLORS.ERROR,
  },
  retryLocationButton: {
    padding: DIMENSIONS.PADDING.XS,
  },
  submitButton: {
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: DIMENSIONS.PADDING.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: DIMENSIONS.FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
});

export default CreateEntryScreen;
