import { Navigate } from "react-router-dom";

export default function RoleRedirect() {
  const role = localStorage.getItem("role");

  if (role === "admin") return <Navigate to="/admin-dashboard" />;
  if (role === "player") return <Navigate to="/player-dashboard" />;
  return <Navigate to="/login" />;
}
