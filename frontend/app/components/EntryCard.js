import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, DIMENSIONS } from '../utils/constants';
import { getLocationName } from '../utils/locationHelper';

const EntryCard = ({ entry, onPress, onDelete }) => {
  const [locationName, setLocationName] = useState('Loading location...');

  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        const name = await getLocationName(entry.latitude, entry.longitude);
        setLocationName(name);
      } catch (error) {
        console.error('Error getting location name:', error);
        setLocationName('Location detected');
      }
    };

    fetchLocationName();
  }, [entry.latitude, entry.longitude]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImagePress = () => {
    // Navigate to entry detail screen
    onPress(entry._id);
  };

  const handleDeletePress = () => {
    // Directly call onDelete without showing alert
    // The parent component will handle the confirmation modal
    onDelete();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleImagePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.card}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: entry.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {entry.title}
              </Text>
              <Text style={styles.date}>
                {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
              </Text>
            </View>
            
            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.ERROR} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          {entry.description && (
            <Text style={styles.description} numberOfLines={2}>
              {entry.description}
            </Text>
          )}

          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons 
              name="location-outline" 
              size={16} 
              color={COLORS.PRIMARY_GRADIENT[0]} 
            />
            <Text style={styles.location}>
              {locationName}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DIMENSIONS.PADDING.MD,
  },
  card: {
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    backgroundColor: COLORS.GLASS_BACKGROUND,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
  },
  content: {
    padding: DIMENSIONS.PADDING.MD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DIMENSIONS.PADDING.SM,
  },
  titleContainer: {
    flex: 1,
    marginRight: DIMENSIONS.PADDING.SM,
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.XS,
  },
  date: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_MUTED,
  },
  deleteButton: {
    padding: DIMENSIONS.PADDING.XS,
    borderRadius: DIMENSIONS.BORDER_RADIUS.SM,
    backgroundColor: COLORS.GLASS_WHITE,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  description: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: DIMENSIONS.PADDING.SM,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GLASS_WHITE,
    paddingHorizontal: DIMENSIONS.PADDING.SM,
    paddingVertical: DIMENSIONS.PADDING.XS,
    borderRadius: DIMENSIONS.BORDER_RADIUS.SM,
    alignSelf: 'flex-start',
  },
  location: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: DIMENSIONS.PADDING.XS,
    fontFamily: 'monospace',
  },
});

export default EntryCard;
