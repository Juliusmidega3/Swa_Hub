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
import TeacherLessons from "./pages/TeacherLessons"; // ⬅️ import the new teacher lessons page

// Helper component to protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
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
