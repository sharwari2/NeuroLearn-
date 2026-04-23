const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grade: {
    type: Number,
    default: 1,
  },
  age: {
    type: Number,
    default: 6,
  },
  school: String,
  activeModules: {
    type: [String],
    default: ['dyslexia', 'adhd'],
  },
  points: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: Date,
  preferences: {
    ttsSpeed: { type: Number, default: 1 },
    fontSize: { type: String, default: 'medium' },
    dyslexiaFont: { type: Boolean, default: false },
    focusSoundEnabled: { type: Boolean, default: false },
  },
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;