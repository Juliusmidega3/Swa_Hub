import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import "../components/styles/TeacherLessonPlan.css";

const TeacherLessonPlan = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("strand");
  const [sortAsc, setSortAsc] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);
  const textAreasRef = useRef({});

  const [formData, setFormData] = useState({
    strand: "",
    sub_strand: "",
    general_outcome: "",
    specific_outcome_1: "",
    specific_outcome_2: "",
    specific_outcome_3: "",
    enquiry_question: "",
    introduction: "",
    lesson_development: "",
    conclusion: "",
    reflection: "",
    assignment: "",
  });

  useEffect(() => {
    axiosInstance
      .get("/lesson-plans/")
      .then((res) => {
        if (Array.isArray(res.data)) setLessonPlans(res.data);
        else if (res.data.results && Array.isArray(res.data.results))
          setLessonPlans(res.data.results);
        else setLessonPlans([]);
      })
      .catch(() => toast.error("Failed to load lesson plans"));
  }, []);

  // Auto-resize textareas
  useEffect(() => {
    Object.values(textAreasRef.current).forEach((ta) => {
      if (ta) {
        ta.style.height = "auto";
        ta.style.height = `${ta.scrollHeight}px`;
      }
    });
  }, [formData, showForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = editingId
      ? axiosInstance.put(`lesson-plans/${editingId}/`, formData)
      : axiosInstance.post("lesson-plans/", formData);

    request
      .then((res) => {
        toast.success(editingId ? "Lesson plan updated!" : "Lesson plan created!");
        setLessonPlans((prev) =>
          editingId
            ? prev.map((plan) => (plan.id === editingId ? res.data : plan))
            : [...prev, res.data]
        );
        resetForm();
      })
      .catch(() => toast.error(editingId ? "Error updating plan" : "Error creating plan"));
  };

  const handleCancel = () => resetForm();

  const resetForm = () => {
    setFormData({
      strand: "",
      sub_strand: "",
      general_outcome: "",
      specific_outcome_1: "",
      specific_outcome_2: "",
      specific_outcome_3: "",
      enquiry_question: "",
      introduction: "",
      lesson_development: "",
      conclusion: "",
      reflection: "",
      assignment: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (plan) => {
    setFormData({ ...plan });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lesson plan?")) {
      axiosInstance
        .delete(`lesson-plans/${id}/`)
        .then(() => {
          toast.success("Lesson plan deleted!");
          setLessonPlans((prev) => prev.filter((plan) => plan.id !== id));
        })
        .catch(() => toast.error("Error deleting lesson plan"));
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const displayedPlans = lessonPlans
    .filter(
      (plan) =>
        plan.strand.toLowerCase().includes(search.toLowerCase()) ||
        plan.general_outcome.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="lessonplan-container">
      <div className="title-row">
        <h2 className="title">📘 Teacher Lesson Plans</h2>
        <button
          className="create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : editingId ? "Edit Lesson Plan" : "Create Lesson Plan"}
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search lesson plans..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 rounded-lg border border-gray-300 outline-none"
      />

      {/* Lesson Plans Table */}
      <div className="lesson-list">
        <table className="lesson-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("strand")}>
                Strand {sortKey === "strand" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => toggleSort("sub_strand")}>
                Sub-Strand {sortKey === "sub_strand" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => toggleSort("general_outcome")}>
                Outcome {sortKey === "general_outcome" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedPlans.length > 0 ? (
              displayedPlans.map((plan) => (
                <React.Fragment key={plan.id}>
                  <tr onClick={() => toggleRow(plan.id)} className="clickable-row">
                    <td>{plan.strand}</td>
                    <td>{plan.sub_strand}</td>
                    <td>{plan.general_outcome}</td>
                    <td>
                      <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEdit(plan); }}>Edit</button>
                      <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}>Delete</button>
                    </td>
                  </tr>
                  {expandedRows.includes(plan.id) && (
                    <tr className="expanded-row">
                      <td colSpan="4">
                        <div className="expanded-content">
                          <p><strong>Specific Outcomes:</strong> {plan.specific_outcome_1}, {plan.specific_outcome_2}, {plan.specific_outcome_3}</p>
                          <p><strong>Enquiry Question:</strong> {plan.enquiry_question}</p>
                          <p><strong>Introduction:</strong> {plan.introduction}</p>
                          <p><strong>Lesson Development:</strong> {plan.lesson_development}</p>
                          <p><strong>Conclusion:</strong> {plan.conclusion}</p>
                          <p><strong>Reflection:</strong> {plan.reflection}</p>
                          <p><strong>Assignment:</strong> {plan.assignment}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-msg">
                  No lesson plans found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lesson Plan Form */}
      <div className={`form-container ${showForm ? "slide-down" : "slide-up"}`}>
        <div className="form-card">
          <h3>{editingId ? "Edit Lesson Plan" : "Create New Lesson Plan"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              {Object.keys(formData).map((field) => (
                <div key={field} className="flex flex-col">
                  <label>{field.replaceAll("_", " ")}</label>
                  {["lesson_development", "introduction", "conclusion", "assignment", "reflection"].includes(field) ? (
                    <textarea
                      ref={(el) => (textAreasRef.current[field] = el)}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingId ? "Save Changes" : "Save Lesson Plan"}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherLessonPlan;
