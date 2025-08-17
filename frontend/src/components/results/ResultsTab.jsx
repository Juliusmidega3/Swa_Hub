import React from "react";

export default function ResultsTab({ results }) {
  return (
    <div>
      <h2>Student Results</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Student</th>
            <th>Score</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id}>
              <td>{r.test_title}</td>
              <td>{r.student_name}</td>
              <td>{r.score}</td>
              <td>{r.feedback || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
