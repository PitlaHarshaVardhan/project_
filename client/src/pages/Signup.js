import React, { useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const nav = useNavigate();
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/signup", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user.role === "admin") nav("/admin");
      else nav("/student");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sign Up</h2>
      <form onSubmit={submit}>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Name"
          required
        />
        <br />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          required
        />
        <br />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          required
        />
        <br />
        <select name="role" value={form.role} onChange={onChange}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <br />
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
