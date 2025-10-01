// src/routes/PlayerRoutes.jsx
import { Routes, Route } from "react-router-dom";
import PlayerDashboard from "../components/PlayerDashboard";
import PrivateRoute from "./PrivateRoute";

export default function PlayerRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <PrivateRoute allowedRole="player">
            <PlayerDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
