import React, { useEffect, useState } from "react";
import API from "../utils/api";

export default function StudentDashboard() {
  const [student, setStudent] = useState({});
  const [file, setFile] = useState(null);

  const fetchMe = async () => {
    const res = await API.get("/students/me");
    setStudent(res.data);
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const uploadPic = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("profilePic", file);
    await API.post("/students/me/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fetchMe();
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Student Dashboard</h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-semibold mb-4">Profile</h3>
        <p>
          <strong>Name:</strong> {student.name}
        </p>
        <p>
          <strong>Email:</strong> {student.email}
        </p>
        <p>
          <strong>Course:</strong> {student.course}
        </p>
        {student.profilePic && (
          <img
            src={`http://localhost:5000${student.profilePic}`}
            alt="profile"
            className="mt-3 w-32 h-32 rounded-full object-cover shadow"
          />
        )}
      </div>

      <form
        onSubmit={uploadPic}
        className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-3"
      >
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded-lg"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Upload Picture
        </button>
      </form>
    </div>
  );
}
