import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./Lessons.css";

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await axiosInstance.get("lessons/pp2/");
        console.log("API Response:", res.data); // 🔍 debug

        let data = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data.results) {
          data = res.data.results;
        } else if (res.data.lessons) {
          data = res.data.lessons;
        }

        setLessons(data);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError("⚠️ Failed to load lessons. Please login or try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) return <p className="loading">⏳ Loading lessons...</p>;
  if (error) return <p className="error">{error}</p>;
  if (lessons.length === 0) return <p className="no-data">No lessons found.</p>;

  return (
    <div className="lessons-page">
      <h2>📚 PP2 Lessons</h2>
      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card">
            <h3>{lesson.title || lesson.topic || "Untitled Lesson"}</h3>
            <p>{lesson.objective || lesson.description || "No objective provided."}</p>
            <button
              onClick={() => setSelectedLesson(lesson)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mt-2"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Lesson Details Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
            <button
              onClick={() => setSelectedLesson(null)}
              className="absolute top-2 right-2 text-red-500 font-bold text-xl"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-2">
              {selectedLesson.title || selectedLesson.topic}
            </h3>
            <p className="mb-2">
              <strong>Objective:</strong> {selectedLesson.objective || "No objective provided."}
            </p>
            <p className="mb-2">
              <strong>Description:</strong> {selectedLesson.description || "No description provided."}
            </p>
            <p className="mb-2">
              <strong>Date:</strong> {selectedLesson.date || "N/A"}
            </p>
            <div>
              <strong>Content:</strong>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(selectedLesson.content, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
