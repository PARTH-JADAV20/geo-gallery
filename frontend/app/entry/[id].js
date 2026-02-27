import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { entryService } from '../services/entryService';
import { COLORS, DIMENSIONS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

const EntryDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      const response = await entryService.getEntry(id);
      if (response.success) {
        setEntry(response.data.entry);
      } else {
        Alert.alert('Error', response.message || 'Failed to load entry');
        router.back();
      }
    } catch (error) {
      console.error('Load entry error:', error);
      Alert.alert('Error', ERROR_MESSAGES.UNKNOWN_ERROR);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;

    setIsDeleting(true);
    try {
      const response = await entryService.deleteEntry(entry._id);
      if (response.success) {
        Alert.alert('Success', SUCCESS_MESSAGES.ENTRY_DELETED);
        router.back();
      } else {
        Alert.alert('Error', response.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      Alert.alert('Error', ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={COLORS.BACKGROUND_GRADIENT}
          style={styles.background}
        />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_GRADIENT[0]} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={COLORS.BACKGROUND_GRADIENT}
          style={styles.background}
        />
        <Text style={styles.errorText}>Entry not found</Text>
      </View>
    );
  }

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

        <Text style={styles.headerTitle}>Entry Details</Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.deleteButtonBlur}
          >
            <Ionicons name="trash-outline" size={24} color={COLORS.ERROR} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Full Screen Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: entry.imageUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>

        {/* Entry Info */}
        <View style={styles.infoContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.infoCard}
          >
            <Text style={styles.title}>{entry.title}</Text>
            
            {entry.description && (
              <Text style={styles.description}>{entry.description}</Text>
            )}

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.PRIMARY_GRADIENT[0]} />
                <Text style={styles.metaText}>
                  {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color={COLORS.PRIMARY_GRADIENT[0]} />
                <Text style={styles.metaText}>
                  {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(15, 32, 39, 0.95)', 'rgba(44, 83, 100, 0.95)']}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Delete Entry</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{entry.title}"? This action cannot be undone.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color={COLORS.TEXT_PRIMARY} size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
  errorText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: DIMENSIONS.FONT_SIZES.LG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.select({
      ios: 50,
      android: 30,
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  deleteButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  content: {
    flex: 1,
    paddingHorizontal: DIMENSIONS.PADDING.LG,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    overflow: 'hidden',
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    marginBottom: DIMENSIONS.PADDING.XL,
  },
  infoCard: {
    padding: DIMENSIONS.PADDING.XL,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZES.XXL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.MD,
  },
  description: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  metaContainer: {
    gap: DIMENSIONS.PADDING.SM,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DIMENSIONS.PADDING.SM,
  },
  metaText: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    margin: DIMENSIONS.PADDING.LG,
    padding: DIMENSIONS.PADDING.XL,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: DIMENSIONS.FONT_SIZES.LG,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: DIMENSIONS.PADDING.MD,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: DIMENSIONS.PADDING.LG,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: DIMENSIONS.PADDING.MD,
  },
  modalButton: {
    flex: 1,
    paddingVertical: DIMENSIONS.PADDING.MD,
    borderRadius: DIMENSIONS.BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.GLASS_WHITE,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  cancelButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    fontWeight: '500',
  },
  deleteModalButton: {
    backgroundColor: COLORS.ERROR,
  },
  deleteButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    fontWeight: '500',
  },
});

export default EntryDetailScreen;
