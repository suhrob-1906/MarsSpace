import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Shop from './pages/Shop';
import Courses from './pages/Courses';
import CoursePlayer from './pages/CoursePlayer';
import TypingGame from './pages/TypingGame';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin-panel" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
            <Route path="teacher" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />

            {/* Features */}
            <Route path="shop" element={<Shop />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CoursePlayer />} />
            <Route path="typing" element={<TypingGame />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
