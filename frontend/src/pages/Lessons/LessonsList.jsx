import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./LessonForm.css"; // optional styling

const LessonForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    class_name: "",
    description: "",
    date: "",
    strand: "",
    sub_strand: "",
    title: "",
    objective: "",
    content: "{}",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    axiosInstance
      .post("lessons/", formData)
      .then((res) => {
        setSuccess("✅ Lesson created successfully!");
        setFormData({
          class_name: "",
          description: "",
          date: "",
          strand: "",
          sub_strand: "",
          title: "",
          objective: "",
          content: "{}",
          is_active: true,
        });
        if (onSuccess) onSuccess(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("❌ Failed to create lesson. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <form className="lesson-form" onSubmit={handleSubmit}>
      <h3>Create a New Lesson</h3>

      <label>Class Name:</label>
      <input name="class_name" value={formData.class_name} onChange={handleChange} required />

      <label>Description:</label>
      <textarea name="description" value={formData.description} onChange={handleChange} />

      <label>Date:</label>
      <input type="date" name="date" value={formData.date} onChange={handleChange} required />

      <label>Strand:</label>
      <input name="strand" value={formData.strand} onChange={handleChange} required />

      <label>Sub Strand:</label>
      <input name="sub_strand" value={formData.sub_strand} onChange={handleChange} required />

      <label>Title:</label>
      <input name="title" value={formData.title} onChange={handleChange} required />

      <label>Objective:</label>
      <textarea name="objective" value={formData.objective} onChange={handleChange} />

      <label>Content (JSON):</label>
      <textarea name="content" value={formData.content} onChange={handleChange} />

      <label>
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
        />
        Active
      </label>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Lesson"}
      </button>
    </form>
  );
};

export default LessonForm;
