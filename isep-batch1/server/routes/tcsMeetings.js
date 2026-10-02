const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const TCSMeeting = require('../models/TCSMeeting');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
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

const databaseIsReady = () => mongoose.connection.readyState === 1;

const fallbackTCSMeetings = [
  {
    _id: 'tcs_demo_1',
    meetingTitle: 'Industry Readiness & Corporate Mentorship Kickoff',
    date: new Date('2024-02-20'),
    guestName: 'Rajesh Gopinathan & TCS Leadership Team',
    description: 'Foundational mentorship session introducing software development life cycle, enterprise standards, and cloud engineering best practices.',
    notes: 'Key takeaways: Importance of modular design, code documentation, and CI/CD pipelines in enterprise delivery.',
    images: ['https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80'],
    createdAt: new Date('2024-02-20')
  },
  {
    _id: 'tcs_demo_2',
    meetingTitle: 'TCS Innovation Labs: AI & Cloud Transformation',
    date: new Date('2024-03-25'),
    guestName: 'Ananya Deshmukh (Principal Architect, TCS Research)',
    description: 'Interactive workshop on modern cloud architectures, enterprise AI integrations, and real-time streaming analytics.',
    notes: 'Discussion on leveraging micro-frontends and scalable event-driven backends.',
    images: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'],
    createdAt: new Date('2024-03-25')
  }
];

// @route   GET /api/tcs-meetings
// @desc    Get all TCS meetings
router.get('/', async (req, res) => {
  try {
    if (databaseIsReady()) {
      const meetings = await TCSMeeting.find().sort({ date: -1, createdAt: -1 });
      if (meetings && meetings.length > 0) {
        return res.json(meetings);
      }
    }
    return res.json(fallbackTCSMeetings);
  } catch (err) {
    return res.json(fallbackTCSMeetings);
  }
});

// @route   GET /api/tcs-meetings/:id
// @desc    Get single TCS meeting by ID
router.get('/:id', async (req, res) => {
  try {
    if (databaseIsReady()) {
      const meeting = await TCSMeeting.findById(req.params.id);
      if (meeting) return res.json(meeting);
    }
    const fallback = fallbackTCSMeetings.find((m) => m._id === req.params.id);
    if (fallback) return res.json(fallback);
    return res.status(404).json({ error: 'TCS meeting not found' });
  } catch (err) {
    const fallback = fallbackTCSMeetings.find((m) => m._id === req.params.id);
    if (fallback) return res.json(fallback);
    return res.status(404).json({ error: 'TCS meeting not found' });
  }
});

// @route   POST /api/tcs-meetings
// @desc    Create a TCS meeting (Admin only)
router.post('/', [auth, requireRole('admin')], async (req, res) => {
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
router.put('/:id', [auth, requireRole('admin')], async (req, res) => {
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
router.delete('/:id', [auth, requireRole('admin')], async (req, res) => {
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