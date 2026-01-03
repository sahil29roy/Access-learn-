const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['poem', 'article', 'lesson', 'exercise', 'quiz', 'video', 'audio', 'document', 'interactive'],
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Content body is required']
  },
  author: {
    type: String,
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: Number, // 1-10 scale
    min: 1,
    max: 10,
    default: 5
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);