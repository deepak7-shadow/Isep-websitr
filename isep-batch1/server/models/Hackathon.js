const mongoose = require('mongoose');

const HackathonSchema = new mongoose.Schema({
  hackathonName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  teamMembers: [{
    type: String
  }],
  images: [{
    type: String
  }],
  result: {
    type: String,
    default: 'Participated'
  },
  experience: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Hackathon', HackathonSchema);
