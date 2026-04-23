// PASTE AT: backend/routes/student.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');
const Progress = require('../models/Progress');

// @desc    Get student profile
// @route   GET /api/student/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email')
      .populate('parents', 'name email')
      .populate('teachers', 'name email');
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get student progress
// @route   GET /api/student/progress
router.get('/progress', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const progress = await Progress.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get weekly progress (last 7 days scores)
// @route   GET /api/student/progress/weekly
router.get('/progress/weekly', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayProgress = await Progress.find({
        studentId: student._id,
        createdAt: { $gte: date, $lt: nextDate },
      });

      const avgScore = dayProgress.length
        ? Math.round(dayProgress.reduce((sum, p) => sum + p.score, 0) / dayProgress.length)
        : 0;

      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: avgScore,
        count: dayProgress.length,
      });
    }
    res.json(days);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add progress entry
// @route   POST /api/student/progress
router.post('/progress', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const progress = await Progress.create({
      studentId: student._id,
      ...req.body,
    });

    // Update points and level
    student.points += req.body.score || 10;
    student.level = Math.floor(student.points / 100) + 1;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = student.lastActiveDate ? new Date(student.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        student.streak += 1; // continued streak
      } else if (diffDays > 1) {
        student.streak = 1; // broken streak, reset
      }
      // diffDays === 0 means same day, don't change streak
    } else {
      student.streak = 1;
    }
    student.lastActiveDate = new Date();

    await student.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update preferences
// @route   PUT /api/student/preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    student.preferences = { ...student.preferences._doc, ...req.body };
    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;