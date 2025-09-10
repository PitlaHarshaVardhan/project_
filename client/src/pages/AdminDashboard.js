import React, { useEffect, useState } from "react";
import API from "../utils/api";

const getUser = () => JSON.parse(localStorage.getItem("user"));

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [pageMeta, setPageMeta] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "MERN Bootcamp",
  });
  const [search, setSearch] = useState("");
  const [editStudent, setEditStudent] = useState(null);

  const fetchStudents = async (page = 1) => {
    try {
      const res = await API.get(
        `/students?page=${page}&limit=10&search=${search}`
      );
      setStudents(res.data.students);
      setPageMeta(res.data.meta);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post("/students", form);
      setForm({ name: "", email: "", course: "MERN Bootcamp" });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete student?")) return;
    try {
      await API.delete(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const updateStudent = async () => {
    try {
      await API.put(`/students/${editStudent._id}`, editStudent);
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/students/export/csv", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // important for downloading files
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide">
          Admin Dashboard
        </h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-5 py-2 rounded-lg shadow hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Add Student Form */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Add Student
        </h3>
        <form onSubmit={addStudent} className="flex gap-3 flex-wrap">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Name"
            required
            className="border p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            required
            className="border p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="course"
            value={form.course}
            onChange={onChange}
            placeholder="Course"
            className="border p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Add
          </button>
        </form>
      </div>

      {/* Search & Export */}
      <div className="flex justify-between mb-4">
        <input
          placeholder="Search by name..."
          className="border p-2 rounded-lg w-1/3 focus:ring-2 focus:ring-green-400"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={exportCSV}
          className="bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition"
        >
          Export CSV
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Course
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Enrollment
              </th>
              <th className="p-3 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.course}</td>
                <td className="p-3 text-gray-600">
                  {new Date(s.enrollmentDate).toLocaleDateString()}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => setEditStudent(s)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteStudent(s._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-4 items-center">
        <button
          disabled={pageMeta.page <= 1}
          onClick={() => fetchStudents(pageMeta.page - 1)}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
        >
          Prev
        </button>
        <span className="font-medium text-gray-700">
          Page {pageMeta.page || 1} of {pageMeta.pages || 1}
        </span>
        <button
          disabled={pageMeta.page >= pageMeta.pages}
          onClick={() => fetchStudents((pageMeta.page || 1) + 1)}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
        >
          Next
        </button>
      </div>

      {/* Clear All */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={async () => {
            if (!window.confirm("Clear ALL students?")) return;
            await API.delete("/students");
            fetchStudents();
          }}
          className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Clear All Students
        </button>
      </div>

      {/* Edit Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center transition">
          <div className="bg-white p-6 rounded-xl shadow-xl w-1/3">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Edit Student
            </h3>
            <input
              value={editStudent.name}
              onChange={(e) =>
                setEditStudent({ ...editStudent, name: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <input
              value={editStudent.course}
              onChange={(e) =>
                setEditStudent({ ...editStudent, course: e.target.value })
              }
              className="border p-2 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditStudent(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={updateStudent}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
