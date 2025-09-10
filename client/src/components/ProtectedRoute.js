import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const getUserFromStorage = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export default function ProtectedRoute({ allowedRoles = [] }) {
  const user = getUserFromStorage();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return <Outlet />;
}
