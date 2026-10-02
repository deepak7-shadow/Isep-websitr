const express = require('express');
const router = express.Router();

const Memory = require('../models/Memory');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// ─── Local demo fallback (when MongoDB is offline) ───────────────────────────
const localMemories = [
  {
    _id: 'demo-1',
    image: '',
    caption: 'ISEP Team Day ❤️',
    description: 'A wonderful day with the whole Batch 1 crew!',
    date: new Date('2024-09-15'),
    createdAt: new Date('2024-09-15')
  },
  {
    _id: 'demo-2',
    image: '',
    caption: 'Hackathon Nights 🚀',
    description: 'Building through the night — coffee and code!',
    date: new Date('2024-10-01'),
    createdAt: new Date('2024-10-01')
  }
];

// GET /api/memories
// List all memories
router.get('/', async (req, res) => {
  try {
    const memories = await Memory.find().sort({ date: -1 });
    res.json({
      success: true,
      count: memories.length,
      data: memories
    });
  } catch (err) {
    console.warn('[memories] MongoDB unavailable, serving demo data:', err.message);
    res.json({
      success: true,
      count: localMemories.length,
      data: localMemories
    });
  }
});

// GET /api/memories/:id
// Get a single memory
router.get('/:id', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found.' });
    }
    res.json({ success: true, data: memory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/memories
// Add memory — admin or logged-in member
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { caption, description, date, imageUrl } = req.body;

    if (!caption || !caption.trim()) {
      return res.status(400).json({ success: false, message: 'Caption is required.' });
    }

    // Support file upload OR URL
    let image = imageUrl || '';
    if (req.file) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    if (!image) {
      return res.status(400).json({ success: false, message: 'An image or image URL is required.' });
    }

    const memory = await Memory.create({
      caption: caption.trim(),
      description: description || '',
      image,
      date: date || new Date(),
      uploadedBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Memory saved successfully.',
      data: memory
    });
  } catch (err) {
    console.error('Create memory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/memories/:id
// Edit memory — admin or owner
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found.' });
    }

    // Owner or admin
    const isOwner = memory.uploadedBy?.toString() === req.user.userId?.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { caption, description, date, imageUrl } = req.body;

    if (caption !== undefined) memory.caption = caption.trim();
    if (description !== undefined) memory.description = description;
    if (date !== undefined) memory.date = date;

    if (req.file) {
      memory.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (imageUrl) {
      memory.image = imageUrl;
    }

    await memory.save();

    res.json({ success: true, message: 'Memory updated.', data: memory });
  } catch (err) {
    console.error('Update memory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/memories/:id
// Delete memory — admin only
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const memory = await Memory.findByIdAndDelete(req.params.id);
    if (!memory) {
      return res.status(404).json({ success: false, message: 'Memory not found.' });
    }
    res.json({ success: true, message: 'Memory deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
