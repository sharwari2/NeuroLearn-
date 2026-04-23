// PASTE AT: frontend/src/pages/TeacherDashboard.js  (REPLACE COMPLETELY)

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import { Users, BookOpen, TrendingUp, Award, Clock, CheckCircle, X } from 'lucide-react';
import api from '../utils/api';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);

  // ── Core data state ──────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalStudents: 0, activeToday: 0, avgProgress: 0, lessonsAssigned: 0 });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Add Student modal ────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // ── Assign Lesson modal ──────────────────────────────────────────────────────
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLesson, setAssignLesson] = useState('');
  const [assignStudent, setAssignStudent] = useState('all');
  const [assignMsg, setAssignMsg] = useState('');

  // ── Analytics modal ──────────────────────────────────────────────────────────
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // ── Give Badge modal ─────────────────────────────────────────────────────────
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeStudent, setBadgeStudent] = useState('');
  const [badgeType, setBadgeType] = useState('');
  const [badgeMsg, setBadgeMsg] = useState('');

  // ── Fetch data on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, studentsRes] = await Promise.all([
        api.get('/teacher/stats'),
        api.get('/teacher/students'),
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Add Student handler ──────────────────────────────────────────────────────
  const handleAddStudent = async () => {
    if (!addEmail) return;
    setAddLoading(true);
    setAddMsg('');
    try {
      const res = await api.post('/teacher/students/add', { email: addEmail });
      setAddMsg({ type: 'success', text: res.data.message });
      setAddEmail('');
      fetchData();
    } catch (error) {
      setAddMsg({ type: 'error', text: error.response?.data?.message || 'Failed to add student' });
    } finally {
      setAddLoading(false);
    }
  };

  // ── Assign Lesson handler ────────────────────────────────────────────────────
  const handleAssignLesson = () => {
    if (!assignLesson) return;
    // TODO: wire up to your backend API when ready
    // e.g. api.post('/teacher/assign', { lesson: assignLesson, studentId: assignStudent })
    const target = assignStudent === 'all'
      ? 'all students'
      : students.find((s) => s._id === assignStudent)?.name || 'student';
    setAssignMsg({ type: 'success', text: `"${assignLesson}" assigned to ${target}!` });
    setAssignLesson('');
    setAssignStudent('all');
  };

  // ── Give Badge handler ───────────────────────────────────────────────────────
  const handleGiveBadge = () => {
    if (!badgeStudent || !badgeType) return;
    // TODO: wire up to your backend API when ready
    // e.g. api.post('/teacher/badge', { studentId: badgeStudent, badge: badgeType })
    const name = students.find((s) => s._id === badgeStudent)?.name || 'Student';
    setBadgeMsg({ type: 'success', text: `${badgeType} badge given to ${name}!` });
    setBadgeStudent('');
    setBadgeType('');
  };

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}! 👋</h1>
          <p className="text-gray-600">Here's how your students are doing today.</p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Students', value: stats.totalStudents,        icon: <Users size={32} />,       gradient: 'from-blue-500 to-blue-600' },
            { label: 'Active Today',   value: stats.activeToday,          icon: <CheckCircle size={32} />, gradient: 'from-green-500 to-emerald-600' },
            { label: 'Avg Progress',   value: `${stats.avgProgress}%`,    icon: <TrendingUp size={32} />,  gradient: 'from-purple-500 to-purple-600' },
            { label: 'Lessons Done',   value: stats.lessonsAssigned,      icon: <BookOpen size={32} />,    gradient: 'from-orange-500 to-orange-600' },
          ].map((card) => (
            <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                {card.icon}
                <span className="text-sm opacity-90">{card.label}</span>
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── Student Table ── */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={22} className="text-blue-600" /> My Students
            </h3>
            <button
              onClick={() => { setShowAddModal(true); setAddMsg(''); setAddEmail(''); }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              + Add Student
            </button>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No students yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Student" and enter their email to add them</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">Module</th>
                    <th className="pb-3 pr-4">Avg Score</th>
                    <th className="pb-3 pr-4">Last Active</th>
                    <th className="pb-3 pr-4">Streak</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          s.module === 'dyslexia' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>{s.module}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                            <div className="h-2 rounded-full" style={{
                              width: `${s.progress}%`,
                              background: s.progress >= 75 ? '#22c55e' : s.progress >= 50 ? '#f59e0b' : '#ef4444',
                            }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{s.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock size={13} /> {s.lastActive}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-sm font-semibold text-orange-500">🔥 {s.streak} days</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Quick Actions (all 3 working) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Assign Lesson */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <BookOpen className="text-blue-500 mb-3" size={28} />
            <h4 className="font-bold text-gray-900 mb-1">Assign Lesson</h4>
            <p className="text-sm text-gray-500 mb-4">Send a new lesson to your students</p>
            <button
              onClick={() => { setShowAssignModal(true); setAssignMsg(''); }}
              className="w-full bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              Assign Lesson
            </button>
          </div>

          {/* View Analytics */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <TrendingUp className="text-purple-500 mb-3" size={28} />
            <h4 className="font-bold text-gray-900 mb-1">View Analytics</h4>
            <p className="text-sm text-gray-500 mb-4">See detailed progress reports</p>
            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="w-full bg-purple-50 text-purple-600 font-semibold py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm"
            >
              View Analytics
            </button>
          </div>

          {/* Give Badge */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <Award className="text-green-500 mb-3" size={28} />
            <h4 className="font-bold text-gray-900 mb-1">Give Badge</h4>
            <p className="text-sm text-gray-500 mb-4">Reward a student's achievement</p>
            <button
              onClick={() => { setShowBadgeModal(true); setBadgeMsg(''); }}
              className="w-full bg-green-50 text-green-600 font-semibold py-2 rounded-lg hover:bg-green-100 transition-colors text-sm"
            >
              Give Badge
            </button>
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MODAL 1 — Add Student
      ════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Student</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={22} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              Enter the student's registered email address to add them to your class.
            </p>

            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              placeholder="student@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />

            {/* Success / Error message */}
            {addMsg && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                addMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {addMsg.text}
              </div>
            )}

            <button
              onClick={handleAddStudent}
              disabled={addLoading || !addEmail}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {addLoading ? 'Adding...' : 'Add Student'}
            </button>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL 2 — Assign Lesson
      ════════════════════════════════════════════════════════ */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Lesson</h3>
              <button onClick={() => setShowAssignModal(false)}>
                <X size={22} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Lesson picker */}
            <label className="block text-sm font-semibold text-gray-700 mb-1">Lesson</label>
            <select
              value={assignLesson}
              onChange={(e) => setAssignLesson(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Select a lesson...</option>
              <option>The Water Cycle</option>
              <option>How Plants Make Food</option>
              <option>The Solar System</option>
              <option>Ancient Civilizations</option>
            </select>

            {/* Student picker */}
            <label className="block text-sm font-semibold text-gray-700 mb-1">Assign to</label>
            <select
              value={assignStudent}
              onChange={(e) => setAssignStudent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
            >
              <option value="all">All Students</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            {/* Success / Error message */}
            {assignMsg && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                assignMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {assignMsg.text}
              </div>
            )}

            <button
              onClick={handleAssignLesson}
              disabled={!assignLesson}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Assign Lesson
            </button>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL 3 — View Analytics
      ════════════════════════════════════════════════════════ */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Class Analytics</h3>
              <button onClick={() => setShowAnalyticsModal(false)}>
                <X size={22} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Summary stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Class Average',   value: `${stats.avgProgress}%` },
                { label: 'Total Lessons',   value: stats.lessonsAssigned },
                { label: 'Active Today',    value: stats.activeToday },
                { label: 'Total Students',  value: stats.totalStudents },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Per-student score bars */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Student Scores</p>
              {students.length === 0 && (
                <p className="text-sm text-gray-400">No students added yet.</p>
              )}
              {students.map((s) => (
                <div key={s._id} className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-gray-700 w-28 truncate">{s.name}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${s.progress}%`,
                        background: s.progress >= 75 ? '#22c55e' : s.progress >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-10 text-right">{s.progress}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL 4 — Give Badge
      ════════════════════════════════════════════════════════ */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Give Badge</h3>
              <button onClick={() => setShowBadgeModal(false)}>
                <X size={22} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Student picker */}
            <label className="block text-sm font-semibold text-gray-700 mb-1">Student</label>
            <select
              value={badgeStudent}
              onChange={(e) => setBadgeStudent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
            >
              <option value="">Select a student...</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            {/* Badge type picker */}
            <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Type</label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                '⭐ Star Learner',
                '🔥 On Fire',
                '📚 Bookworm',
                '🏆 Champion',
                '💡 Big Thinker',
                '🎯 Sharp Focus',
              ].map((badge) => (
                <button
                  key={badge}
                  onClick={() => setBadgeType(badge)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                    badgeType === badge
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>

            {/* Success / Error message */}
            {badgeMsg && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                badgeMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {badgeMsg.text}
              </div>
            )}

            <button
              onClick={handleGiveBadge}
              disabled={!badgeStudent || !badgeType}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Give Badge
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherDashboard;