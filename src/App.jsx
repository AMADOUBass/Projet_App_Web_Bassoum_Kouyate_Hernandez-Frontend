// src/App.jsx
import { useState, useEffect } from "react";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import NavBar from "./components/NavBar";  
import axiosInstance from "./utils/axiosInstance";

function App() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access") || "");
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh") || "");
  const [user, setUser] = useState(null);

  // Fetch user on mount (si token)
  useEffect(() => {
    if (accessToken) {
      axiosInstance.get("/auth/current-user/")
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.clear();
          setUser(null);
        });
    }
  }, [accessToken]);

  const handleLoginSuccess = (access, refresh, role) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("role", role);
    toast.success("Connexion réussie !");
    // Fetch user after login
    axiosInstance.get("/auth/current-user/").then(res => setUser(res.data));
  };

  const handleLogout = () => {
    setAccessToken("");
    setRefreshToken("");
    setUser(null);
    localStorage.clear();
    toast.success("Déconnexion réussie !");
  };

  return (
    <div className="App">
      {user && <NavBar user={user} onLogout={handleLogout} />} 
      <AppRoutes onLoginSuccess={handleLoginSuccess} />
      <Toaster />
    </div>
  );
}

export default App;