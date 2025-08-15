// src/pages/TeacherPortal.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function TeacherPortal() {
  const [stats, setStats] = useState({ lessons: 0, tests: 0, results: 0 });
  const [recentLessons, setRecentLessons] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsRes = await axiosInstance.get("teacher/dashboard-stats/");
        setStats(statsRes.data);

        const lessonsRes = await axiosInstance.get("lessons/pp2/?recent=5");
        setRecentLessons(lessonsRes.data.results || lessonsRes.data);

        const testsRes = await axiosInstance.get("tests/pp2/?recent=5");
        setRecentTests(testsRes.data.results || testsRes.data);

        const resultsRes = await axiosInstance.get("results/pp2/?recent=5");
        setRecentResults(resultsRes.data.results || resultsRes.data);

        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      }
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  if (loading) return <p>⏳ Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Teacher Portal Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-200 rounded shadow">
          <h2 className="text-xl font-semibold">Lessons</h2>
          <p className="text-2xl">{stats.lessons}</p>
        </div>
        <div className="p-4 bg-green-200 rounded shadow">
          <h2 className="text-xl font-semibold">Tests</h2>
          <p className="text-2xl">{stats.tests}</p>
        </div>
        <div className="p-4 bg-yellow-200 rounded shadow">
          <h2 className="text-xl font-semibold">Results</h2>
          <p className="text-2xl">{stats.results}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => window.location.href = "/teacher-lessons"}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Manage Lessons
        </button>
        <button
          onClick={() => window.location.href = "/tests"}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Manage Tests
        </button>
        <button
          onClick={() => window.location.href = "/results"}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          View Results
        </button>
      </div>

      {/* Recent Lessons */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Recent Lessons</h2>
        {recentLessons.length === 0 ? (
          <p>No recent lessons.</p>
        ) : (
          <ul className="list-disc pl-5">
            {recentLessons.map((lesson) => (
              <li key={lesson.id}>
                {lesson.title} ({lesson.date})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Tests */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Recent Tests</h2>
        {recentTests.length === 0 ? (
          <p>No recent tests.</p>
        ) : (
          <ul className="list-disc pl-5">
            {recentTests.map((test) => (
              <li key={test.id}>
                {test.title} ({test.date})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Results */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Recent Student Results</h2>
        {recentResults.length === 0 ? (
          <p>No recent results.</p>
        ) : (
          <ul className="list-disc pl-5">
            {recentResults.map((result) => (
              <li key={result.id}>
                {result.student_name}: {result.score} / {result.total} ({result.date})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
