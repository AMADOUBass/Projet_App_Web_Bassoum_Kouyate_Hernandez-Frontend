import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function PlayerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleEvent = useCallback(() => {
    navigate("/players/events");
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Accueil du Joueur ⚽</h1>
      <p>Bienvenue, Joueur! Prêt à jouer?</p>
    </div>
  );
}
