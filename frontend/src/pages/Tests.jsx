import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "../components/styles/Tests.css";

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("assignments/") // fetch all assignments from backend
      .then((res) => {
        setTests(res.data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load tests. Please login or try again.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading">⏳ Loading tests...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="tests-page">
      <h2>📝 PP2 Tests</h2>
      <div className="tests-grid">
        {tests.map((test) => (
          <div key={test.id} className="test-card">
            <h3>{test.title}</h3>
            <p>{test.instructions || "No instructions provided"}</p>
            <button onClick={() => alert("Test feature coming soon! 🎯")}>
              Start Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tests;
