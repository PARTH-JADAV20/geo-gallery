import * as Location from 'expo-location';

/**
 * Get location name from coordinates using reverse geocoding
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} - Location name
 */
export const getLocationName = async (latitude, longitude) => {
  try {
    const geocoded = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (geocoded && geocoded.length > 0) {
      const address = geocoded[0];
      const locationParts = [
        address.street,
        address.district,
        address.city,
        address.region,
        address.country
      ].filter(Boolean);
      
      return locationParts.slice(0, 2).join(', ') || 'Unknown Location';
    } else {
      return 'Location detected';
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Location detected';
  }
};

/**
 * Format coordinates for display
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string} - Formatted coordinates
 */
export const formatCoordinates = (latitude, longitude) => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Calculate distance between two coordinates in meters
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} - Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
