import { Routes, Route, Navigate } from "react-router-dom";
import RoleRedirect from "../components/RoleRedirect";
import LoginForm from "../components/LoginForm";
import AdminDashboard from "../components/AdminDashboard";
import PlayerDashboard from "../components/PlayerDashboard";
import PrivateRoute from "./PrivateRoute";
import DynamicErrorPage from "../components/DynamicErrorPage";
import CreateAccountForm from "../components/CreateAccountForm";
import Event from "../components/Events";
import PlayerEvents from "../components/PlayerEvents";
import PlayerList from "../components/PlayerList";
import AdminProfile from "../components/AdminProfile";
import PlayerProfile from "../components/PlayerProfil";

export default function AppRoutes({ onLoginSuccess }) {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route
        path="/login"
        element={<LoginForm onLoginSuccess={onLoginSuccess} />}
      />
      <Route path="/create-account" element={<CreateAccountForm />} />
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/player-dashboard"
        element={
          <PrivateRoute allowedRole="player">
            <PlayerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="admin/events"
        element={
          <PrivateRoute allowedRole="admin">
            <Event />
          </PrivateRoute>
        }
      />
      <Route
        path="/players/events"
        element={
          <PrivateRoute allowedRole="player">
            <PlayerEvents />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/mes-joueurs"
        element={
          <PrivateRoute allowedRole="admin">
            <PlayerList />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/profil"
        element={
          <PrivateRoute allowedRole="admin">
            <AdminProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/joueur/profil"
        element={
          <PrivateRoute allowedRole="player">
            <PlayerProfile />
          </PrivateRoute>
        }
      />
      <Route path="/error" element={<DynamicErrorPage />} />
      <Route path="/unauthorized" element={<DynamicErrorPage />} />
      <Route path="*" element={<DynamicErrorPage />} />
    </Routes>
  );
}
