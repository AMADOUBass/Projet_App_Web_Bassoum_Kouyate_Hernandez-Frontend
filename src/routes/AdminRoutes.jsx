// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";
import PrivateRoute from "./PrivateRoute";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute allowedRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
