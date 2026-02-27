import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { entryService } from '../services/entryService';
import { COLORS, DIMENSIONS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import EntryCard from '../components/EntryCard';
import EmptyState from '../components/EmptyState';

const HomeScreen = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { user, logout } = useAuth();

  const loadEntries = useCallback(async () => {
    try {
      const response = await entryService.getEntries();
      if (response.success) {
        setEntries(response.data.entries);
      } else {
        Alert.alert('Error', response.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      Alert.alert('Error', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEntries();
  }, [loadEntries]);

  const handleDeleteEntry = useCallback(async (entry) => {
    setSelectedEntry(entry);
    setDeleteModalVisible(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedEntry) return;

    setIsDeleting(true);
    try {
      const response = await entryService.deleteEntry(selectedEntry._id);
      if (response.success) {
        setEntries(prev => prev.filter(entry => entry._id !== selectedEntry._id));
        setDeleteModalVisible(false);
        setSelectedEntry(null);
      } else {
        Alert.alert('Error', response.message || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      Alert.alert('Error', ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedEntry]);

  const handleLogout = useCallback(() => {
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
  }, [logout]);

  const renderEntry = useCallback(({ item }) => (
    <EntryCard
      entry={item}
      onPress={() => router.push(`/entry/${item._id}`)}
      onDelete={() => handleDeleteEntry(item)}
    />
  ), [router, handleDeleteEntry]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{entries.length}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {new Set(entries.map(e => new Date(e.createdAt).toDateString())).size}
          </Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
      </View>
    </View>
  ), [user?.name, entries.length, handleLogout]);

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

      {/* Content */}
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.PRIMARY_GRADIENT[0]}
            colors={COLORS.PRIMARY_GRADIENT}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No Photos Yet"
            subtitle="Start capturing your memories with geotagged photos"
            icon="camera-outline"
            actionText="Take First Photo"
            onAction={() => router.push('/(tabs)/create')}
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/create')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={COLORS.PRIMARY_GRADIENT}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color={COLORS.TEXT_PRIMARY} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Delete Photo</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{selectedEntry?.title}"? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={COLORS.TEXT_PRIMARY} />
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
  listContainer: {
    padding: DIMENSIONS.PADDING.MD,
    paddingBottom: 100, // Extra padding for FAB
  },
  header: {
    paddingTop: Platform.select({
      ios: 50, // Account for status bar and notch on iOS
      android: 30, // Account for status bar on Android
    }),
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.MD,
  },
  welcomeText: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  userName: {
    fontSize: DIMENSIONS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  logoutButton: {
    padding: DIMENSIONS.PADDING.SM,
    borderRadius: DIMENSIONS.BORDER_RADIUS.ROUND,
    backgroundColor: COLORS.GLASS_WHITE,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.GLASS_WHITE,
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    padding: DIMENSIONS.PADDING.MD,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: DIMENSIONS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: DIMENSIONS.FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: DIMENSIONS.PADDING.XS,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.GLASS_BORDER,
    marginHorizontal: DIMENSIONS.PADDING.MD,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.OVERLAY,
  },
  modalContent: {
    margin: DIMENSIONS.PADDING.LG,
    padding: DIMENSIONS.PADDING.XL,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XL,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    backgroundColor: 'rgba(15, 32, 39, 0.95)',
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
  deleteButton: {
    backgroundColor: COLORS.ERROR,
  },
  cancelButtonText: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  deleteButtonText: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
});

export default HomeScreen;
