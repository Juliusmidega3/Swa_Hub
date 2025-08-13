import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import Tests from "./pages/Tests";
import Results from "./pages/Results";
import TeacherPortal from "./pages/TeacherPortal";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/results" element={<Results />} />
        <Route path="/teacher" element={<TeacherPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
