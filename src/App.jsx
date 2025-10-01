// src/App.jsx
import { useState } from "react";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access") || ""
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh") || ""
  );

  const handleLoginSuccess = (access, refresh, role) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("role", role);
    toast.success("Connexion réussie !");

    // ✅ Navigate based on role
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "player") {
      navigate("/player-dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="App">
      <AppRoutes onLoginSuccess={handleLoginSuccess} />
      <Toaster />
      {/* <button
        onClick={() =>
          navigate("/error", {
            state: { code: 404, message: "Test 404 page" },
          })
        }>
        Test 404
      </button> */}
    </div>
  );
}

export default App;
