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
import TeacherLessons from "./pages/TeacherLessons"; 
import TeacherLessonPlan from "./pages/TeacherLessonPlan"; // ✅ Lesson Plan page

// Helper component to protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      {/* Navbar appears on all pages */}
      <Navbar />

      {/* Global Toaster (toast notifications work everywhere) */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* Student Lessons */}
        <Route
          path="/lessons"
          element={
            <PrivateRoute>
              <Lessons />
            </PrivateRoute>
          }
        />

        {/* Teacher Lessons */}
        <Route
          path="/teacher-lessons"
          element={
            <PrivateRoute>
              <TeacherLessons />
            </PrivateRoute>
          }
        />

        {/* ✅ Teacher Lesson Plan */}
        <Route
          path="/teacher-lesson-plans"
          element={
            <PrivateRoute>
              <TeacherLessonPlan />
            </PrivateRoute>
          }
        />

        <Route
          path="/tests"
          element={
            <PrivateRoute>
              <Tests />
            </PrivateRoute>
          }
        />

        <Route
          path="/results"
          element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <PrivateRoute>
              <TeacherPortal />
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher-attendance"
          element={
            <PrivateRoute>
              <TeacherAttendance />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
