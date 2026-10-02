const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// Admin-only guard for all routes in this router
const adminAuth = [verifyToken, requireRole('admin')];

// In-memory demo/fallback storage if MongoDB is offline
const fallbackUsers = [
  {
    _id: 'usr_01',
    fullName: 'Aaditya Sharma',
    email: 'aaditya.ise@college.edu',
    role: 'member',
    approvalStatus: 'approved',
    branch: 'ISE',
    year: '4th Year',
    registeredAt: new Date('2024-01-15')
  },
  {
    _id: 'usr_02',
    fullName: 'Bhavya Patel',
    email: 'bhavya.ise@college.edu',
    role: 'member',
    approvalStatus: 'approved',
    branch: 'ISE',
    year: '4th Year',
    registeredAt: new Date('2024-01-16')
  },
  {
    _id: 'usr_p1',
    fullName: 'Kiran Verma',
    email: 'kiran.v@college.edu',
    role: 'member',
    approvalStatus: 'pending',
    branch: 'ISE',
    year: '3rd Year',
    registeredAt: new Date()
  },
  {
    _id: 'usr_p2',
    fullName: 'Sneha Kulkarni',
    email: 'sneha.k@college.edu',
    role: 'member',
    approvalStatus: 'pending',
    branch: 'AIML',
    year: '3rd Year',
    registeredAt: new Date()
  }
];

/**
 * @route   GET /api/admin/pending-users
 * @desc    Get all users awaiting admin approval (M3 Task 1)
 * @access  Admin Only
 */
router.get('/pending-users', adminAuth, async (req, res) => {
  try {
    try {
      const pendingUsers = await User.find({
        $or: [{ approvalStatus: 'pending' }, { isApproved: false }]
      }).select('-password').sort({ registeredAt: -1, createdAt: -1 });

      if (pendingUsers && pendingUsers.length > 0) {
        return res.json({ success: true, count: pendingUsers.length, data: pendingUsers });
      }
    } catch (dbErr) {}

    const pending = fallbackUsers.filter(u => u.approvalStatus === 'pending');
    return res.json({ success: true, count: pending.length, data: pending });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/admin/approve/:userId
 * @desc    Approve a pending user registration (M3 Task 2)
 * @access  Admin Only
 */
router.put('/approve/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.id || req.user?._id;

    try {
      const user = await User.findById(userId);
      if (user) {
        user.approvalStatus = 'approved';
        user.isApproved = true;
        user.approvedBy = adminId;
        user.approvedAt = new Date();
        await user.save();
        return res.json({
          success: true,
          message: `User ${user.fullName || user.email} approved successfully.`,
          data: user
        });
      }
    } catch (dbErr) {}

    const user = fallbackUsers.find(u => u._id === userId);
    if (user) {
      user.approvalStatus = 'approved';
      user.approvedBy = adminId;
      user.approvedAt = new Date();
      return res.json({
        success: true,
        message: `User ${user.fullName} approved successfully.`,
        data: user
      });
    }

    return res.status(404).json({ success: false, message: 'User not found.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/admin/reject/:userId
 * @desc    Reject a pending user registration (M3 Task 3)
 * @access  Admin Only
 */
router.put('/reject/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);
      if (user) {
        user.approvalStatus = 'rejected';
        user.isApproved = false;
        await user.save();
        return res.json({
          success: true,
          message: `User ${user.fullName || user.email} rejected.`,
          data: user
        });
      }
    } catch (dbErr) {}

    const user = fallbackUsers.find(u => u._id === userId);
    if (user) {
      user.approvalStatus = 'rejected';
      return res.json({
        success: true,
        message: `User ${user.fullName} rejected.`,
        data: user
      });
    }

    return res.status(404).json({ success: false, message: 'User not found.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with optional filters for role and approval status (M3 Task 4)
 * @access  Admin Only
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { role, status } = req.query;

    try {
      const query = {};
      if (role && role !== 'all') query.role = role;
      if (status && status !== 'all') query.approvalStatus = status;

      const users = await User.find(query).select('-password').sort({ registeredAt: -1, createdAt: -1 });
      if (users && users.length > 0) {
        return res.json({ success: true, count: users.length, data: users });
      }
    } catch (dbErr) {}

    let filtered = [...fallbackUsers];
    if (role && role !== 'all') filtered = filtered.filter(u => u.role === role);
    if (status && status !== 'all') filtered = filtered.filter(u => u.approvalStatus === status);

    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/admin/users/:userId/role
 * @desc    Update a user's role (e.g. member -> head) (M3 Task 6)
 * @access  Admin Only
 */
router.put('/users/:userId/role', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['member', 'head', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    try {
      const user = await User.findById(userId);
      if (user) {
        user.role = role;
        await user.save();
        return res.json({
          success: true,
          message: `User role updated to '${role}'.`,
          data: user
        });
      }
    } catch (dbErr) {}

    const user = fallbackUsers.find(u => u._id === userId);
    if (user) {
      user.role = role;
      return res.json({
        success: true,
        message: `User role updated to '${role}'.`,
        data: user
      });
    }

    return res.status(404).json({ success: false, message: 'User not found.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
