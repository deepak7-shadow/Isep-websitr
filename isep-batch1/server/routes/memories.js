const express = require('express');
const router = express.Router();

const Memory = require('../models/Memory');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route   GET /api/memories
 * @desc    Get all memories
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const memories = await Memory.find()
      .populate('uploadedBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return res.json({
      success: true,
      count: memories.length,
      data: memories
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * @route   POST /api/memories
 * @desc    Add a new memory
 * @access  Admin or Member
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { caption, date, description } = req.body;

    if (!caption) {
      return res.status(400).json({
        success: false,
        message: 'Caption is required.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Memory image is required.'
      });
    }

    /*
     * M11 upload middleware currently uses memoryStorage.
     * The actual upload/storage integration should provide
     * the final image URL/path.
     */
    const image = req.file.path || req.file.location || req.file.filename;

    const memory = await Memory.create({
      image,
      caption,
      date: date || new Date(),
      description: description || '',
      uploadedBy: req.user?._id || req.user?.id
    });

    return res.status(201).json({
      success: true,
      message: 'Memory added successfully.',
      data: memory
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * @route   PUT /api/memories/:id
 * @desc    Edit a memory
 * @access  Admin or Owner
 */
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found.'
      });
    }

    const userId = req.user?._id || req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const isOwner =
      memory.uploadedBy &&
      userId &&
      memory.uploadedBy.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to edit this memory.'
      });
    }

    const { caption, date, description } = req.body;

    if (caption !== undefined) {
      memory.caption = caption;
    }

    if (date !== undefined) {
      memory.date = date;
    }

    if (description !== undefined) {
      memory.description = description;
    }

    if (req.file) {
      memory.image =
        req.file.path ||
        req.file.location ||
        req.file.filename;
    }

    await memory.save();

    return res.json({
      success: true,
      message: 'Memory updated successfully.',
      data: memory
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * @route   DELETE /api/memories/:id
 * @desc    Delete a memory
 * @access  Admin only
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete memories.'
      });
    }

    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found.'
      });
    }

    await Memory.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Memory deleted successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;