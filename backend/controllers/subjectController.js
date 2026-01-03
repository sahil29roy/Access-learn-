const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getAllSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    // Add filters if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.level) {
      query.level = req.query.level;
    }

    const subjects = await Subject.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      count: subjects.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: subjects
    });
  } catch (error) {
    console.error('Error getting subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subjects'
    });
  }
};

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Public
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (!subject.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error getting subject by ID:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subject'
    });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
  try {
    // Check if user has permission (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create subjects'
      });
    }

    const subject = await Subject.create(req.body);

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating subject'
    });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if user has permission (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update subjects'
      });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedSubject
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating subject'
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if user has permission (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete subjects'
      });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting subject'
    });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};