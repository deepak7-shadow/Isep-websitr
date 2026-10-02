const express = require('express');
const router = express.Router();

const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');


// GET /api/activities
// Get all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ date: -1 });

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// GET /api/activities/:id
// Get one activity
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// POST /api/activities
// Create activity - Admin only
router.post(
  '/',
  auth,
  requireAdmin,
  upload.array('images', 10),
  async (req, res) => {
    try {
      const {
        title,
        date,
        description,
        category,
        existingImages
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Activity title is required.'
        });
      }

      let oldImages = [];

      try {
        oldImages = JSON.parse(existingImages || '[]');

        if (!Array.isArray(oldImages)) {
          oldImages = [];
        }
      } catch {
        oldImages = [];
      }

      const uploadedImages = (req.files || []).map((file) => {
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      });

      const allImages = [...oldImages, ...uploadedImages];

      const activity = await Activity.create({
        title: title.trim(),
        date: date || new Date(),
        description: description || '',
        category: category || '',
        images: allImages,
        createdBy: req.user.userId
      });

      res.status(201).json({
        success: true,
        message: 'Activity created successfully.',
        data: activity
      });
    } catch (err) {
      console.error('Create activity error:', err);

      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// PUT /api/activities/:id
// Edit activity - Admin only
router.put(
  '/:id',
  auth,
  requireAdmin,
  upload.array('images', 10),
  async (req, res) => {
    try {
      const {
        title,
        date,
        description,
        category,
        existingImages
      } = req.body;

      const activity = await Activity.findById(req.params.id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found.'
        });
      }

      if (title !== undefined) {
        activity.title = title.trim();
      }

      if (date !== undefined) {
        activity.date = date;
      }

      if (description !== undefined) {
        activity.description = description;
      }

      if (category !== undefined) {
        activity.category = category;
      }

      let oldImages = [];

      try {
        oldImages = JSON.parse(existingImages || '[]');

        if (!Array.isArray(oldImages)) {
          oldImages = [];
        }
      } catch {
        oldImages = [];
      }

      const uploadedImages = (req.files || []).map((file) => {
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      });

      activity.images = [...oldImages, ...uploadedImages];

      await activity.save();

      res.json({
        success: true,
        message: 'Activity updated successfully.',
        data: activity
      });
    } catch (err) {
      console.error('Update activity error:', err);

      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// DELETE /api/activities/:id
// Delete activity - Admin only
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


module.exports = router;