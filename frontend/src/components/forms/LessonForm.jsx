// src/components/forms/LessonForm.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const LessonForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    class_name: "",
    title: "",
    objective: "",
    description: "",
    date: "",
    strand: "",
    sub_strand: "",
    content: "{}",
    is_active: true,
  });

  const [strands, setStrands] = useState([]);
  const [subStrands, setSubStrands] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        class_name: initialData.class_name || "",
        title: initialData.title || "",
        objective: initialData.objective || "",
        description: initialData.description || "",
        date: initialData.date || "",
        strand: initialData.strand?.id || "",
        sub_strand: initialData.sub_strand?.id || "",
        content: JSON.stringify(initialData.content || {}, null, 2),
        is_active: initialData.is_active ?? true,
      });
    }

    // Fetch strands for dropdown
    axiosInstance.get("strands/").then((res) => setStrands(res.data)).catch(console.error);
  }, [initialData]);

  useEffect(() => {
    if (formData.strand) {
      axiosInstance
        .get(`sub_strands/?strand=${formData.strand}`)
        .then((res) => setSubStrands(res.data))
        .catch(console.error);
    }
  }, [formData.strand]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let parsedContent;
    try {
      parsedContent = JSON.parse(formData.content);
    } catch (err) {
      alert("Content must be valid JSON!");
      return;
    }

    onSubmit({
      ...formData,
      content: parsedContent,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Class Name</label>
        <input
          type="text"
          name="class_name"
          value={formData.class_name}
          onChange={handleChange}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label>Objective</label>
        <textarea
          name="objective"
          value={formData.objective}
          onChange={handleChange}
          className="form-textarea w-full"
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea w-full"
        />
      </div>

      <div>
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="form-input w-full"
          required
        />
      </div>

      <div>
        <label>Strand</label>
        <select
          name="strand"
          value={formData.strand}
          onChange={handleChange}
          className="form-select w-full"
          required
        >
          <option value="">Select Strand</option>
          {strands.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Sub Strand</label>
        <select
          name="sub_strand"
          value={formData.sub_strand}
          onChange={handleChange}
          className="form-select w-full"
          required
        >
          <option value="">Select Sub Strand</option>
          {subStrands.map((ss) => (
            <option key={ss.id} value={ss.id}>{ss.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Content (JSON)</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          className="form-textarea w-full font-mono"
          rows={6}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <label>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default LessonForm;
