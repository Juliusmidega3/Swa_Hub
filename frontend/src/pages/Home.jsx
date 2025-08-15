import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "../components/styles/Home.css";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axiosInstance.get("/me/")
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="home">
      <h1>🎉 Welcome, {user.first_name || user.username}!</h1>
      <p>Ready to learn some Swahili today?</p>
      <div className="quick-links">
        <a href="/lessons" className="btn">📚 Go to Lessons</a>
        <a href="/tests" className="btn">📝 Take a Test</a>
      </div>
    </div>
  );
};

export default Home;
