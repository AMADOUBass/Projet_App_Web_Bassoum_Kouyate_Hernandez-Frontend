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
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Se déconnecter
      </button>
      <button
        onClick={handleEvent}
        className="mt-4 ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Evenements
      </button>
    </div>
  );
}
