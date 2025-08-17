import React, { useState } from "react";
import SubmissionModal from "./SubmissionModal";

export default function AssignmentsTab({ lessonPlans }) {
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  return (
    <div>
      <h2>Assignments from Lesson Plans</h2>
      {lessonPlans.length === 0 && <p>No assignments yet.</p>}
      <table className="assignments-table">
        <thead>
          <tr>
            <th>Lesson</th>
            <th>Assignment</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {lessonPlans.map((lp) =>
            lp.assignment ? (
              <tr key={lp.id}>
                <td>{lp.strand} - {lp.sub_strand}</td>
                <td>{lp.assignment}</td>
                <td>{lp.due_date || "N/A"}</td>
                <td>
                  <button onClick={() => setSelectedAssignment(lp)}>View Submissions</button>
                </td>
              </tr>
            ) : null
          )}
        </tbody>
      </table>

      {selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
}
