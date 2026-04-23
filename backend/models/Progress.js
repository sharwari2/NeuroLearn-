// PASTE AT: backend/models/Progress.js

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  module: {
    type: String,
    enum: ['dyslexia', 'adhd'],
    required: true,
  },
  lessonId: {
    type: String,
    required: true,
  },
  lessonTitle: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  timeSpent: {
    type: Number, // seconds
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Progress', progressSchema);