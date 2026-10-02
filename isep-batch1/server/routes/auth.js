const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'isep_batch1_secret_jwt_key_2024';

// ===============================
// REGISTER
// POST /api/auth/register
// ===============================
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, branch, year } = req.body;

    if (!fullName || !email || !password || !branch || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, email, password, branch and year.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      branch: branch.trim(),
      year: year.toString().trim(),
      role: 'member',
      approvalStatus: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin approval.',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        branch: user.branch,
        year: user.year,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    console.error('[Register Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
});

// ===============================
// LOGIN
// POST /api/auth/login
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // New User authentication
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (user.approvalStatus === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is awaiting admin approval.',
          approvalStatus: 'pending',
        });
      }

      if (user.approvalStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your registration was not approved.',
          approvalStatus: 'rejected',
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          branch: user.branch,
          year: user.year,
          role: user.role,
          approvalStatus: user.approvalStatus,
        },
      });
    }

    // Preserve existing Admin authentication
    let admin = null;

    try {
      admin = await Admin.findOne({ email: normalizedEmail });
    } catch (dbError) {
      console.warn('[Auth] Admin database lookup failed.');
    }

    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const token = jwt.sign(
        {
          userId: admin._id,
          role: 'admin',
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: admin._id,
          email: normalizedEmail,
          role: 'admin',
          approvalStatus: 'approved',
        },
        admin: {
          email: normalizedEmail,
          role: 'admin',
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  } catch (error) {
    console.error('[Login Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
});

// ===============================
// CURRENT USER
// GET /api/auth/me
// ===============================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
});

// ===============================
// LOGOUT
// POST /api/auth/logout
// ===============================
router.post('/logout', (req, res) => {
  return res.json({
    success: true,
    message: 'Logout successful. Please clear the token on the client.',
  });
});

module.exports = router;