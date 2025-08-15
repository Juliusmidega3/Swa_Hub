import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import CountUp from "react-countup";
import Confetti from "react-confetti";
import { FaBook, FaPencilAlt, FaChalkboardTeacher, FaTrophy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/dashboard-data/")
      .then((res) => {
        setData(res.data);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      {showConfetti && <Confetti />}
      <h2>📊 Dashboard Overview</h2>
      <div className="cards">
        <div className="card lessons" onClick={() => navigate("/lessons")}>
          <div className="icon"><FaBook /></div>
          <h3>📚 Lessons</h3>
          <p><CountUp end={data.lessonsCount} duration={1.5} /></p>
        </div>

        <div className="card tests" onClick={() => navigate("/tests")}>
          <div className="icon"><FaPencilAlt /></div>
          <h3>📝 Tests</h3>
          <p><CountUp end={data.testsCount} duration={1.5} /></p>
        </div>

        <div className="card teachers" onClick={() => navigate("/teacher")}>
          <div className="icon"><FaChalkboardTeacher /></div>
          <h3>👩‍🏫 Teachers</h3>
          <p><CountUp end={data.teachersCount} duration={1.5} /></p>
        </div>

        <div className="card results" onClick={() => navigate("/results")}>
          <div className="icon"><FaTrophy /></div>
          <h3>🏆 Results</h3>
          <p><CountUp end={data.resultsCount || 0} duration={1.5} /></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
