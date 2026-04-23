// PASTE AT: backend/routes/teacher.js  (NEW FILE)

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Progress = require('../models/Progress');

// Middleware — teacher only
const teacherOnly = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Teacher access only' });
  }
  next();
};

// @desc    Get all students assigned to this teacher
// @route   GET /api/teacher/students
router.get('/students', protect, teacherOnly, async (req, res) => {
  try {
    const students = await Student.find({ teachers: req.user._id })
      .populate('userId', 'name email');

    const result = await Promise.all(students.map(async (s) => {
      const progressList = await Progress.find({ studentId: s._id }).sort({ createdAt: -1 });
      const avgScore = progressList.length
        ? Math.round(progressList.reduce((sum, p) => sum + p.score, 0) / progressList.length)
        : 0;

      // Last active
      const lastProgress = progressList[0];
      let lastActive = 'Never';
      if (lastProgress) {
        const diff = Date.now() - new Date(lastProgress.createdAt).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        lastActive = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : 'Just now';
      }

      return {
        _id: s._id,
        name: s.userId?.name || 'Unknown',
        email: s.userId?.email || '',
        module: s.activeModules?.[0] || 'dyslexia',
        progress: avgScore,
        lastActive,
        status: lastActive === 'Never' || lastActive.includes('d') ? 'inactive' : 'active',
        streak: s.streak,
        level: s.level,
        points: s.points,
      };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get teacher dashboard stats
// @route   GET /api/teacher/stats
router.get('/stats', protect, teacherOnly, async (req, res) => {
  try {
    const students = await Student.find({ teachers: req.user._id });
    const totalStudents = students.length;

    // Active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let activeToday = 0;
    let totalProgress = 0;
    let lessonsAssigned = 0;

    for (const s of students) {
      const todayProgress = await Progress.find({
        studentId: s._id,
        createdAt: { $gte: today },
      });
      if (todayProgress.length > 0) activeToday++;

      const allProgress = await Progress.find({ studentId: s._id });
      lessonsAssigned += allProgress.length;
      if (allProgress.length > 0) {
        const avg = allProgress.reduce((sum, p) => sum + p.score, 0) / allProgress.length;
        totalProgress += avg;
      }
    }

    const avgProgress = totalStudents > 0
      ? Math.round(totalProgress / totalStudents)
      : 0;

    res.json({ totalStudents, activeToday, avgProgress, lessonsAssigned });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add student to teacher's class
// @route   POST /api/teacher/students/add
router.post('/students/add', protect, teacherOnly, async (req, res) => {
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

    if (student.teachers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Student already in your class' });
    }

    student.teachers.push(req.user._id);
    await student.save();

    res.json({ message: 'Student added successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get progress of a specific student
// @route   GET /api/teacher/students/:studentId/progress
router.get('/students/:studentId/progress', protect, teacherOnly, async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;