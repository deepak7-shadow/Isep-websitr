const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const verifyToken = require('../middleware/auth');

// ────────────────────────────────────────────────────────────────────────────
// Fallback data when MongoDB is offline
// ────────────────────────────────────────────────────────────────────────────
let fallbackAchievements = [
  {
    _id: 'ach_01',
    userId: 'usr_01',
    title: '1st Place — College Hackathon 2024',
    description: 'Won first place in the annual college hackathon with Project ISEP Portal.',
    date: '2024-02-20',
    category: 'Hackathon',
    proofImage: '',
    createdAt: new Date('2024-02-20')
  }
];

const VALID_CATEGORIES = ['Hackathon', 'Certification', 'Award', 'Academic', 'Sports', 'Other'];

/**
 * @route   POST /api/achievements/member
 * @desc    Add a new achievement (M8 Task 4a)
 * @access  Private
 */
router.post('/member', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { title, description, date, category, proofImage } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Achievement title is required.' });
    }

    try {
      const achievement = await Achievement.create({
        userId,
        title,
        description: description || '',
        date: date || null,
        category: VALID_CATEGORIES.includes(category) ? category : 'Other',
        proofImage: proofImage || ''
      });
      return res.status(201).json({ success: true, message: 'Achievement added successfully.', data: achievement });
    } catch (dbErr) {}

    // Fallback
    const newAch = {
      _id: `ach_${Date.now()}`,
      userId,
      title,
      description: description || '',
      date: date || null,
      category: VALID_CATEGORIES.includes(category) ? category : 'Other',
      proofImage: proofImage || '',
      createdAt: new Date()
    };
    fallbackAchievements.push(newAch);
    return res.status(201).json({ success: true, message: 'Achievement added (demo mode).', data: newAch });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/achievements/user/:userId
 * @desc    Get all achievements for a specific user (M8 Task 4b)
 * @access  Private
 */
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const achievements = await Achievement.find({ userId }).sort({ date: -1, createdAt: -1 });
      return res.json({ success: true, count: achievements.length, data: achievements });
    } catch (dbErr) {}

    const achievements = fallbackAchievements.filter(a => a.userId === userId);
    return res.json({ success: true, count: achievements.length, data: achievements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/achievements/member/:id
 * @desc    Edit own achievement — ownership enforced (M8 Task 4c)
 * @access  Private (owner only)
 */
router.put('/member/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;
    const { title, description, date, category, proofImage } = req.body;

    try {
      const achievement = await Achievement.findById(id);
      if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' });

      if (achievement.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own achievements.' });
      }

      if (title !== undefined) achievement.title = title;
      if (description !== undefined) achievement.description = description;
      if (date !== undefined) achievement.date = date;
      if (category !== undefined) achievement.category = VALID_CATEGORIES.includes(category) ? category : 'Other';
      if (proofImage !== undefined) achievement.proofImage = proofImage;

      await achievement.save();
      return res.json({ success: true, message: 'Achievement updated successfully.', data: achievement });
    } catch (dbErr) {}

    // Fallback
    const achievement = fallbackAchievements.find(a => a._id === id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' });
    if (achievement.userId !== userId) return res.status(403).json({ success: false, message: 'Access denied.' });

    Object.assign(achievement, { title, description, date, category, proofImage });
    return res.json({ success: true, message: 'Achievement updated (demo mode).', data: achievement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   DELETE /api/achievements/member/:id
 * @desc    Delete own achievement — ownership enforced (M8 Task 4d)
 * @access  Private (owner only)
 */
router.delete('/member/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    try {
      const achievement = await Achievement.findById(id);
      if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' });

      if (achievement.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own achievements.' });
      }

      await achievement.deleteOne();
      return res.json({ success: true, message: 'Achievement deleted successfully.' });
    } catch (dbErr) {}

    // Fallback
    const index = fallbackAchievements.findIndex(a => a._id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Achievement not found.' });
    if (fallbackAchievements[index].userId !== userId) return res.status(403).json({ success: false, message: 'Access denied.' });

    fallbackAchievements.splice(index, 1);
    return res.json({ success: true, message: 'Achievement deleted (demo mode).' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
