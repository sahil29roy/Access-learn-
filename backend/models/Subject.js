const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Arts', 'Foreign Languages', 'Technology', 'Physical Education'],
    default: 'Language Arts'
  },
  level: {
    type: String,
    enum: ['Elementary', 'Middle School', 'High School', 'College', 'Adult Education'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);