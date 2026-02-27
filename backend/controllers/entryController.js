const { body, validationResult } = require('express-validator');
const Entry = require('../models/Entry');

/**
 * @desc    Create a new entry
 * @route   POST /api/entries
 * @access  Private
 */
const createEntry = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, latitude, longitude } = req.body;

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Create image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Create new entry
    const entry = await Entry.create({
      user: req.user.userId,
      title,
      description,
      imageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    });

    // Populate user information
    await entry.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Entry created successfully',
      data: {
        entry
      }
    });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating entry'
    });
  }
};

/**
 * @desc    Get all entries for the logged-in user
 * @route   GET /api/entries
 * @access  Private
 */
const getEntries = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    let entries;
    
    if (startDate && endDate) {
      // Filter by date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      entries = await Entry.findByUserAndDateRange(req.user.userId, start, end);
    } else {
      // Get paginated entries
      entries = await Entry.findByUserPaginated(
        req.user.userId,
        parseInt(page),
        parseInt(limit)
      );
    }

    // Get total count for pagination
    const totalCount = await Entry.countDocuments({ user: req.user.userId });

    res.status(200).json({
      success: true,
      data: {
        entries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalEntries: totalCount,
          entriesPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching entries'
    });
  }
};

/**
 * @desc    Get a single entry by ID
 * @route   GET /api/entries/:id
 * @access  Private
 */
const getEntry = async (req, res) => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('user', 'name email');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        entry
      }
    });
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching entry'
    });
  }
};

/**
 * @desc    Update an entry
 * @route   PUT /api/entries/:id
 * @access  Private
 */
const updateEntry = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, latitude, longitude } = req.body;

    // Find and update entry
    const entry = await Entry.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId
      },
      {
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Entry updated successfully',
      data: {
        entry
      }
    });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating entry'
    });
  }
};

/**
 * @desc    Delete an entry
 * @route   DELETE /api/entries/:id
 * @access  Private
 */
const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting entry'
    });
  }
};

/**
 * Validation middleware for creating/updating entries
 */
const validateEntry = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

module.exports = {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  validateEntry
};
