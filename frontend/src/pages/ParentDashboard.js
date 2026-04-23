// PASTE AT: frontend/src/pages/ParentDashboard.js  (REPLACE COMPLETELY)

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import { BookOpen, Brain, Trophy, Flame, TrendingUp, Heart, Clock, Star, X } from 'lucide-react';
import api from '../utils/api';

const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) fetchWeekly(selectedChild._id);
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent/children');
      setChildren(res.data);
      if (res.data.length > 0) setSelectedChild(res.data[0]);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekly = async (studentId) => {
    try {
      const res = await api.get(`/parent/children/${studentId}/weekly`);
      setWeeklyData(res.data);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    }
  };

  const handleAddChild = async () => {
    if (!addEmail) return;
    setAddLoading(true);
    setAddMsg('');
    try {
      const res = await api.post('/parent/children/add', { email: addEmail });
      setAddMsg({ type: 'success', text: res.data.message });
      setAddEmail('');
      fetchChildren();
    } catch (error) {
      setAddMsg({ type: 'error', text: error.response?.data?.message || 'Failed to link child' });
    } finally {
      setAddLoading(false);
    }
  };

  const maxScore = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.score), 1) : 1;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}! 👨‍👩‍👦</h1>
            <p className="text-gray-600">
              {selectedChild ? `Viewing ${selectedChild.name}'s progress` : 'No children linked yet'}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            + Link Child
          </button>
        </div>

        {/* No children state */}
        {children.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <Heart size={56} className="text-pink-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No children linked yet</h3>
            <p className="text-gray-500 mb-6">Link your child's account using their registered email address.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              + Link Child
            </button>
          </div>
        ) : (
          <>
            {/* Child selector tabs */}
            {children.length > 1 && (
              <div className="flex gap-3 mb-6 flex-wrap">
                {children.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChild(child)}
                    className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                      selectedChild?._id === child._id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            )}

            {selectedChild && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total Points', value: selectedChild.points, icon: <Trophy size={32} />, gradient: 'from-yellow-400 to-orange-500' },
                    { label: 'Current Level', value: `Level ${selectedChild.level}`, icon: <Star size={32} />, gradient: 'from-purple-500 to-pink-500' },
                    { label: 'Day Streak', value: `${selectedChild.streak} days 🔥`, icon: <Flame size={32} />, gradient: 'from-red-500 to-orange-600' },
                    { label: 'Lessons Done', value: selectedChild.lessonsDone, icon: <BookOpen size={32} />, gradient: 'from-blue-500 to-cyan-500' },
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Weekly Progress Chart */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <TrendingUp size={22} className="text-blue-500" />
                      Weekly Progress
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">{selectedChild.name}'s scores this week</p>
                    {weeklyData.every(d => d.score === 0) ? (
                      <div className="flex items-center justify-center h-36 text-gray-400 text-sm">
                        No activity this week yet
                      </div>
                    ) : (
                      <div className="flex items-end justify-between gap-2 h-36">
                        {weeklyData.map((day, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 flex-1">
                            <span className="text-xs font-semibold text-gray-500">{day.score > 0 ? `${day.score}%` : ''}</span>
                            <div
                              className="w-full rounded-t-lg transition-all"
                              style={{
                                height: `${(day.score / maxScore) * 100}px`,
                                background: i === weeklyData.length - 1 ? '#4f8ef7' : '#e5e7eb',
                                minHeight: day.score > 0 ? 8 : 4,
                              }}
                            />
                            <span className="text-xs text-gray-400">{day.date}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Modules */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <Heart size={22} className="text-pink-500" />
                      Active Modules
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{selectedChild.name} is enrolled in</p>
                    <div className="space-y-3">
                      {selectedChild.activeModules.map((mod) => (
                        <div key={mod} className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                          mod === 'dyslexia' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
                        }`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            mod === 'dyslexia' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {mod === 'dyslexia'
                              ? <BookOpen className="text-blue-600" size={24} />
                              : <Brain className="text-green-600" size={24} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 capitalize">{mod} Module</h4>
                            <p className="text-sm text-gray-500">
                              {mod === 'dyslexia' ? 'Read, listen and understand' : 'Stay focused and learn effectively'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock size={22} className="text-purple-500" />
                    Recent Activity
                  </h3>
                  {selectedChild.recentActivity.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No activity yet. {selectedChild.name} hasn't completed any lessons.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedChild.recentActivity.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              item.module === 'dyslexia' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {item.module === 'dyslexia'
                                ? <BookOpen className="text-blue-600" size={18} />
                                : <Brain className="text-green-600" size={18} />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.lesson}</p>
                              <p className="text-sm text-gray-500">{item.date} · {item.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{item.score}%</p>
                            <p className="text-xs text-gray-400">score</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Link Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Link Your Child</h3>
              <button onClick={() => { setShowAddModal(false); setAddMsg(''); setAddEmail(''); }}>
                <X size={22} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4">Enter your child's registered email address to link their account.</p>
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="child@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            {addMsg && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                addMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {addMsg.text}
              </div>
            )}
            <button
              onClick={handleAddChild}
              disabled={addLoading || !addEmail}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {addLoading ? 'Linking...' : 'Link Child'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;