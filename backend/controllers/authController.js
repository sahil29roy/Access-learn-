const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Create session
    const session = await Session.create({
      userId: user._id,
      loginAt: new Date()
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      sessionId: session._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Find and update the session
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if session belongs to current user
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this session'
      });
    }

    // Set logout time and calculate duration
    const logoutTime = new Date();
    session.logoutAt = logoutTime;
    
    // Calculate duration in minutes
    const durationMs = logoutTime.getTime() - session.loginAt.getTime();
    session.durationMinutes = Math.max(0, Math.round(durationMs / (1000 * 60)));
    
    await session.save();

    // Update user's total active minutes
    const user = await User.findById(req.user._id);
    if (user) {
      user.lastLogoutAt = logoutTime;
      user.totalActiveMinutes = (user.totalActiveMinutes || 0) + session.durationMinutes;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
      durationMinutes: session.durationMinutes
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

module.exports = {
  login,
  logout
};