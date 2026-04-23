const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, grade, age } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role });

    if (role === 'student') {
      const studentProfile = new Student({
        userId: user._id,
        grade: parseInt(grade) || 5,
        age: parseInt(age) || 10,
        activeModules: ['dyslexia', 'adhd'],
      });
      await studentProfile.save();
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Make sure user exists
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only look for student data if role is student
    let studentData = null;
    if (user.role === 'student') {
      try {
        studentData = await Student.findOne({ userId: user._id });
      } catch (studentError) {
        console.error('Error fetching student data:', studentError.message);
        // Don't crash — just return null studentData
        studentData = null;
      }
    }

    res.json({ user, studentData });

  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };