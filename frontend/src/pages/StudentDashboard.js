import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import { BookOpen, Brain, Trophy, Flame, Target, Clock } from 'lucide-react';
import api from '../utils/api';

const StudentDashboard = () => {
  const { user, studentData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await api.get('/student/progress');
      setProgress(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 🎉
          </h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Trophy size={32} />
              <span className="text-sm opacity-90">Total Points</span>
            </div>
            <p className="text-3xl font-bold">{studentData?.points || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target size={32} />
              <span className="text-sm opacity-90">Current Level</span>
            </div>
            <p className="text-3xl font-bold">Level {studentData?.level || 1}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Flame size={32} />
              <span className="text-sm opacity-90">Day Streak</span>
            </div>
            <p className="text-3xl font-bold">{studentData?.streak || 0} days</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BookOpen size={32} />
              <span className="text-sm opacity-90">Lessons Done</span>
            </div>
            <p className="text-3xl font-bold">{progress.length}</p>
          </div>
        </div>

        {/* Modules Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Dyslexia Module */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="text-blue-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Dyslexia Module</h3>
                <p className="text-gray-600 text-sm">Read, listen and understand</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✓ Text-to-Speech</p>
              <p>✓ Audio Lessons</p>
              <p>✓ Interactive Reading</p>
              <p>✓ Speed Control</p>
            </div>
            <button
              onClick={() => navigate('/dyslexia')}
              className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Start Learning
            </button>
          </div>

          {/* ADHD Module */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <Brain className="text-green-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">ADHD Module</h3>
                <p className="text-gray-600 text-sm">Stay focused and learn effectively</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✓ Focus Mode</p>
              <p>✓ Short Lessons</p>
              <p>✓ Task Timers</p>
              <p>✓ Interactive Quizzes</p>
            </div>
            <button
              onClick={() => navigate('/adhd')}
              className="mt-4 w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Start Learning
            </button>
          </div>
        </div>

        {/* Recent Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={24} className="text-primary-600" />
            Recent Activity
          </h3>
          {progress.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity yet. Start learning to see your progress!</p>
          ) : (
            <div className="space-y-3">
              {progress.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{item.lessonTitle}</p>
                    <p className="text-sm text-gray-600 capitalize">{item.module} Module</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">{item.score}%</p>
                    <p className="text-xs text-gray-500">{Math.floor(item.timeSpent / 60)} min</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;