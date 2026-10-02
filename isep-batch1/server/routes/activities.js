const express = require('express');
const router = express.Router();

const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');


const mongoose = require('mongoose');
const databaseIsReady = () => mongoose.connection.readyState === 1;

const fallbackActivities = [
  {
    _id: 'act_demo_1',
    activityName: 'ISEP Cohort Inauguration & Technical Keynote',
    date: new Date('2024-01-15'),
    description: 'Inauguration ceremony for Batch 1 fellows, setting engineering roadmap, milestone deliverables, and mentorship teams.',
    photos: ['https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80'],
    reports: []
  },
  {
    _id: 'act_demo_2',
    activityName: 'Open Source Cloud Architecture Sprint',
    date: new Date('2024-03-02'),
    description: 'Hands-on intensive sprint building production microservices with Docker, Kubernetes, and MongoDB replica sets.',
    photos: ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80'],
    reports: []
  }
];

// GET /api/activities
// Get all activities
router.get('/', async (req, res) => {
  try {
    if (databaseIsReady()) {
      const activities = await Activity.find().sort({ date: -1 });
      if (activities && activities.length > 0) {
        return res.json({
          success: true,
          count: activities.length,
          data: activities
        });
      }
    }

    return res.json({
      success: true,
      count: fallbackActivities.length,
      data: fallbackActivities
    });
  } catch (err) {
    return res.json({
      success: true,
      count: fallbackActivities.length,
      data: fallbackActivities
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