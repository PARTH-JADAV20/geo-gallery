import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { entryService } from '../services/entryService';
import { COLORS, DIMENSIONS } from '../utils/constants';
import { getLocationName } from '../utils/locationHelper';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await entryService.getEntries();
      console.log('Map entries response:', response);
      
      // Handle different response structures
      let entriesData = [];
      if (response && response.data && response.data.entries) {
        entriesData = response.data.entries;
      } else if (response && response.entries) {
        entriesData = response.entries;
      } else if (response && Array.isArray(response)) {
        entriesData = response;
      } else if (response && Array.isArray(response.data)) {
        entriesData = response.data;
      }
      
      console.log('Processed entries data:', entriesData);
       
       // Ensure data is an array
      if (Array.isArray(entriesData)) {
        setEntries(entriesData);
         
         // Center map on first entry if available
        if (entriesData.length > 0) {
          const firstEntry = entriesData[0];
          
          // Handle different coordinate formats
          let latitude, longitude;
          if (firstEntry.location && firstEntry.location.coordinates && Array.isArray(firstEntry.location.coordinates)) {
            // Standard GeoJSON format: [longitude, latitude]
            longitude = parseFloat(firstEntry.location.coordinates[0]);
            latitude = parseFloat(firstEntry.location.coordinates[1]);
          } else if (firstEntry.location && firstEntry.location.lat && firstEntry.location.lng) {
            // Alternative format: { lat, lng }
            latitude = parseFloat(firstEntry.location.lat);
            longitude = parseFloat(firstEntry.location.lng);
          } else if (firstEntry.location && firstEntry.location.latitude && firstEntry.location.longitude) {
            // Alternative format: { latitude, longitude }
            latitude = parseFloat(firstEntry.location.latitude);
            longitude = parseFloat(firstEntry.location.longitude);
          } else if (firstEntry.latitude && firstEntry.longitude) {
            // Direct coordinates on entry object
            latitude = parseFloat(firstEntry.latitude);
            longitude = parseFloat(firstEntry.longitude);
          }
          
          if (!isNaN(latitude) && !isNaN(longitude)) {
            console.log('Centering map on:', { latitude, longitude });
            setMapRegion({
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          } else {
            console.warn('Invalid coordinates for first entry:', firstEntry);
          }
        }
      } else {
        console.warn('Entries data is not an array:', entriesData);
        setEntries([]);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load photo locations');
      setEntries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = useCallback(async (entry) => {
    setSelectedEntry(entry);
    
    // Get location name from coordinates
    let locationText = '';
    if (entry.location && entry.location.name) {
      locationText = entry.location.name;
    } else if (entry.latitude && entry.longitude) {
      locationText = await getLocationName(entry.latitude, entry.longitude);
    } else if (entry.location && entry.location.coordinates && Array.isArray(entry.location.coordinates)) {
      const longitude = entry.location.coordinates[0];
      const latitude = entry.location.coordinates[1];
      locationText = await getLocationName(latitude, longitude);
    } else if (entry.location && entry.location.lat && entry.location.lng) {
      locationText = await getLocationName(entry.location.lat, entry.location.lng);
    }
    
    setSelectedLocationName(locationText);
  }, []);

  const renderMarker = (entry) => {
    // Handle different coordinate formats
    let latitude, longitude;
    
    if (entry.location && entry.location.coordinates && Array.isArray(entry.location.coordinates)) {
      // Standard GeoJSON format: [longitude, latitude]
      longitude = parseFloat(entry.location.coordinates[0]);
      latitude = parseFloat(entry.location.coordinates[1]);
    } else if (entry.location && entry.location.lat && entry.location.lng) {
      // Alternative format: { lat, lng }
      latitude = parseFloat(entry.location.lat);
      longitude = parseFloat(entry.location.lng);
    } else if (entry.location && entry.location.latitude && entry.location.longitude) {
      // Alternative format: { latitude, longitude }
      latitude = parseFloat(entry.location.latitude);
      longitude = parseFloat(entry.location.longitude);
    } else if (entry.latitude && entry.longitude) {
      // Direct coordinates on entry object
      latitude = parseFloat(entry.latitude);
      longitude = parseFloat(entry.longitude);
    } else {
      console.warn('Invalid location format for entry:', entry);
      return null;
    }
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.warn('Invalid coordinates:', { latitude, longitude });
      return null;
    }
    
    // Create location description for marker - prioritize name first
    let locationDescription = '';
    if (entry.location && entry.location.name) {
      locationDescription = entry.location.name;
    } else if (entry.latitude && entry.longitude) {
      getLocationName(entry.latitude, entry.longitude).then(name => {
        locationDescription = name;
      });
      locationDescription = `${entry.latitude.toFixed(6)}, ${entry.longitude.toFixed(6)}`;
    } else if (entry.location && entry.location.coordinates && Array.isArray(entry.location.coordinates)) {
      const longitude = entry.location.coordinates[0];
      const latitude = entry.location.coordinates[1];
      getLocationName(latitude, longitude).then(name => {
        locationDescription = name;
      });
      locationDescription = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
    
    // Use imageUrl if available, fallback to image
    const imageUri = entry.imageUrl || entry.image;
    console.log('Marker image URI:', imageUri);
    
    return (
      <Marker
        key={entry._id || entry.id}
        coordinate={{ latitude, longitude }}
        title={entry.title || 'Photo'}
        description={locationDescription}
        onPress={() => handleMarkerPress(entry)}
      >
        <View style={styles.markerContainer}>
          <View style={styles.markerPin}>
            <Ionicons name="location" size={18} color={COLORS.WHITE} />
          </View>
          <View style={styles.markerPhoto}>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.markerImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>
      </Marker>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={COLORS.BACKGROUND_GRADIENT} style={styles.loadingGradient}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_GRADIENT[0]} />
          <Text style={styles.loadingText}>Loading photo locations...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient colors={COLORS.BACKGROUND_GRADIENT} style={styles.emptyGradient}>
          <Ionicons name="map-outline" size={80} color={COLORS.TEXT_MUTED} />
          <Text style={styles.emptyTitle}>No Photos Yet</Text>
          <Text style={styles.emptyMessage}>
            Start capturing photos to see them on the map
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
        loadingEnabled={true}
      >
        {entries && entries.length > 0 && entries.map(renderMarker)}
      </MapView>
      
      {selectedEntry && (
        <BlurView intensity={80} style={styles.photoOverlay}>
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: selectedEntry.imageUrl || selectedEntry.image }}
              style={styles.photoImage}
              resizeMode="cover"
            />
            <View style={styles.photoInfo}>
              <Text style={styles.photoTitle}>{selectedEntry.title || 'Photo'}</Text>
              <Text style={styles.photoLocation}>
                📍 {selectedLocationName}
              </Text>
              <Text style={styles.photoDate}>
                📅 {new Date(selectedEntry.createdAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setSelectedEntry(null);
                  setSelectedLocationName('');
                }}
              >
                <Ionicons name="close" size={24} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: DIMENSIONS.PADDING.MD,
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_MUTED,
    marginTop: DIMENSIONS.PADDING.LG,
  },
  emptyMessage: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: DIMENSIONS.PADDING.SM,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    backgroundColor: COLORS.PRIMARY_GRADIENT[0],
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  markerPhoto: {
    position: 'absolute',
    bottom: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    overflow: 'hidden',
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    width: width * 0.8,
    maxHeight: height * 0.6,
    backgroundColor: COLORS.GLASS_BACKGROUND,
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '70%',
  },
  photoInfo: {
    padding: DIMENSIONS.PADDING.MD,
    backgroundColor: COLORS.GLASS_BACKGROUND,
  },
  photoTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.SM,
  },
  photoLocation: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: DIMENSIONS.PADDING.XS,
  },
  photoDate: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_MUTED,
  },
  closeButton: {
    position: 'absolute',
    top: DIMENSIONS.PADDING.MD,
    right: DIMENSIONS.PADDING.MD,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.GLASS_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
