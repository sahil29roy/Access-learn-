const Content = require('../models/Content');
const Subject = require('../models/Subject');

// @desc    Get all content
// @route   GET /api/content
// @access  Public
const getAllContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true, isApproved: true };
    
    // Add filters if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.subject) {
      query.subject = req.query.subject;
    }
    
    if (req.query.level) {
      query.level = req.query.level;
    }

    const content = await Content.find(query)
      .populate('subject', 'name code')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Content.countDocuments(query);

    res.status(200).json({
      success: true,
      count: content.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: content
    });
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content'
    });
  }
};

// @desc    Get content by ID
// @route   GET /api/content/:id
// @access  Public
const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('createdBy', 'name email role');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (!content.isActive || !content.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error getting content by ID:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content'
    });
  }
};

// @desc    Get content by subject
// @route   GET /api/content/subject/:subjectId
// @access  Public
const getContentBySubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const content = await Content.find({
      subject: req.params.subjectId,
      isActive: true,
      isApproved: true
    })
      .populate('subject', 'name code')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Content.countDocuments({
      subject: req.params.subjectId,
      isActive: true,
      isApproved: true
    });

    res.status(200).json({
      success: true,
      count: content.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: content
    });
  } catch (error) {
    console.error('Error getting content by subject:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content by subject'
    });
  }
};

// @desc    Create new content
// @route   POST /api/content
// @access  Private
const createContent = async (req, res) => {
  try {
    // Check if user has permission (teacher or admin)
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create content'
      });
    }

    // Check if subject exists
    const subject = await Subject.findById(req.body.subject);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Add createdBy field
    req.body.createdBy = req.user._id;

    const content = await Content.create(req.body);

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error creating content:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating content'
    });
  }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private
const updateContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if user has permission (must be creator or admin)
    if (req.user.role !== 'admin' && content.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this content'
      });
    }

    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('subject', 'name code');

    res.status(200).json({
      success: true,
      data: updatedContent
    });
  } catch (error) {
    console.error('Error updating content:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
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
      message: 'Server error while updating content'
    });
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private
const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if user has permission (must be admin)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete content'
      });
    }

    await Content.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting content'
    });
  }
};

module.exports = {
  getAllContent,
  getContentById,
  getContentBySubject,
  createContent,
  updateContent,
  deleteContent
};