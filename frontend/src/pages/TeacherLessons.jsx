// src/pages/TeacherLessons.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import LessonForm from "../components/forms/LessonForm";

function TeacherLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editLesson, setEditLesson] = useState(null);

  // Fetch lessons
  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("lessons/pp2/");
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setLessons(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch lessons");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Save (Add/Edit)
  const handleSave = async (lessonData) => {
    try {
      if (editLesson) {
        await axiosInstance.put(`lessons/pp2/${editLesson.id}/`, lessonData);
      } else {
        await axiosInstance.post("lessons/pp2/", lessonData);
      }
      setShowForm(false);
      setEditLesson(null);
      fetchLessons();
    } catch (err) {
      setError("Failed to save lesson");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await axiosInstance.delete(`lessons/pp2/${id}/`);
      fetchLessons();
    } catch (err) {
      setError("Failed to delete lesson");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage PP2 Lessons</h1>

      {error && <div className="bg-red-200 text-red-800 p-2 rounded">{error}</div>}

      <div className="mb-4">
        <button
          onClick={() => { setShowForm(true); setEditLesson(null); }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Lesson
        </button>
      </div>

      {loading ? (
        <p>Loading lessons...</p>
      ) : lessons.length === 0 ? (
        <p>No lessons available.</p>
      ) : (
        <table className="w-full border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id}>
                <td className="p-2 border">{lesson.class_name}</td>
                <td className="p-2 border">{lesson.title}</td>
                <td className="p-2 border">{lesson.date}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => { setEditLesson(lesson); setShowForm(true); }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Lesson Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <LessonForm
              initialData={editLesson}
              onSubmit={handleSave}
              onCancel={() => { setShowForm(false); setEditLesson(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherLessons;
