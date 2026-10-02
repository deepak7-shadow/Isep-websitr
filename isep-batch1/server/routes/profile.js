const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// ────────────────────────────────────────────────────────────────────────────
// Fallback data when MongoDB is offline
// ────────────────────────────────────────────────────────────────────────────
const fallbackMembers = [
  {
    _id: 'usr_01',
    fullName: 'Aaditya Sharma',
    email: 'aaditya.ise@college.edu',
    role: 'member',
    approvalStatus: 'approved',
    branch: 'ISE',
    year: '4th Year',
    bio: 'Full-stack developer passionate about open-source.',
    skills: ['JavaScript', 'React', 'Node.js'],
    github: 'https://github.com/aaditya',
    linkedin: '',
    portfolio: '',
    profilePhoto: ''
  },
  {
    _id: 'usr_02',
    fullName: 'Bhavya Patel',
    email: 'bhavya.ise@college.edu',
    role: 'member',
    approvalStatus: 'approved',
    branch: 'ISE',
    year: '4th Year',
    bio: 'UI/UX designer & frontend engineer.',
    skills: ['Figma', 'React', 'CSS'],
    github: '',
    linkedin: '',
    portfolio: '',
    profilePhoto: ''
  }
];

/**
 * @route   GET /api/profile/:userId
 * @desc    Get a member's public profile by userId (M8 Task 1a)
 * @access  Private (any logged-in member)
 */
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId).select('-password');
      if (user) {
        return res.json({ success: true, data: user });
      }
    } catch (dbErr) {}

    // Fallback
    const user = fallbackMembers.find(u => u._id === userId);
    if (user) return res.json({ success: true, data: user });

    return res.status(404).json({ success: false, message: 'User not found.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update own profile — bio, skills, links, photo (M8 Task 1b)
 * @access  Private (own account)
 */
router.put('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const allowedFields = [
      'fullName', 'bio', 'skills', 'github', 'linkedin',
      'portfolio', 'profilePhoto', 'branch', 'year'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (user) {
        return res.json({
          success: true,
          message: 'Profile updated successfully.',
          data: user
        });
      }
    } catch (dbErr) {}

    // Fallback: update in-memory (demo mode)
    const user = fallbackMembers.find(u => u._id === userId);
    if (user) {
      Object.assign(user, updates);
      return res.json({ success: true, message: 'Profile updated (demo mode).', data: user });
    }

    return res.status(404).json({ success: false, message: 'User not found.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/profile
 * @desc    List all approved members — public member directory (M8 Task 1c)
 * @access  Private (any logged-in member)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    try {
      const members = await User.find({
        $or: [{ approvalStatus: 'approved' }, { isApproved: true }]
      })
        .select('-password')
        .sort({ fullName: 1 });

      if (members && members.length > 0) {
        return res.json({ success: true, count: members.length, data: members });
      }
    } catch (dbErr) {}

    const approved = fallbackMembers.filter(u => u.approvalStatus === 'approved');
    return res.json({ success: true, count: approved.length, data: approved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
