import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { entryService } from '../services/entryService';
import { COLORS, DIMENSIONS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
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
      const data = await entryService.getEntries();
      setEntries(data);
      
      // Center map on first entry if available
      if (data.length > 0) {
        setMapRegion({
          latitude: parseFloat(data[0].location.coordinates[1]),
          longitude: parseFloat(data[0].location.coordinates[0]),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load photo locations');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = useCallback((entry) => {
    setSelectedEntry(entry);
    Alert.alert(
      entry.title || 'Photo Location',
      `📍 ${entry.location?.name || 'Unknown Location'}\n📅 ${new Date(entry.createdAt).toLocaleDateString()}\n📝 ${entry.description || 'No description'}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'View Details', onPress: () => setSelectedEntry(null) }
      ]
    );
  }, []);

  const renderMarker = (entry) => {
    const latitude = parseFloat(entry.location.coordinates[1]);
    const longitude = parseFloat(entry.location.coordinates[0]);
    
    return (
      <Marker
        key={entry._id}
        coordinate={{ latitude, longitude }}
        title={entry.title || 'Photo'}
        description={entry.location?.name || 'Unknown Location'}
        onPress={() => handleMarkerPress(entry)}
      >
        <View style={styles.markerContainer}>
          <View style={styles.markerPin}>
            <Ionicons name="location" size={16} color={COLORS.WHITE} />
          </View>
          <View style={styles.markerPhoto}>
            {entry.image && (
              <Image
                source={{ uri: entry.image }}
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
        {entries.map(renderMarker)}
      </MapView>
      
      {selectedEntry && (
        <BlurView intensity={80} style={styles.photoOverlay}>
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: selectedEntry.image }}
              style={styles.photoImage}
              resizeMode="cover"
            />
            <View style={styles.photoInfo}>
              <Text style={styles.photoTitle}>{selectedEntry.title || 'Photo'}</Text>
              <Text style={styles.photoLocation}>
                📍 {selectedEntry.location?.name || 'Unknown Location'}
              </Text>
              <Text style={styles.photoDate}>
                📅 {new Date(selectedEntry.createdAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedEntry(null)}
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
    top: -10,
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
