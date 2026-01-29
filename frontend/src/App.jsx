import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n'; // Import i18n configuration
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Shop from './pages/Shop';
import Courses from './pages/Courses';
import CoursePlayer from './pages/CoursePlayer';
import TypingGame from './pages/TypingGame';
import Eduverse from './pages/Eduverse';
import Blogs from './pages/Blogs';
import CurrentTasks from './pages/CurrentTasks';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Teacher Panel Imports
import TeacherLayout from './components/layout/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MyGroups from './pages/teacher/MyGroups';
import AttendancePage from './pages/teacher/AttendancePage';

// Admin Panel Imports
import AdminLayout from './components/layout/AdminLayout';
import GroupManagement from './pages/admin/GroupManagement';
import CourseManagement from './pages/admin/CourseManagement';
import CourseDetail from './pages/admin/CourseDetail';
import UserManagement from './pages/admin/UserManagement';
import HomeworkManagement from './pages/admin/HomeworkManagement';
import ShopManagement from './pages/admin/ShopManagement';
import EduverseManagement from './pages/admin/EduverseManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Student & General Layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Features */}
            <Route path="shop" element={<Shop />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CoursePlayer />} />
            <Route path="typing" element={<TypingGame />} />
            <Route path="eduverse" element={<Eduverse />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="current-tasks" element={<CurrentTasks />} />
          </Route>

          {/* Teacher Panel */}
          <Route path="/teacher" element={
            <ProtectedRoute role="TEACHER">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="groups" element={<MyGroups />} />
            <Route path="attendance/:groupId" element={<AttendancePage />} />
            <Route path="schedule" element={<TeacherDashboard />} />
          </Route>

          {/* Admin Panel */}
          <Route path="/admin-panel" element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="courses/:courseId" element={<CourseDetail />} />
            <Route path="groups" element={<GroupManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="homework" element={<HomeworkManagement />} />
            <Route path="shop" element={<ShopManagement />} />
            <Route path="eduverse" element={<EduverseManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
