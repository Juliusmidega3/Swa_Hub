import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import CountUp from "react-countup";
import Confetti from "react-confetti";
import { FaBook, FaPencilAlt, FaChalkboardTeacher } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

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
        <div className="card lessons">
          <div className="icon"><FaBook /></div>
          <h3>📚 Lessons</h3>
          <p><CountUp end={data.lessonsCount} duration={1.5} /></p>
        </div>
        <div className="card tests">
          <div className="icon"><FaPencilAlt /></div>
          <h3>📝 Tests</h3>
          <p><CountUp end={data.testsCount} duration={1.5} /></p>
        </div>
        <div className="card teachers">
          <div className="icon"><FaChalkboardTeacher /></div>
          <h3>👩‍🏫 Teachers</h3>
          <p><CountUp end={data.teachersCount} duration={1.5} /></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
