import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function TestForm({ onClose, fetchData }) {
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    lesson: "",
    title: "",
    total_marks: 0,
    date: "",
    is_active: true,
  });

  useEffect(() => {
    axiosInstance.get("/lessons/").then((res) => setLessons(res.data));
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axiosInstance.post("/tests/", formData);
    fetchData();
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Create New Test</h3>
        <form onSubmit={handleSubmit}>
          <label>Lesson</label>
          <select name="lesson" value={formData.lesson} onChange={handleChange} required>
            <option value="">Select Lesson</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>

          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />

          <label>Total Marks</label>
          <input type="number" name="total_marks" value={formData.total_marks} onChange={handleChange} required />

          <label>Date</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />

          <label>
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={() => setFormData({...formData, is_active: !formData.is_active})}/>
            Active
          </label>

          <div className="form-buttons">
            <button type="submit">Save Test</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
