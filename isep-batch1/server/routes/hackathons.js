const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Hackathon = require('../models/Hackathon');
const verifyToken = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// In-memory fallback if MongoDB is temporarily offline
let fallbackHackathons = [
  {
    _id: 'hack_demo_1',
    hackathonName: 'Smart India Hackathon (SIH)',
    date: new Date('2024-03-15'),
    description: 'Developed an AI-driven agricultural crop anomaly detection and advisory system for rural farmers.',
    teamMembers: ['Deepak R', 'Aditia Nayak', 'Shreya D', 'Shane Fredrick'],
    images: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'],
    result: 'Finalist — Top 5 Nationwide',
    experience: 'Intense 36 hours of non-stop prototyping, rigorous jury defenses, and real-world system architecture under pressure.'
  }
];

const databaseIsReady = () => mongoose.connection.readyState === 1;

function normalizeHackathon(payload, createdBy) {
  const { hackathonName, date, description, teamMembers, images, result, experience } = payload || {};
  const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

  const normalizedName = asTrimmedString(hackathonName);
  if (!normalizedName) {
    const error = new Error('Hackathon name is required.');
    error.status = 400;
    throw error;
  }

  const parsedDate = date ? new Date(date) : new Date();
  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error('Please provide a valid date.');
    error.status = 400;
    throw error;
  }

  // Parse team members
  let normalizedMembers = [];
  if (Array.isArray(teamMembers)) {
    normalizedMembers = teamMembers.map((m) => String(m).trim()).filter(Boolean);
  } else if (typeof teamMembers === 'string') {
    normalizedMembers = teamMembers.split(',').map((m) => m.trim()).filter(Boolean);
  }

  // Parse images
  let normalizedImages = [];
  if (Array.isArray(images)) {
    normalizedImages = images.map((img) => String(img).trim()).filter(Boolean);
  } else if (typeof images === 'string') {
    normalizedImages = images.split(',').map((img) => img.trim()).filter(Boolean);
  }

  return {
    hackathonName: normalizedName,
    date: parsedDate,
    description: asTrimmedString(description),
    teamMembers: normalizedMembers,
    images: normalizedImages,
    result: asTrimmedString(result) || 'Participated',
    experience: asTrimmedString(experience),
    ...(createdBy ? { createdBy } : {})
  };
}

/**
 * @route   GET /api/hackathons
 * @desc    List all hackathons
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    if (databaseIsReady()) {
      const hackathons = await Hackathon.find().sort({ date: -1, createdAt: -1 });
      return res.json({ success: true, count: hackathons.length, data: hackathons });
    }

    const hackathons = [...fallbackHackathons].sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({ success: true, count: hackathons.length, data: hackathons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/hackathons/:id
 * @desc    Get single hackathon by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (databaseIsReady()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid hackathon ID format.' });
      }

      const hackathon = await Hackathon.findById(id);
      if (!hackathon) {
        return res.status(404).json({ success: false, message: 'Hackathon record not found.' });
      }

      return res.json({ success: true, data: hackathon });
    }

    const item = fallbackHackathons.find((h) => h._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Hackathon record not found.' });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/hackathons
 * @desc    Create new hackathon entry
 * @access  Admin only
 */
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id || req.user._id : null;
    const hackathonData = normalizeHackathon(req.body, currentUserId);

    if (databaseIsReady()) {
      const newHackathon = await Hackathon.create(hackathonData);
      return res.status(201).json({
        success: true,
        message: 'Hackathon record archived successfully.',
        data: newHackathon
      });
    }

    const fallbackRecord = {
      _id: 'hack_fallback_' + Date.now(),
      ...hackathonData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    fallbackHackathons.unshift(fallbackRecord);

    return res.status(201).json({
      success: true,
      message: 'Hackathon record archived successfully (local mode).',
      data: fallbackRecord
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/hackathons/:id
 * @desc    Update an existing hackathon
 * @access  Admin only
 */
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const hackathonData = normalizeHackathon(req.body);

    if (databaseIsReady()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid hackathon ID format.' });
      }

      const updated = await Hackathon.findByIdAndUpdate(id, hackathonData, {
        new: true,
        runValidators: true
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Hackathon record not found.' });
      }

      return res.json({
        success: true,
        message: 'Hackathon record updated successfully.',
        data: updated
      });
    }

    const index = fallbackHackathons.findIndex((h) => h._id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Hackathon record not found.' });
    }

    fallbackHackathons[index] = {
      ...fallbackHackathons[index],
      ...hackathonData,
      updatedAt: new Date()
    };

    return res.json({
      success: true,
      message: 'Hackathon record updated successfully (local mode).',
      data: fallbackHackathons[index]
    });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/hackathons/:id
 * @desc    Delete a hackathon record
 * @access  Admin only
 */
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (databaseIsReady()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid hackathon ID format.' });
      }

      const deleted = await Hackathon.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Hackathon record not found.' });
      }

      return res.json({ success: true, message: 'Hackathon record deleted.' });
    }

    const initialLength = fallbackHackathons.length;
    fallbackHackathons = fallbackHackathons.filter((h) => h._id !== id);

    if (fallbackHackathons.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Hackathon record not found.' });
    }

    return res.json({ success: true, message: 'Hackathon record deleted (local mode).' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
