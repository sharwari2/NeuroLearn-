import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import DyslexiaModule from './pages/DyslexiaModule';
import AudioLessonPlayer from './pages/AudioLessonPlayer';

// Redirects user to correct dashboard based on their role
const RoleBasedRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" />;
  if (user.role === 'parent')  return <Navigate to="/parent/dashboard" />;
  return <Navigate to="/student/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Role-based redirect — /dashboard goes to correct page */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          {/* Parent Routes */}
          <Route path="/parent/dashboard" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />

          {/* Dyslexia Module (students only) */}
          <Route path="/dyslexia" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DyslexiaModule />
            </ProtectedRoute>
          } />
          <Route path="/dyslexia/audio" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AudioLessonPlayer />
            </ProtectedRoute>
          } />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;