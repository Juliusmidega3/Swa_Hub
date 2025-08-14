import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./Lessons.css";

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("lessons/pp2/") // backend endpoint for PP2 lessons
      .then((res) => {
        setLessons(res.data.results || []); // paginate response
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load lessons. Please login or try again.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading">⏳ Loading lessons...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="lessons-page">
      <h2>📚 PP2 Lessons</h2>
      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card">
            <h3>{lesson.title}</h3>
            <p>{lesson.objective}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lessons;
