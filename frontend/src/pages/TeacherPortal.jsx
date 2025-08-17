// src/pages/TeacherPortal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "../components/styles/TeacherPortal.css";

export default function TeacherPortal() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentLessons, setRecentLessons] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [recentResults, setRecentResults] = useState([]);

  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/teacher/dashboard-stats/");
      setStats(response.data);

      // Also store recent items
      setRecentLessons(response.data.recent_lessons || []);
      setRecentTests(response.data.recent_tests || []);
      setRecentResults(response.data.recent_results || []);

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Failed to load dashboard data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p className="teacher-portal">⏳ Loading dashboard...</p>;
  if (error) return <p className="teacher-portal" style={{ color: "red" }}>{error}</p>;

  return (
    <div className="teacher-portal">
      <h1>🎓 Teacher Portal</h1>
      <p>Manage lessons, tests, assignments, attendance, and student progress.</p>

      {/* Main Stats */}
      <div className="stats-grid">
        <StatCard
          title="Lessons"
          total={stats.total.lessons_count}
          pp2={stats.pp2.lessons_count}
          color="blue"
          onClick={() => navigate("/teacher-lessons")}
        />
        <StatCard
          title="Tests"
          total={stats.total.tests_count}
          pp2={stats.pp2.tests_count}
          color="green"
          onClick={() => navigate("/teacher-tests")}
        />
        <StatCard
          title="Results"
          total={stats.total.results_count}
          pp2={stats.pp2.results_count}
          color="yellow"
          onClick={() => navigate("/teacher-results")}
        />
      </div>

      {/* Feature Sections */}
      <div className="feature-grid">
        <FeatureCard
          title="📋 Attendance Management"
          description="Mark attendance daily and track student attendance."
          onClick={() => navigate("/teacher-attendance")}
        />
        <FeatureCard
          title="📝 Lesson Planning"
          description="Plan weekly/monthly lessons with resources."
          onClick={() => navigate("/teacher-assignments-tests")}
        />
        <FeatureCard
          title="🖊️ Assignments & Tests"
          description="Create assignments or tests and auto-grade where possible."
          onClick={() => navigate("/teacher-assignments")}
        />
        <FeatureCard
          title="📈 Student Progress"
          description="Track student performance and identify who needs help."
          onClick={() => navigate("/teacher-progress")}
        />
        <FeatureCard
          title="📨 Parent Communication"
          description="Send quick updates to parents about student performance."
          onClick={() => navigate("/teacher-parents")}
        />
        <FeatureCard
          title="📄 Reports"
          description="Generate and download progress, attendance, and results reports."
          onClick={() => navigate("/teacher-reports")}
        />
        <FeatureCard
          title="🏆 Rewards & Badges"
          description="Reward students for good performance and completion."
          onClick={() => navigate("/teacher-rewards")}
        />
      </div>

      {/* Recent Section */}
      <div className="recent-section">
        {recentLessons.length > 0 && (
          <>
            <h2>Recent Lessons</h2>
            <ul>
              {recentLessons.map(l => <li key={l.id}>{l.title}</li>)}
            </ul>
          </>
        )}
        {recentTests.length > 0 && (
          <>
            <h2>Recent Tests</h2>
            <ul>
              {recentTests.map(t => <li key={t.id}>{t.title} - {t.lesson}</li>)}
            </ul>
          </>
        )}
        {recentResults.length > 0 && (
          <>
            <h2>Recent Results</h2>
            <ul>
              {recentResults.map(r => (
                <li key={r.id}>{r.student_name} - {r.test} - Score: {r.score}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// Reusable stat card
function StatCard({ title, total, pp2, color, onClick }) {
  return (
    <div className={`stat-card ${color}`} onClick={onClick}>
      <h2>{title}</h2>
      <p>Total: {total}</p>
      <p>PP2: {pp2}</p>
      <button className="btn">View {title}</button>
    </div>
  );
}

// Reusable feature card
function FeatureCard({ title, description, onClick }) {
  return (
    <div className="feature-card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
