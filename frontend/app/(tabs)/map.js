import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { entryService } from '../services/entryService';
import { COLORS, DIMENSIONS, MAP_CONFIG, ERROR_MESSAGES } from '../utils/constants';

const MapScreen = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState(MAP_CONFIG.INITIAL_REGION);

  const router = useRouter();

  const loadEntries = useCallback(async () => {
    try {
      const response = await entryService.getEntries();
      if (response.success) {
        setEntries(response.data.entries);
        
        // Update region to show all entries if available
        if (response.data.entries.length > 0) {
          const entries = response.data.entries;
          const latitudes = entries.map(e => e.latitude);
          const longitudes = entries.map(e => e.longitude);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLon = Math.min(...longitudes);
          const maxLon = Math.max(...longitudes);
          
          const centerLat = (minLat + maxLat) / 2;
          const centerLon = (minLon + maxLon) / 2;
          const latDelta = (maxLat - minLat) * 1.2; // Add padding
          const lonDelta = (maxLon - minLon) * 1.2; // Add padding
          
          setRegion({
            latitude: centerLat,
            longitude: centerLon,
            latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom level
            longitudeDelta: Math.max(lonDelta, 0.01), // Minimum zoom level
          });
        }
      } else {
        Alert.alert('Error', response.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      Alert.alert('Error', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleMarkerPress = useCallback((entry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewEntry = useCallback(() => {
    if (selectedEntry) {
      setModalVisible(false);
      router.push(`/entry/${selectedEntry._id}`);
    }
  }, [selectedEntry, router]);

  const handleNavigateToEntry = useCallback(() => {
    if (selectedEntry) {
      setRegion({
        latitude: selectedEntry.latitude,
        longitude: selectedEntry.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setModalVisible(false);
    }
  }, [selectedEntry]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={COLORS.BACKGROUND_GRADIENT}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_GRADIENT[0]} />
        <Text style={styles.loadingText}>Loading map data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={COLORS.BACKGROUND_GRADIENT}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Map */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingBackgroundColor={COLORS.BACKGROUND_GRADIENT[0]}
        loadingIndicatorColor={COLORS.PRIMARY_GRADIENT[0]}
      >
        {/* Markers for each entry */}
        {entries.map((entry) => (
          <Marker
            key={entry._id}
            coordinate={{
              latitude: entry.latitude,
              longitude: entry.longitude,
            }}
            onPress={() => handleMarkerPress(entry)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Image
                  source={{ uri: entry.imageUrl }}
                  style={styles.markerImage}
                />
                <View style={styles.markerOverlay} />
                <Ionicons 
                  name="location" 
                  size={16} 
                  color={COLORS.TEXT_PRIMARY} 
                  style={styles.markerIcon}
                />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <BlurView intensity={70} style={styles.headerBlur}>
          <Text style={styles.headerTitle}>Photo Map</Text>
          <Text style={styles.headerSubtitle}>
            {entries.length} {entries.length === 1 ? 'photo' : 'photos'} tagged
          </Text>
        </BlurView>
      </View>

      {/* Entry Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEntry && (
              <>
                {/* Entry Image */}
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedEntry.imageUrl }}
                    style={styles.modalImage}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <BlurView intensity={70} style={styles.closeButtonBlur}>
                      <Ionicons name="close" size={20} color={COLORS.TEXT_PRIMARY} />
                    </BlurView>
                  </TouchableOpacity>
                </View>

                {/* Entry Details */}
                <BlurView intensity={70} style={styles.modalDetails}>
                  <Text style={styles.modalTitle}>{selectedEntry.title}</Text>
                  {selectedEntry.description && (
                    <Text style={styles.modalDescription}>{selectedEntry.description}</Text>
                  )}
                  
                  <View style={styles.modalInfo}>
                    <View style={styles.modalInfoItem}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.PRIMARY_GRADIENT[0]} />
                      <Text style={styles.modalInfoText}>{formatDate(selectedEntry.createdAt)}</Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Ionicons name="location-outline" size={16} color={COLORS.PRIMARY_GRADIENT[0]} />
                      <Text style={styles.modalInfoText}>
                        {selectedEntry.latitude.toFixed(6)}, {selectedEntry.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.navigateButton]}
                      onPress={handleNavigateToEntry}
                    >
                      <LinearGradient
                        colors={COLORS.PRIMARY_GRADIENT}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="navigate-outline" size={20} color={COLORS.TEXT_PRIMARY} />
                        <Text style={styles.buttonText}>Navigate</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={handleViewEntry}
                    >
                      <LinearGradient
                        colors={COLORS.ACCENT_GRADIENT}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="eye-outline" size={20} color={COLORS.TEXT_PRIMARY} />
                        <Text style={styles.buttonText}>View Details</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: DIMENSIONS.PADDING.MD,
    fontSize: DIMENSIONS.FONT_SIZES.MD,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: DIMENSIONS.PADDING.LG,
    left: DIMENSIONS.PADDING.LG,
    right: DIMENSIONS.PADDING.LG,
  },
  headerBlur: {
    padding: DIMENSIONS.PADDING.MD,
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    backgroundColor: COLORS.GLASS_BACKGROUND,
  },
  headerTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: DIMENSIONS.PADDING.XS,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: MAP_CONFIG.MARKER_SIZE,
    height: MAP_CONFIG.MARKER_SIZE,
    borderRadius: MAP_CONFIG.MARKER_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.TEXT_PRIMARY,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  markerIcon: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: COLORS.TEXT_PRIMARY,
    borderRadius: 10,
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.OVERLAY,
  },
  modalContent: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: DIMENSIONS.BORDER_RADIUS.XXL,
    borderTopRightRadius: DIMENSIONS.BORDER_RADIUS.XXL,
    maxHeight: '80%',
  },
  modalImageContainer: {
    height: 250,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: DIMENSIONS.BORDER_RADIUS.XXL,
    borderTopRightRadius: DIMENSIONS.BORDER_RADIUS.XXL,
  },
  closeButton: {
    position: 'absolute',
    top: DIMENSIONS.PADDING.LG,
    right: DIMENSIONS.PADDING.LG,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  modalDetails: {
    padding: DIMENSIONS.PADDING.LG,
    backgroundColor: COLORS.GLASS_BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    borderBottomLeftRadius: DIMENSIONS.BORDER_RADIUS.XXL,
    borderBottomRightRadius: DIMENSIONS.BORDER_RADIUS.XXL,
  },
  modalTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.SM,
  },
  modalDescription: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: DIMENSIONS.PADDING.MD,
  },
  modalInfo: {
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.SM,
  },
  modalInfoText: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: DIMENSIONS.PADDING.SM,
  },
  modalActions: {
    flexDirection: 'row',
    gap: DIMENSIONS.PADDING.MD,
  },
  actionButton: {
    flex: 1,
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  navigateButton: {
    flex: 1,
  },
  viewButton: {
    flex: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DIMENSIONS.PADDING.MD,
    gap: DIMENSIONS.PADDING.SM,
  },
  buttonText: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
});

export default MapScreen;
