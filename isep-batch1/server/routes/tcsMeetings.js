const express = require('express');
const router = express.Router();
const TCSMeeting = require('../models/TCSMeeting');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const fs = require('fs');
const path = require('path');

// Helper to clean up uploaded image files when removed or deleted
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

// @route   GET /api/tcs-meetings
// @desc    Get all TCS meetings
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await TCSMeeting.find().sort({ date: -1, createdAt: -1 });
    res.json(meetings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/tcs-meetings/:id
// @desc    Get single TCS meeting by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await TCSMeeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'TCS meeting not found' });
    }
    res.json(meeting);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'TCS meeting not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/tcs-meetings
// @desc    Create a TCS meeting (Admin only)
router.post('/', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    const { meetingTitle, date, guestName, description, notes, images } = req.body;

    if (!meetingTitle || !date || !guestName) {
      return res.status(400).json({ error: 'Meeting Title, Date, and Guest Name are required.' });
    }

    const newMeeting = new TCSMeeting({
      meetingTitle,
      date,
      guestName,
      description,
      notes,
      images: images || [],
      createdBy: req.user.id
    });

    const meeting = await newMeeting.save();
    res.status(201).json(meeting);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/tcs-meetings/:id
// @desc    Update a TCS meeting (Admin only)
router.put('/:id', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    const { meetingTitle, date, guestName, description, notes, images } = req.body;

    let meeting = await TCSMeeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'TCS meeting not found' });
    }

    // Clean up removed images if images array is provided
    if (images && meeting.images) {
      meeting.images.forEach((oldImage) => {
        if (!images.includes(oldImage)) {
          deleteFile(oldImage);
        }
      });
    }

    const updateFields = {
      meetingTitle: meetingTitle !== undefined ? meetingTitle : meeting.meetingTitle,
      date: date !== undefined ? date : meeting.date,
      guestName: guestName !== undefined ? guestName : meeting.guestName,
      description: description !== undefined ? description : meeting.description,
      notes: notes !== undefined ? notes : meeting.notes,
      images: images !== undefined ? images : meeting.images
    };

    meeting = await TCSMeeting.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json(meeting);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'TCS meeting not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/tcs-meetings/:id
// @desc    Delete a TCS meeting (Admin only)
router.delete('/:id', [auth, roleCheck(['admin'])], async (req, res) => {
  try {
    const meeting = await TCSMeeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'TCS meeting not found' });
    }

    if (meeting.images && meeting.images.length > 0) {
      meeting.images.forEach((image) => deleteFile(image));
    }

    await TCSMeeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'TCS meeting removed successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'TCS meeting not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;