const mongoose = require('mongoose');

const TCSMeetingSchema = new mongoose.Schema({
  meetingTitle: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  guestName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('TCSMeeting', TCSMeetingSchema);
