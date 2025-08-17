import React, { useState } from "react";
import TestForm from "./TestForm";

export default function TestsTab({ tests, fetchData }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="tests-header">
        <h2>Tests</h2>
        <button onClick={() => setShowForm(true)}>➕ Create Test</button>
      </div>

      {showForm && <TestForm onClose={() => setShowForm(false)} fetchData={fetchData} />}

      <table className="tests-table">
        <thead>
          <tr>
            <th>Lesson</th>
            <th>Title</th>
            <th>Total Marks</th>
            <th>Date</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((t) => (
            <tr key={t.id}>
              <td>{t.lesson_title}</td>
              <td>{t.title}</td>
              <td>{t.total_marks}</td>
              <td>{t.date}</td>
              <td>{t.is_active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
