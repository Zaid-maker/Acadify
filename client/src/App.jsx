import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import CourseDetail from "./pages/CourseDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import InstructorDashboard from "./pages/InstructorDashboard";
import CourseBuilder from "./pages/CourseBuilder";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorAnalytics from "./pages/InstructorAnalytics";
import InstructorLiveManager from "./pages/InstructorLiveManager";
import InstructorStudents from "./pages/InstructorStudents";
import ForgotPassword from "./pages/ForgotPassword";
import AdminModerationLogs from "./pages/AdminModerationLogs";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/lms" element={<Home />} />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/profile/:id" element={<PublicProfile />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor"
        element={
          <ProtectedRoute allowedRoles={["instructor", "admin"]}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/moderation"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminModerationLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/analytics"
        element={
          <ProtectedRoute allowedRoles={["instructor", "admin"]}>
            <InstructorAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/students"
        element={
          <ProtectedRoute allowedRoles={["instructor", "admin"]}>
            <InstructorStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/live"
        element={
          <ProtectedRoute allowedRoles={["instructor", "admin"]}>
            <InstructorLiveManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/course/:id"
        element={
          <ProtectedRoute allowedRoles={["instructor", "admin"]}>
            <CourseBuilder />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}

export default App;
