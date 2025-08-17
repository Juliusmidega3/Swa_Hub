import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast, Toaster } from "react-hot-toast";

export default function TeacherAttendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/students/");
      setStudents(response.data.results || []); // paginated response safe
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("❌ Failed to load students.");
    }
  };

  // Fetch today's attendance
  const fetchAttendance = async () => {
    try {
      const response = await axiosInstance.get("/attendance/today/");
      const todayRecords = response.data;
      const attendanceDict = {};
      todayRecords.forEach((rec) => {
        attendanceDict[rec.student] = rec.is_present;
      });
      setAttendance(attendanceDict);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("❌ Failed to load attendance.");
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await fetchStudents();
      await fetchAttendance();
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Toggle attendance locally
  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Save attendance
  const saveAttendance = async () => {
    try {
      const payload = students.map((s) => ({
        student: s.id,
        is_present: !!attendance[s.id],
      }));

      await axiosInstance.post("/attendance/", payload);
      toast.success("✅ Attendance saved successfully!");
    } catch (err) {
      console.error("Error saving attendance:", err);
      toast.error("❌ Failed to save attendance. Try again.");
    }
  };

  if (loading) return <p className="text-center mt-10 animate-pulse">⏳ Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!students.length) return <p className="text-center mt-10">No students found.</p>;

  return (
    <div className="p-6 m-">
      <Toaster position="top-center" />

      <h1 className="text-3xl font-bold text-center mb-6 text-green-700">
        📋 Attendance Register
      </h1>

      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Student Name</th>
              <th className="py-3 px-4 text-center font-semibold">Present</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr
                key={student.id}
                className={`${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-green-50 transition`}
              >
                <td className="py-2 px-4">{student.full_name}</td>
                <td className="py-2 px-4 text-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-green-600"
                    checked={!!attendance[student.id]}
                    onChange={() => toggleAttendance(student.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={saveAttendance}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          💾 Save Attendance
        </button>
      </div>
    </div>
  );
}
