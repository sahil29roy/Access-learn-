const express = require('express');
const { getAllContent, getContentById, createContent, updateContent, deleteContent, getContentBySubject } = require('../controllers/contentController');
const auth = require('../middleware/auth');

const router = express.Router();

// @desc    Get all content
// @route   GET /api/content
// @access  Public
router.get('/', getAllContent);

// @desc    Get content by ID
// @route   GET /api/content/:id
// @access  Public
router.get('/:id', getContentById);

// @desc    Get content by subject
// @route   GET /api/content/subject/:subjectId
// @access  Public
router.get('/subject/:subjectId', getContentBySubject);

// @desc    Create new content
// @route   POST /api/content
// @access  Private (Teacher/Admin only)
router.post('/', auth, createContent);

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private (Teacher/Admin only)
router.put('/:id', auth, updateContent);

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private (Admin only)
router.delete('/:id', auth, deleteContent);

module.exports = router;