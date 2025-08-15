import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./Results.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect (
    () => {
      axiosInstance.get("submissions/")
      .then((res) => {
        console.log("Raw API response:", res.data)

        const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];

      setResults(data);
      })
      .catch ((err) => {
        console.err("Error fetching results:", err);
        setResults([]);
      })
      .finally(() => setLoading(false))
    }, []);

  if (loading) return <p className="loading">⏳ Loading results...</p>;

  return (
    <div className="results-page">
      <h2>🏆 My Results</h2>
      {results.length === 0 ? (
        <p className="no-results">No results yet. Complete some lessons! 📚</p>
      ) : (
        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Score</th>
                <th>Feedback</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res) => (
                <tr key={res.id}>
                  <td>{res.lesson_title}</td>
                  <td>
                    {res.score} / {res.total}
                  </td>
                  <td>{res.feedback || "No feedback"}</td>
                  <td>{new Date(res.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Results;
