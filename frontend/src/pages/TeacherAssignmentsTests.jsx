import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import "../components/styles/TeacherAssignmentsTests.css";
import AssignmentsTab from "../components/assignments/AssignmentsTab";
import TestsTab from "../components/tests/TestsTab";
import ResultsTab from "../components/results/ResultsTab";

function TeacherAssignmentsTests() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [lessonPlans, setLessonPlans] = useState([]);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lpRes, testsRes, resultsRes] = await Promise.all([
        axiosInstance.get("/lesson-plans/"),
        axiosInstance.get("/tests/"),
        axiosInstance.get("/results/"),
      ]);
      setLessonPlans(lpRes.data);
      setTests(testsRes.data);
      setResults(resultsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>⏳ Loading Assignments & Tests...</p>;

  return (
    <div className="teacher-at-container">
      <h1>📝 Assignments & Tests</h1>
      <div className="tab-buttons">
        <button
          className={activeTab === "assignments" ? "active" : ""}
          onClick={() => setActiveTab("assignments")}
        >
          Assignments
        </button>
        <button
          className={activeTab === "tests" ? "active" : ""}
          onClick={() => setActiveTab("tests")}
        >
          Tests
        </button>
        <button
          className={activeTab === "results" ? "active" : ""}
          onClick={() => setActiveTab("results")}
        >
          Results
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "assignments" && (
          <AssignmentsTab lessonPlans={lessonPlans} />
        )}
        {activeTab === "tests" && <TestsTab tests={tests} fetchData={fetchData} />}
        {activeTab === "results" && <ResultsTab results={results} />}
      </div>
    </div>
  );
}


export default TeacherAssignmentsTests