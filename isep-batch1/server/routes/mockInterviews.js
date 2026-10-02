const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const MockInterview = require('../models/MockInterview');
const verifyToken = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// Keep the archive usable in local/demo mode when MongoDB is not configured.
let fallbackMockInterviews = [
  {
    _id: 'mock_demo_1',
    title: 'Full Stack System Architecture & Scalability',
    date: new Date('2024-04-10'),
    interviewer: 'Sridhar Rao (Tech Lead, TCS)',
    participant: 'Deepak R',
    description: 'Technical evaluation covering distributed systems, microservices design patterns, and high-concurrency database indexing.',
    notes: 'Demonstrated outstanding clarity on ACID principles and RESTful API optimizations.',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    _id: 'mock_demo_2',
    title: 'Data Structures & Algorithmic Problem Solving',
    date: new Date('2024-04-18'),
    interviewer: 'Priya Sharma (Senior SWE, ISEP Mentor)',
    participant: 'Shane Fredrick',
    description: 'Deep dive into graph traversals (BFS/DFS), dynamic programming, and complexity trade-offs.',
    notes: 'Clean code execution and strong edge-case handling in live coding session.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  }
];

const databaseIsReady = () => mongoose.connection.readyState === 1;

function normalizeInterview(payload, createdBy) {
  const { title, date, interviewer, participant, description, notes, image } = payload || {};
  const asTrimmedString = (value) => typeof value === 'string' ? value.trim() : '';
  const normalizedTitle = asTrimmedString(title);
  const normalizedInterviewer = asTrimmedString(interviewer);
  const normalizedParticipant = asTrimmedString(participant);

  if (!normalizedTitle || !normalizedInterviewer || !normalizedParticipant) {
    const error = new Error('Title, interviewer, and participant are required.');
    error.status = 400;
    throw error;
  }

  const interviewDate = date ? new Date(date) : new Date();
  if (Number.isNaN(interviewDate.getTime())) {
    const error = new Error('Please provide a valid interview date.');
    error.status = 400;
    throw error;
  }

  return {
    title: normalizedTitle,
    date: interviewDate,
    interviewer: normalizedInterviewer,
    participant: normalizedParticipant,
    description: asTrimmedString(description),
    notes: asTrimmedString(notes),
    image: asTrimmedString(image),
    ...(createdBy ? { createdBy } : {})
  };
}

/**
 * @route   GET /api/mock-interviews
 * @desc    List all mock interview records
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    if (databaseIsReady()) {
      const interviews = await MockInterview.find().sort({ date: -1, createdAt: -1 });
      if (interviews && interviews.length > 0) {
        return res.json({ success: true, count: interviews.length, data: interviews });
      }
    }

    const interviews = [...fallbackMockInterviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    const interviews = [...fallbackMockInterviews].sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({ success: true, count: interviews.length, data: interviews });
  }
});

/**
 * @route   GET /api/mock-interviews/:id
 * @desc    Get one mock interview record
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    let interview = null;

    if (databaseIsReady()) {
      interview = await MockInterview.findById(req.params.id);
    } else {
      interview = fallbackMockInterviews.find((entry) => entry._id === req.params.id);
    }

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock interview record not found.' });
    }

    return res.json({ success: true, data: interview });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ success: false, message: 'Mock interview record not found.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/mock-interviews
 * @desc    Create a mock interview record
 * @access  Admin
 */
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const interviewData = normalizeInterview(req.body, req.user?.userId);

    if (databaseIsReady()) {
      const interview = await MockInterview.create(interviewData);
      return res.status(201).json({ success: true, data: interview });
    }

    const interview = {
      _id: `mock_${Date.now()}`,
      ...interviewData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    fallbackMockInterviews.unshift(interview);
    return res.status(201).json({ success: true, data: interview });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/mock-interviews/:id
 * @desc    Update a mock interview record
 * @access  Admin
 */
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const interviewData = normalizeInterview(req.body);
    let interview = null;

    if (databaseIsReady()) {
      interview = await MockInterview.findByIdAndUpdate(
        req.params.id,
        { $set: interviewData },
        { new: true, runValidators: true }
      );
    } else {
      const index = fallbackMockInterviews.findIndex((entry) => entry._id === req.params.id);
      if (index !== -1) {
        fallbackMockInterviews[index] = {
          ...fallbackMockInterviews[index],
          ...interviewData,
          updatedAt: new Date()
        };
        interview = fallbackMockInterviews[index];
      }
    }

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock interview record not found.' });
    }

    return res.json({ success: true, data: interview });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ success: false, message: 'Mock interview record not found.' });
    }
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/mock-interviews/:id
 * @desc    Delete a mock interview record
 * @access  Admin
 */
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    let deleted = null;

    if (databaseIsReady()) {
      deleted = await MockInterview.findByIdAndDelete(req.params.id);
    } else {
      const index = fallbackMockInterviews.findIndex((entry) => entry._id === req.params.id);
      if (index !== -1) {
        deleted = fallbackMockInterviews[index];
        fallbackMockInterviews.splice(index, 1);
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Mock interview record not found.' });
    }

    return res.json({ success: true, message: 'Mock interview record deleted.' });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(404).json({ success: false, message: 'Mock interview record not found.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
