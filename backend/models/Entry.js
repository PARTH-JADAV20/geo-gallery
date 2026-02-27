const mongoose = require('mongoose');

/**
 * Entry Schema
 * Defines the structure for photo entries with geotagging in the GeoTag Photo Logger app
 */
const EntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

/**
 * Index for efficient queries
 * Compound index on user and createdAt for sorting user entries by date
 */
EntrySchema.index({ user: 1, createdAt: -1 });

/**
 * Index for location-based queries
 * Useful for future features like finding entries near a location
 */
EntrySchema.index({ latitude: 1, longitude: 1 });

/**
 * Transform entry object for JSON response
 * Ensures consistent output format
 */
EntrySchema.methods.toJSON = function() {
  const entryObject = this.toObject();
  delete entryObject.__v;
  return entryObject;
};

/**
 * Static method to find entries by user with pagination
 * @param {string} userId - User ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @returns {Promise<Object>} - Paginated entries
 */
EntrySchema.statics.findByUserPaginated = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');
};

/**
 * Static method to find entries by user within date range
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Filtered entries
 */
EntrySchema.statics.findByUserAndDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Entry', EntrySchema);
