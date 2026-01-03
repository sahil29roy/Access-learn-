const express = require('express');
const { getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const auth = require('../middleware/auth');

const router = express.Router();

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
router.get('/', getAllSubjects);

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Public
router.get('/:id', getSubjectById);

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin only)
router.post('/', auth, createSubject);

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
router.put('/:id', auth, updateSubject);

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
router.delete('/:id', auth, deleteSubject);

module.exports = router;