import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRole }) {
  const accessToken = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  // If no access token → send back to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // If token exists but role doesn't match → unauthorized page
  if (role !== allowedRole) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ message: "Vous n'êtes pas autorisé à accéder à cette page." }}
      />
    );
  }

  return children;
}
