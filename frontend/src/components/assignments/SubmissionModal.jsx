import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function SubmissionModal({ assignment, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/submissions/?assignment_id=${assignment.id}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignment]);

  const handleGradeChange = (id, score) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, score: parseFloat(score) } : sub))
    );
  };

  const handleFeedbackChange = (id, feedback) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, feedback } : sub))
    );
  };

  const handleSave = async (submission) => {
    try {
      await axiosInstance.put(`/submissions/${submission.id}/`, submission);
      alert("Graded successfully!");
    } catch (err) {
      console.error("Error saving grade:", err);
      alert("Error saving grade.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content large-modal">
        <h3>Submissions: {assignment.assignment}</h3>
        <button className="close-btn" onClick={onClose}>✖</button>

        {loading ? (
          <p>Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Answers</th>
                <th>Score</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.student_name || sub.student}</td>
                  <td>
                    <pre>{JSON.stringify(sub.answers, null, 2)}</pre>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={sub.score}
                      onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={sub.feedback || ""}
                      onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSave(sub)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
