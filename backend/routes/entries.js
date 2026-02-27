const express = require('express');
const router = express.Router();
const {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  validateEntry
} = require('../controllers/entryController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

/**
 * @route   POST /api/entries
 * @desc    Create a new entry with image upload
 * @access  Private
 */
router.post('/', protect, upload.single('image'), validateEntry, createEntry);

/**
 * @route   GET /api/entries
 * @desc    Get all entries for the logged-in user
 * @access  Private
 */
router.get('/', protect, getEntries);

/**
 * @route   GET /api/entries/:id
 * @desc    Get a single entry by ID
 * @access  Private
 */
router.get('/:id', protect, getEntry);

/**
 * @route   PUT /api/entries/:id
 * @desc    Update an entry
 * @access  Private
 */
router.put('/:id', protect, validateEntry, updateEntry);

/**
 * @route   DELETE /api/entries/:id
 * @desc    Delete an entry
 * @access  Private
 */
router.delete('/:id', protect, deleteEntry);

module.exports = router;
