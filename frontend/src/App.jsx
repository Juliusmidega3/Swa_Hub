import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import Tests from "./pages/Tests";
import Results from "./pages/Results";
import TeacherPortal from "./pages/TeacherPortal";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import TeacherAttendance from "./pages/TeacherAttendance";
import { Toaster } from "react-hot-toast";

// Teacher pages
import TeacherLessons from "./pages/TeacherLessons"; 
import TeacherLessonPlan from "./pages/TeacherLessonPlan";
import TeacherAssignmentsTests from "./pages/TeacherAssignmentsTests"; // ✅ New page

// Helper component to protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Student Pages */}
        <Route path="/lessons" element={<PrivateRoute><Lessons /></PrivateRoute>} />
        <Route path="/tests" element={<PrivateRoute><Tests /></PrivateRoute>} />
        <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />

        {/* Teacher Pages */}
        <Route path="/teacher" element={<PrivateRoute><TeacherPortal /></PrivateRoute>} />
        <Route path="/teacher-lessons" element={<PrivateRoute><TeacherLessons /></PrivateRoute>} />
        <Route path="/teacher-lesson-plans" element={<PrivateRoute><TeacherLessonPlan /></PrivateRoute>} />
        <Route path="/teacher-assignments-tests" element={<PrivateRoute><TeacherAssignmentsTests /></PrivateRoute>} />
        <Route path="/teacher-attendance" element={<PrivateRoute><TeacherAttendance /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
