// PASTE AT: backend/routes/parent.js  (NEW FILE)

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Progress = require('../models/Progress');

const parentOnly = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ message: 'Parent access only' });
  }
  next();
};

// @desc    Get all children linked to this parent
// @route   GET /api/parent/children
router.get('/children', protect, parentOnly, async (req, res) => {
  try {
    const students = await Student.find({ parents: req.user._id })
      .populate('userId', 'name email');

    const result = await Promise.all(students.map(async (s) => {
      const progressList = await Progress.find({ studentId: s._id }).sort({ createdAt: -1 });

      const recentActivity = progressList.slice(0, 5).map((p) => {
        const diff = Date.now() - new Date(p.createdAt).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const date = days === 0 ? (hours === 0 ? 'Just now' : `${hours}h ago`) : days === 1 ? 'Yesterday' : `${days} days ago`;
        return {
          lesson: p.lessonTitle,
          score: p.score,
          time: `${Math.round(p.timeSpent / 60)} min`,
          date,
          module: p.module,
        };
      });

      return {
        _id: s._id,
        name: s.userId?.name || 'Unknown',
        email: s.userId?.email || '',
        age: s.age,
        grade: s.grade,
        level: s.level,
        points: s.points,
        streak: s.streak,
        lessonsDone: progressList.length,
        activeModules: s.activeModules,
        recentActivity,
      };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get weekly progress for a child
// @route   GET /api/parent/children/:studentId/weekly
router.get('/children/:studentId/weekly', protect, parentOnly, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayProgress = await Progress.find({
        studentId: req.params.studentId,
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

// @desc    Link a child to this parent by email
// @route   POST /api/parent/children/add
router.post('/children/add', protect, parentOnly, async (req, res) => {
  try {
    const { email } = req.body;
    const studentUser = await User.findOne({ email, role: 'student' });
    if (!studentUser) {
      return res.status(404).json({ message: 'No student found with that email' });
    }

    const student = await Student.findOne({ userId: studentUser._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (student.parents.includes(req.user._id)) {
      return res.status(400).json({ message: 'Child already linked to your account' });
    }

    student.parents.push(req.user._id);
    await student.save();

    res.json({ message: 'Child linked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;