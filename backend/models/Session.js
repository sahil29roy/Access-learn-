const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loginAt: {
    type: Date,
    required: true
  },
  logoutAt: {
    type: Date
  },
  durationMinutes: {
    type: Number
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Session', sessionSchema);