const express = require('express');
const { login, logout } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', auth, logout);

module.exports = router;